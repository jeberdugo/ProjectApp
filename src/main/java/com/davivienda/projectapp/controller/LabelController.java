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

import com.davivienda.projectapp.dto.LabelRequest;
import com.davivienda.projectapp.dto.LabelResponse;
import com.davivienda.projectapp.service.LabelService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Labels", description = "Endpoints for label management")
@RestController
@RequestMapping("/api/labels")
@RequiredArgsConstructor
public class LabelController {
    private final LabelService labelService;

    @Operation(summary = "Create a new label", description = "Creates a new label")
    @PostMapping
    public ResponseEntity<LabelResponse> createLabel(@RequestBody LabelRequest request, Authentication authentication) {
        try {
            LabelResponse response = labelService.createLabel(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get label by ID", description = "Retrieves a specific label")
    @GetMapping("/{labelId}")
    public ResponseEntity<LabelResponse> getLabel(@PathVariable Long labelId, Authentication authentication) {
        try {
            LabelResponse response = labelService.getLabel(labelId, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get all labels", description = "Retrieves all available labels")
    @GetMapping
    public ResponseEntity<List<LabelResponse>> getAllLabels(Authentication authentication) {
        try {
            List<LabelResponse> labels = labelService.getAllLabels(authentication.getName());
            return ResponseEntity.ok(labels);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get project labels", description = "Retrieves labels available for a specific project")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<LabelResponse>> getProjectLabels(@PathVariable Long projectId, Authentication authentication) {
        try {
            List<LabelResponse> labels = labelService.getProjectLabels(projectId, authentication.getName());
            return ResponseEntity.ok(labels);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Update label", description = "Updates a label")
    @PutMapping("/{labelId}")
    public ResponseEntity<LabelResponse> updateLabel(@PathVariable Long labelId, 
                                                   @RequestBody LabelRequest request, 
                                                   Authentication authentication) {
        try {
            LabelResponse response = labelService.updateLabel(labelId, request, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Delete label", description = "Deletes a label")
    @DeleteMapping("/{labelId}")
    public ResponseEntity<Void> deleteLabel(@PathVariable Long labelId, Authentication authentication) {
        try {
            labelService.deleteLabel(labelId, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 