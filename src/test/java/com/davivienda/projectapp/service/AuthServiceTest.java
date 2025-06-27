package com.davivienda.projectapp.service;

import com.davivienda.projectapp.dto.AuthRequest;
import com.davivienda.projectapp.dto.AuthResponse;
import com.davivienda.projectapp.dto.RegisterRequest;
import com.davivienda.projectapp.model.RefreshToken;
import com.davivienda.projectapp.model.Role;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.repository.RefreshTokenRepository;
import com.davivienda.projectapp.repository.RoleRepository;
import com.davivienda.projectapp.repository.UserRepository;
import com.davivienda.projectapp.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @InjectMocks private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@email.com");
        request.setPassword("password");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("test@email.com")).thenReturn(Optional.empty());
        Role userRole = Role.builder().id(1L).name("USER").build();
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("password")).thenReturn("encoded");
        when(jwtUtil.generateToken("testuser")).thenReturn("jwt-token");
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);
        assertEquals("jwt-token", response.getToken());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    void login_success() {
        AuthRequest request = new AuthRequest();
        request.setUsernameOrEmail("testuser");
        request.setPassword("password");

        User user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@email.com")
                .password("encoded")
                .roles(Collections.singleton(Role.builder().id(1L).name("USER").build()))
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("testuser")).thenReturn("jwt-token");
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.login(request);
        assertEquals("jwt-token", response.getToken());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    void refreshToken_success() {
        User user = User.builder().id(1L).username("testuser").build();
        RefreshToken refreshToken = RefreshToken.builder()
                .id(1L)
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusSeconds(60))
                .build();
        when(refreshTokenRepository.findByToken(refreshToken.getToken())).thenReturn(Optional.of(refreshToken));
        when(jwtUtil.generateToken("testuser")).thenReturn("new-jwt-token");

        AuthResponse response = authService.refreshToken(refreshToken.getToken());
        assertEquals("new-jwt-token", response.getToken());
        assertEquals(refreshToken.getToken(), response.getRefreshToken());
    }

    @Test
    void refreshToken_expired() {
        User user = User.builder().id(1L).username("testuser").build();
        RefreshToken refreshToken = RefreshToken.builder()
                .id(1L)
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().minusSeconds(60))
                .build();
        when(refreshTokenRepository.findByToken(refreshToken.getToken())).thenReturn(Optional.of(refreshToken));

        assertThrows(RuntimeException.class, () -> authService.refreshToken(refreshToken.getToken()));
        verify(refreshTokenRepository).delete(refreshToken);
    }
} 