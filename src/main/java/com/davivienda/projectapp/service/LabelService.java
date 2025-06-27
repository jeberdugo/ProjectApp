package com.davivienda.projectapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.davivienda.projectapp.dto.LabelRequest;
import com.davivienda.projectapp.dto.LabelResponse;
import com.davivienda.projectapp.model.Label;
import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.repository.LabelRepository;
import com.davivienda.projectapp.repository.ProjectRepository;
import com.davivienda.projectapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LabelService {
    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    @Transactional
    public LabelResponse createLabel(LabelRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Verificar que el usuario tenga permisos para crear labels (cualquier usuario autenticado)
        if (user == null) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        Label label = Label.builder()
                .name(request.getName())
                .color(request.getColor())
                .build();

        label = labelRepository.save(label);
        return mapToLabelResponse(label);
    }

    @Transactional(readOnly = true)
    public LabelResponse getLabel(Long labelId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new IllegalArgumentException("Label no encontrado"));

        return mapToLabelResponse(label);
    }

    @Transactional(readOnly = true)
    public List<LabelResponse> getAllLabels(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        List<Label> labels = labelRepository.findAll();
        return labels.stream()
                .map(this::mapToLabelResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabelResponse> getProjectLabels(Long projectId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canViewProject(user, project)) {
            throw new IllegalArgumentException("No tienes permisos para ver las labels de este proyecto");
        }

        List<Label> labels = labelRepository.findAll();
        return labels.stream()
                .map(this::mapToLabelResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabelResponse updateLabel(Long labelId, LabelRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new IllegalArgumentException("Label no encontrado"));

        // Para simplificar, cualquier usuario autenticado puede editar labels
        // En un sistema más complejo, podrías agregar permisos específicos

        label.setName(request.getName());
        label.setColor(request.getColor());

        label = labelRepository.save(label);
        return mapToLabelResponse(label);
    }

    @Transactional
    public void deleteLabel(Long labelId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new IllegalArgumentException("Label no encontrado"));

        // Para simplificar, cualquier usuario autenticado puede eliminar labels
        // En un sistema más complejo, podrías agregar permisos específicos

        labelRepository.delete(label);
    }

    private LabelResponse mapToLabelResponse(Label label) {
        LabelResponse response = new LabelResponse();
        response.setId(label.getId());
        response.setName(label.getName());
        response.setColor(label.getColor());
        return response;
    }
} 