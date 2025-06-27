package com.davivienda.projectapp.controller;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.davivienda.projectapp.dto.ProjectRequest;
import com.davivienda.projectapp.dto.ProjectResponse;
import com.davivienda.projectapp.service.ProjectService;

public class ProjectControllerTest {
    @Mock private ProjectService projectService;
    @InjectMocks private ProjectController projectController;
    @Mock private Authentication authentication;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(authentication.getName()).thenReturn("user");
    }

    @Test
    void testCreateProject() {
        ProjectRequest req = new ProjectRequest();
        ProjectResponse resp = mock(ProjectResponse.class);
        when(projectService.createProject(req, "user")).thenReturn(resp);
        ResponseEntity<ProjectResponse> response = projectController.createProject(req, authentication);
        assertEquals(201, response.getStatusCodeValue());
    }

    @Test
    void testGetProject() {
        ProjectResponse resp = mock(ProjectResponse.class);
        when(projectService.getProject(1L, "user")).thenReturn(resp);
        ResponseEntity<ProjectResponse> response = projectController.getProject(1L, authentication);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetUserProjects() {
        List<ProjectResponse> list = Collections.singletonList(mock(ProjectResponse.class));
        when(projectService.getUserProjects("user")).thenReturn(list);
        ResponseEntity<List<ProjectResponse>> response = projectController.getUserProjects(authentication);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testUpdateProject() {
        ProjectRequest req = new ProjectRequest();
        ProjectResponse resp = mock(ProjectResponse.class);
        when(projectService.updateProject(1L, req, "user")).thenReturn(resp);
        ResponseEntity<ProjectResponse> response = projectController.updateProject(1L, req, authentication);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testDeleteProject() {
        doNothing().when(projectService).deleteProject(1L, "user");
        ResponseEntity<Void> response = projectController.deleteProject(1L, authentication);
        assertEquals(204, response.getStatusCodeValue());
    }
} 