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

import com.davivienda.projectapp.dto.ProjectMemberRequest;
import com.davivienda.projectapp.dto.ProjectMemberResponse;
import com.davivienda.projectapp.model.ProjectRole;
import com.davivienda.projectapp.service.ProjectMemberService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Project Members", description = "Endpoints for managing project members")
@RestController
@RequestMapping("/api/projects/{projectId}/members")
@RequiredArgsConstructor
public class ProjectMemberController {
    private final ProjectMemberService projectMemberService;

    @Operation(summary = "Add member to project", description = "Adds a new member to the project with specified role")
    @PostMapping
    public ResponseEntity<ProjectMemberResponse> addMember(@PathVariable Long projectId, 
                                                         @RequestBody ProjectMemberRequest request, 
                                                         Authentication authentication) {
        try {
            ProjectMemberResponse response = projectMemberService.addMember(projectId, request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get project members", description = "Retrieves all members of a specific project")
    @GetMapping
    public ResponseEntity<List<ProjectMemberResponse>> getProjectMembers(@PathVariable Long projectId, 
                                                                       Authentication authentication) {
        try {
            List<ProjectMemberResponse> members = projectMemberService.getProjectMembers(projectId, authentication.getName());
            return ResponseEntity.ok(members);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Update member role", description = "Updates the role of a project member")
    @PutMapping("/{memberUsername}/role")
    public ResponseEntity<ProjectMemberResponse> updateMemberRole(@PathVariable Long projectId, 
                                                                @PathVariable String memberUsername,
                                                                @RequestBody ProjectRole newRole, 
                                                                Authentication authentication) {
        try {
            ProjectMemberResponse response = projectMemberService.updateMemberRole(projectId, memberUsername, newRole, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Remove member from project", description = "Removes a member from the project")
    @DeleteMapping("/{memberUsername}")
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId, 
                                           @PathVariable String memberUsername, 
                                           Authentication authentication) {
        try {
            projectMemberService.removeMember(projectId, memberUsername, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Ensure creator is OWNER", description = "Permite al creador del proyecto asegurarse como OWNER en user_projects si no está registrado")
    @PostMapping("/ensure-owner")
    public ResponseEntity<ProjectMemberResponse> ensureCreatorIsOwner(@PathVariable Long projectId, Authentication authentication) {
        try {
            ProjectMemberResponse response = projectMemberService.ensureCreatorIsOwner(projectId, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 