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

import com.davivienda.projectapp.dto.LabelRequest;
import com.davivienda.projectapp.model.Label;
import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.repository.LabelRepository;
import com.davivienda.projectapp.repository.ProjectRepository;
import com.davivienda.projectapp.repository.UserRepository;

public class LabelServiceTest {
    @Mock private LabelRepository labelRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private PermissionService permissionService;
    @InjectMocks private LabelService labelService;

    private User user;
    private Project project;
    private Label label;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder().id(1L).username("testuser").build();
        project = Project.builder().id(1L).name("Test Project").createdBy(user).build();
        label = Label.builder().id(1L).name("Urgente").color("#FF0000").build();
    }

    @Test
    void testCreateLabelSuccess() {
        LabelRequest req = new LabelRequest();
        req.setName("Nueva etiqueta");
        req.setColor("#00FF00");
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(labelRepository.save(any(Label.class))).thenReturn(label);
        assertNotNull(labelService.createLabel(req, "testuser"));
    }

    @Test
    void testGetLabelSuccess() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(labelRepository.findById(1L)).thenReturn(Optional.of(label));
        assertNotNull(labelService.getLabel(1L, "testuser"));
    }

    @Test
    void testUpdateLabelNoUser() {
        LabelRequest req = new LabelRequest();
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> labelService.updateLabel(1L, req, "testuser"));
    }

    @Test
    void testDeleteLabelNoUser() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> labelService.deleteLabel(1L, "testuser"));
    }
} 