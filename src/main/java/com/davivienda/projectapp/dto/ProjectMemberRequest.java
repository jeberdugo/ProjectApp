package com.davivienda.projectapp.dto;

import com.davivienda.projectapp.model.ProjectRole;

import lombok.Data;

@Data
public class ProjectMemberRequest {
    private String username;
    private ProjectRole role;
} 