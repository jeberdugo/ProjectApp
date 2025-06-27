package com.davivienda.projectapp.service;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.ProjectRole;
import com.davivienda.projectapp.model.Role;
import com.davivienda.projectapp.model.Task;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.model.UserProject;
import com.davivienda.projectapp.repository.UserProjectRepository;

public class PermissionServiceTest {
    @Mock private UserProjectRepository userProjectRepository;
    @InjectMocks private PermissionService permissionService;

    private User user;
    private Project project;
    private UserProject userProject;
    private Task task;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder().id(1L).username("testuser").build();
        project = Project.builder().id(1L).name("Test Project").createdBy(user).build();
        userProject = UserProject.builder().id(1L).user(user).project(project).role(ProjectRole.OWNER).build();
        task = Task.builder().id(1L).title("Test Task").project(project).createdBy(user).build();
    }

    @Test
    void testCanCreateProjectAdmin() {
        user.setRoles(Set.of(Role.builder().name("ADMIN").build()));
        assertTrue(permissionService.canCreateProject(user));
    }

    @Test
    void testCanViewProjectAsCreator() {
        assertTrue(permissionService.canViewProject(user, project));
    }

    @Test
    void testCanEditProjectAsOwner() {
        when(userProjectRepository.findByUserAndProject(user, project)).thenReturn(Optional.of(userProject));
        assertTrue(permissionService.canEditProject(user, project));
    }

    @Test
    void testCanDeleteProjectAsCreator() {
        assertTrue(permissionService.canDeleteProject(user, project));
    }

    @Test
    void testCanCreateTaskAsMember() {
        when(userProjectRepository.existsByUserAndProject(user, project)).thenReturn(true);
        assertTrue(permissionService.canCreateTask(user, project));
    }

    @Test
    void testCanEditTaskAsCreator() {
        task.setCreatedBy(user);
        assertTrue(permissionService.canEditTask(user, task));
    }

    @Test
    void testCanDeleteTaskAsCreator() {
        task.setCreatedBy(user);
        assertTrue(permissionService.canDeleteTask(user, task));
    }

    @Test
    void testCanManageProjectMembersAsOwner() {
        when(userProjectRepository.findByUserAndProject(user, project)).thenReturn(Optional.of(userProject));
        assertTrue(permissionService.canManageProjectMembers(user, project));
    }
} 