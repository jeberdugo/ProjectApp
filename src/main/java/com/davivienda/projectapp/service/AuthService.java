package com.davivienda.projectapp.service;

import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshTokenDurationMs = 7 * 24 * 60 * 60 * 1000; // 7 días

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username no puede estar vacío");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email no puede estar vacío");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password no puede estar vacío");
        }
        
        if (userRepository.findByUsername(request.getUsername()).isPresent() ||
            userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Usuario o email ya existe");
        }
        
        // Verificar si es el primer usuario (será ADMIN)
        boolean isFirstUser = userRepository.count() == 0;
        
        Role userRole = isFirstUser ? 
            roleRepository.findByName("ADMIN").orElseGet(() -> roleRepository.save(Role.builder().name("ADMIN").build())) :
            roleRepository.findByName("USER").orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));
            
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Collections.singleton(userRole))
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getUsername());
        String refreshToken = createRefreshToken(user);
        return new AuthResponse(token, refreshToken);
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        if (request.getUsernameOrEmail() == null || request.getUsernameOrEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Username o email no puede estar vacío");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password no puede estar vacío");
        }
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        String token = jwtUtil.generateToken(username);
        String refreshToken = createRefreshToken(user);
        return new AuthResponse(token, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token inválido"));
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new IllegalArgumentException("Refresh token expirado");
        }
        String newAccessToken = jwtUtil.generateToken(token.getUser().getUsername());
        return new AuthResponse(newAccessToken, refreshToken);
    }

    @Transactional
    private String createRefreshToken(User user) {
        // Eliminar todos los refresh tokens existentes para este usuario de manera directa
        refreshTokenRepository.deleteAllByUser(user);
        
        String token = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .build();
        refreshTokenRepository.save(refreshToken);
        return token;
    }
} 