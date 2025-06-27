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

import com.davivienda.projectapp.dto.ProjectMemberRequest;
import com.davivienda.projectapp.dto.ProjectMemberResponse;
import com.davivienda.projectapp.model.ProjectRole;
import com.davivienda.projectapp.service.ProjectMemberService;

public class ProjectMemberControllerTest {
    @Mock private ProjectMemberService projectMemberService;
    @InjectMocks private ProjectMemberController projectMemberController;
    @Mock private Authentication authentication;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(authentication.getName()).thenReturn("user");
    }

    @Test
    void testAddMember() {
        ProjectMemberRequest req = new ProjectMemberRequest();
        ProjectMemberResponse resp = mock(ProjectMemberResponse.class);
        when(projectMemberService.addMember(1L, req, "user")).thenReturn(resp);
        ResponseEntity<ProjectMemberResponse> response = projectMemberController.addMember(1L, req, authentication);
        assertEquals(201, response.getStatusCodeValue());
    }

    @Test
    void testGetProjectMembers() {
        List<ProjectMemberResponse> list = Collections.singletonList(mock(ProjectMemberResponse.class));
        when(projectMemberService.getProjectMembers(1L, "user")).thenReturn(list);
        ResponseEntity<List<ProjectMemberResponse>> response = projectMemberController.getProjectMembers(1L, authentication);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testUpdateMemberRole() {
        ProjectRole newRole = ProjectRole.TEAM_MEMBER;
        ProjectMemberResponse resp = mock(ProjectMemberResponse.class);
        when(projectMemberService.updateMemberRole(1L, "member", newRole, "user")).thenReturn(resp);
        ResponseEntity<ProjectMemberResponse> response = projectMemberController.updateMemberRole(1L, "member", newRole, authentication);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testRemoveMember() {
        doNothing().when(projectMemberService).removeMember(1L, "member", "user");
        ResponseEntity<Void> response = projectMemberController.removeMember(1L, "member", authentication);
        assertEquals(204, response.getStatusCodeValue());
    }

    @Test
    void testEnsureCreatorIsOwner() {
        ProjectMemberResponse resp = mock(ProjectMemberResponse.class);
        when(projectMemberService.ensureCreatorIsOwner(1L, "user")).thenReturn(resp);
        ResponseEntity<ProjectMemberResponse> response = projectMemberController.ensureCreatorIsOwner(1L, authentication);
        assertEquals(200, response.getStatusCodeValue());
    }
} 