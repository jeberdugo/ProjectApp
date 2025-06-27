package com.davivienda.projectapp.dto;

import com.davivienda.projectapp.model.TaskPriority;
import com.davivienda.projectapp.model.TaskStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private String assignedTo;
    private String projectName;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime dueDate;
    private List<LabelResponse> labels;
} 