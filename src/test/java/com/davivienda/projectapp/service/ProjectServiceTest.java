package com.davivienda.projectapp.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.davivienda.projectapp.dto.ProjectRequest;
import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.ProjectStatus;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.model.UserProject;
import com.davivienda.projectapp.repository.ProjectRepository;
import com.davivienda.projectapp.repository.UserProjectRepository;
import com.davivienda.projectapp.repository.UserRepository;

public class ProjectServiceTest {
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserProjectRepository userProjectRepository;
    @Mock private PermissionService permissionService;
    @InjectMocks private ProjectService projectService;

    private User user;
    private Project project;
    private UserProject userProject;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder().id(1L).username("testuser").build();
        project = Project.builder().id(1L).name("Test Project").createdBy(user).status(ProjectStatus.ACTIVE).build();
        userProject = UserProject.builder().id(1L).user(user).project(project).build();
    }

    @Test
    void testCreateProjectSuccess() {
        ProjectRequest req = new ProjectRequest();
        req.setName("Nuevo proyecto");
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(permissionService.canCreateProject(user)).thenReturn(true);
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(userProjectRepository.save(any(UserProject.class))).thenReturn(userProject);
        when(projectRepository.findById(anyLong())).thenReturn(Optional.of(project));
        assertNotNull(projectService.createProject(req, "testuser"));
    }

    @Test
    void testGetProjectNoPermission() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(permissionService.canViewProject(user, project)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> projectService.getProject(1L, "testuser"));
    }

    @Test
    void testUpdateProjectNoPermission() {
        ProjectRequest req = new ProjectRequest();
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(permissionService.canEditProject(user, project)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> projectService.updateProject(1L, req, "testuser"));
    }

    @Test
    void testDeleteProjectNoPermission() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(permissionService.canDeleteProject(user, project)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> projectService.deleteProject(1L, "testuser"));
    }
} 