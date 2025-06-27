package com.davivienda.projectapp.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String usernameOrEmail;
    private String password;
} 