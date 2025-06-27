package com.davivienda.projectapp.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import com.davivienda.projectapp.dto.AuthRequest;
import com.davivienda.projectapp.dto.AuthResponse;
import com.davivienda.projectapp.dto.RefreshTokenRequest;
import com.davivienda.projectapp.dto.RegisterRequest;
import com.davivienda.projectapp.service.AuthService;

public class AuthControllerTest {
    @Mock private AuthService authService;
    @InjectMocks private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest();
        AuthResponse resp = new AuthResponse("token", "refresh");
        when(authService.register(req)).thenReturn(resp);
        ResponseEntity<?> response = authController.register(req);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testRegisterConflict() {
        RegisterRequest req = new RegisterRequest();
        when(authService.register(req)).thenThrow(new RuntimeException("error"));
        ResponseEntity<?> response = authController.register(req);
        assertEquals(409, response.getStatusCodeValue());
    }

    @Test
    void testLoginSuccess() {
        AuthRequest req = new AuthRequest();
        AuthResponse resp = new AuthResponse("token", "refresh");
        when(authService.login(req)).thenReturn(resp);
        ResponseEntity<AuthResponse> response = authController.login(req);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testRefreshSuccess() {
        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken("token");
        AuthResponse resp = new AuthResponse("token", "refresh");
        when(authService.refreshToken("token")).thenReturn(resp);
        ResponseEntity<AuthResponse> response = authController.refresh(req);
        assertEquals(200, response.getStatusCodeValue());
    }
} 