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

import com.davivienda.projectapp.dto.LabelRequest;
import com.davivienda.projectapp.dto.LabelResponse;
import com.davivienda.projectapp.service.LabelService;

public class LabelControllerTest {
    @Mock private LabelService labelService;
    @InjectMocks private LabelController labelController;
    @Mock private Authentication authentication;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(authentication.getName()).thenReturn("user");
    }

    @Test
    void testCreateLabel() {
        LabelRequest req = new LabelRequest();
        LabelResponse resp = mock(LabelResponse.class);
        when(labelService.createLabel(req, "user")).thenReturn(resp);
        ResponseEntity<LabelResponse> response = labelController.createLabel(req, authentication);
        assertEquals(201, response.getStatusCodeValue());
    }

    @Test
    void testGetLabelById() {
        LabelResponse resp = mock(LabelResponse.class);
        when(labelService.getLabel(1L, "user")).thenReturn(resp);
        ResponseEntity<LabelResponse> response = labelController.getLabel(1L, authentication);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetAllLabels() {
        List<LabelResponse> list = Collections.singletonList(mock(LabelResponse.class));
        when(labelService.getAllLabels("user")).thenReturn(list);
        ResponseEntity<List<LabelResponse>> response = labelController.getAllLabels(authentication);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testGetProjectLabels() {
        List<LabelResponse> list = Collections.singletonList(mock(LabelResponse.class));
        when(labelService.getProjectLabels(1L, "user")).thenReturn(list);
        ResponseEntity<List<LabelResponse>> response = labelController.getProjectLabels(1L, authentication);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testUpdateLabel() {
        LabelRequest req = new LabelRequest();
        LabelResponse resp = mock(LabelResponse.class);
        when(labelService.updateLabel(1L, req, "user")).thenReturn(resp);
        ResponseEntity<LabelResponse> response = labelController.updateLabel(1L, req, authentication);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testDeleteLabel() {
        doNothing().when(labelService).deleteLabel(1L, "user");
        ResponseEntity<Void> response = labelController.deleteLabel(1L, authentication);
        assertEquals(204, response.getStatusCodeValue());
    }
} 