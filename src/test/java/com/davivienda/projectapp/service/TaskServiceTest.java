package com.davivienda.projectapp.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.davivienda.projectapp.dto.TaskRequest;
import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.Task;
import com.davivienda.projectapp.model.TaskPriority;
import com.davivienda.projectapp.model.TaskStatus;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.repository.LabelRepository;
import com.davivienda.projectapp.repository.ProjectRepository;
import com.davivienda.projectapp.repository.TaskRepository;
import com.davivienda.projectapp.repository.UserRepository;

public class TaskServiceTest {
    @Mock private TaskRepository taskRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private LabelRepository labelRepository;
    @Mock private PermissionService permissionService;
    @InjectMocks private TaskService taskService;

    private User user;
    private Project project;
    private Task task;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder().id(1L).username("testuser").build();
        project = Project.builder().id(1L).name("Test Project").createdBy(user).build();
        task = Task.builder().id(1L).title("Test Task").project(project).createdBy(user).status(TaskStatus.TODO).priority(TaskPriority.MEDIUM).build();
    }

    @Test
    void testCreateTaskSuccess() {
        TaskRequest req = new TaskRequest();
        req.setTitle("Nueva tarea");
        req.setProjectId(1L);
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(permissionService.canCreateTask(user, project)).thenReturn(true);
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        assertNotNull(taskService.createTask(req, "testuser"));
    }

    @Test
    void testGetTaskSuccess() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(permissionService.canViewProject(user, project)).thenReturn(true);
        assertNotNull(taskService.getTask(1L, "testuser"));
    }

    @Test
    void testUpdateTaskNoPermission() {
        TaskRequest req = new TaskRequest();
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(permissionService.canEditTask(user, task)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> taskService.updateTask(1L, req, "testuser"));
    }

    @Test
    void testDeleteTaskNoPermission() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(permissionService.canDeleteTask(user, task)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> taskService.deleteTask(1L, "testuser"));
    }
} 