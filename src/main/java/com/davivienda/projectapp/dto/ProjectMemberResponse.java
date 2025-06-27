package com.davivienda.projectapp.dto;

import java.time.LocalDateTime;

import com.davivienda.projectapp.model.ProjectRole;

import lombok.Data;

@Data
public class ProjectMemberResponse {
    private String username;
    private String email;
    private ProjectRole role;
    private LocalDateTime joinedAt;
} 