package com.davivienda.projectapp.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.davivienda.projectapp.model.TaskPriority;
import com.davivienda.projectapp.model.TaskStatus;

import lombok.Data;

@Data
public class TaskRequest {
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Long assignedToId;
    private Long projectId;
    private LocalDateTime dueDate;
    private List<Long> labelIds;
} 