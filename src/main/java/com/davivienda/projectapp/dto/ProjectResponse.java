package com.davivienda.projectapp.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.davivienda.projectapp.model.ProjectStatus;

import lombok.Data;

@Data
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
    private int taskCount;
    private int memberCount;
    private List<String> members;
} 