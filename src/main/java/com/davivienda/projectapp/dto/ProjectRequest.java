package com.davivienda.projectapp.dto;

import com.davivienda.projectapp.model.ProjectStatus;

import lombok.Data;

@Data
public class ProjectRequest {
    private String name;
    private String description;
    private ProjectStatus status;
} 