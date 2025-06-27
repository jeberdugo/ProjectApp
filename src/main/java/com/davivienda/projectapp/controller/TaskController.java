package com.davivienda.projectapp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.davivienda.projectapp.dto.TaskRequest;
import com.davivienda.projectapp.dto.TaskResponse;
import com.davivienda.projectapp.service.TaskService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Tasks", description = "Endpoints for task management")
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @Operation(summary = "Create a new task", description = "Creates a new task in a project")
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request, Authentication authentication) {
        try {
            TaskResponse response = taskService.createTask(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get task by ID", description = "Retrieves a specific task if user has access")
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long taskId, Authentication authentication) {
        try {
            TaskResponse response = taskService.getTask(taskId, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get project tasks", description = "Retrieves all tasks in a specific project")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getProjectTasks(@PathVariable Long projectId, Authentication authentication) {
        try {
            List<TaskResponse> tasks = taskService.getProjectTasks(projectId, authentication.getName());
            return ResponseEntity.ok(tasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get user's assigned tasks", description = "Retrieves all tasks assigned to the authenticated user")
    @GetMapping("/my-tasks")
    public ResponseEntity<List<TaskResponse>> getUserTasks(Authentication authentication) {
        try {
            List<TaskResponse> tasks = taskService.getUserTasks(authentication.getName());
            return ResponseEntity.ok(tasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Update task", description = "Updates a task if user has edit permissions")
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long taskId, 
                                                 @RequestBody TaskRequest request, 
                                                 Authentication authentication) {
        try {
            TaskResponse response = taskService.updateTask(taskId, request, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Delete task", description = "Deletes a task if user has delete permissions")
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId, Authentication authentication) {
        try {
            taskService.deleteTask(taskId, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 