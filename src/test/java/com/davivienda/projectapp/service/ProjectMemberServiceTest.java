package com.davivienda.projectapp.service;

import com.davivienda.projectapp.dto.ProjectMemberRequest;
import com.davivienda.projectapp.model.*;
import com.davivienda.projectapp.repository.ProjectRepository;
import com.davivienda.projectapp.repository.UserProjectRepository;
import com.davivienda.projectapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import java.util.List;
import java.util.Collections;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProjectMemberServiceTest {
    @Mock private UserProjectRepository userProjectRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private PermissionService permissionService;
    @InjectMocks private ProjectMemberService projectMemberService;

    private User user;
    private Project project;
    private UserProject userProject;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder().id(1L).username("testuser").build();
        project = Project.builder().id(1L).name("Test Project").createdBy(user).build();
        userProject = UserProject.builder().id(1L).user(user).project(project).role(ProjectRole.OWNER).build();
    }

    @Test
    void testAddMemberNoPermission() {
        ProjectMemberRequest req = new ProjectMemberRequest();
        req.setUsername("otheruser");
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(projectRepository.findById(anyLong())).thenReturn(Optional.of(project));
        when(permissionService.canManageProjectMembers(user, project)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> projectMemberService.addMember(1L, req, "testuser"));
    }

    @Test
    void testGetProjectMembersSuccess() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(projectRepository.findById(anyLong())).thenReturn(Optional.of(project));
        when(permissionService.canViewProject(user, project)).thenReturn(true);
        when(userProjectRepository.findByProject(project)).thenReturn(List.of(userProject));
        assertNotNull(projectMemberService.getProjectMembers(1L, "testuser"));
    }

    @Test
    void testUpdateMemberRoleNoPermission() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(projectRepository.findById(anyLong())).thenReturn(Optional.of(project));
        when(permissionService.canManageProjectMembers(user, project)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> projectMemberService.updateMemberRole(1L, "otheruser", ProjectRole.ADMIN, "testuser"));
    }

    @Test
    void testRemoveMemberNoPermission() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(projectRepository.findById(anyLong())).thenReturn(Optional.of(project));
        when(permissionService.canManageProjectMembers(user, project)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> projectMemberService.removeMember(1L, "otheruser", "testuser"));
    }
} 