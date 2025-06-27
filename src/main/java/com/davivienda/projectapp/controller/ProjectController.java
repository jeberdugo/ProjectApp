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

import com.davivienda.projectapp.dto.ProjectRequest;
import com.davivienda.projectapp.dto.ProjectResponse;
import com.davivienda.projectapp.service.ProjectService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Projects", description = "Endpoints for project management")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @Operation(summary = "Create a new project", description = "Creates a new project and assigns the creator as OWNER")
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectRequest request, Authentication authentication) {
        try {
            ProjectResponse response = projectService.createProject(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get project by ID", description = "Retrieves a specific project if user has access")
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long projectId, Authentication authentication) {
        try {
            ProjectResponse response = projectService.getProject(projectId, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get user's projects", description = "Retrieves all projects where the user is a member")
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getUserProjects(Authentication authentication) {
        try {
            List<ProjectResponse> projects = projectService.getUserProjects(authentication.getName());
            return ResponseEntity.ok(projects);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Update project", description = "Updates a project if user has edit permissions")
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long projectId, 
                                                       @RequestBody ProjectRequest request, 
                                                       Authentication authentication) {
        try {
            ProjectResponse response = projectService.updateProject(projectId, request, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Delete project", description = "Deletes a project if user is the creator")
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId, Authentication authentication) {
        try {
            projectService.deleteProject(projectId, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 