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

import com.davivienda.projectapp.dto.TaskRequest;
import com.davivienda.projectapp.dto.TaskResponse;
import com.davivienda.projectapp.service.TaskService;

public class TaskControllerTest {
    @Mock private TaskService taskService;
    @InjectMocks private TaskController taskController;
    @Mock private Authentication authentication;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(authentication.getName()).thenReturn("user");
    }

    @Test
    void testCreateTask() {
        TaskRequest req = new TaskRequest();
        TaskResponse resp = mock(TaskResponse.class);
        when(taskService.createTask(req, "user")).thenReturn(resp);
        ResponseEntity<TaskResponse> response = taskController.createTask(req, authentication);
        assertEquals(201, response.getStatusCodeValue());
    }

    @Test
    void testGetTaskById() {
        TaskResponse resp = mock(TaskResponse.class);
        when(taskService.getTask(1L, "user")).thenReturn(resp);
        ResponseEntity<TaskResponse> response = taskController.getTask(1L, authentication);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetProjectTasks() {
        List<TaskResponse> list = Collections.singletonList(mock(TaskResponse.class));
        when(taskService.getProjectTasks(1L, "user")).thenReturn(list);
        ResponseEntity<List<TaskResponse>> response = taskController.getProjectTasks(1L, authentication);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testGetUserTasks() {
        List<TaskResponse> list = Collections.singletonList(mock(TaskResponse.class));
        when(taskService.getUserTasks("user")).thenReturn(list);
        ResponseEntity<List<TaskResponse>> response = taskController.getUserTasks(authentication);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testUpdateTask() {
        TaskRequest req = new TaskRequest();
        TaskResponse resp = mock(TaskResponse.class);
        when(taskService.updateTask(1L, req, "user")).thenReturn(resp);
        ResponseEntity<TaskResponse> response = taskController.updateTask(1L, req, authentication);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testDeleteTask() {
        doNothing().when(taskService).deleteTask(1L, "user");
        ResponseEntity<Void> response = taskController.deleteTask(1L, authentication);
        assertEquals(204, response.getStatusCodeValue());
    }
} 