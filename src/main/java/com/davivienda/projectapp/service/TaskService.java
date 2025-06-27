package com.davivienda.projectapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.davivienda.projectapp.dto.LabelResponse;
import com.davivienda.projectapp.dto.TaskRequest;
import com.davivienda.projectapp.dto.TaskResponse;
import com.davivienda.projectapp.model.Label;
import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.Task;
import com.davivienda.projectapp.model.TaskPriority;
import com.davivienda.projectapp.model.TaskStatus;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.repository.LabelRepository;
import com.davivienda.projectapp.repository.ProjectRepository;
import com.davivienda.projectapp.repository.TaskRepository;
import com.davivienda.projectapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final PermissionService permissionService;

    @Transactional
    public TaskResponse createTask(TaskRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canCreateTask(user, project)) {
            throw new IllegalArgumentException("No tienes permisos para crear tareas en este proyecto");
        }

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario asignado no encontrado"));
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .assignedTo(assignedTo)
                .project(project)
                .createdBy(user)
                .dueDate(request.getDueDate())
                .build();

        // Agregar labels si se especifican
        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            List<Label> labels = labelRepository.findAllById(request.getLabelIds());
            task.setLabels(labels);
        }

        task = taskRepository.save(task);
        return mapToTaskResponse(task);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long taskId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));

        if (!permissionService.canViewProject(user, task.getProject())) {
            throw new IllegalArgumentException("No tienes permisos para ver esta tarea");
        }

        return mapToTaskResponse(task);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getProjectTasks(Long projectId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canViewProject(user, project)) {
            throw new IllegalArgumentException("No tienes permisos para ver las tareas de este proyecto");
        }

        List<Task> tasks = taskRepository.findByProject(project);
        return tasks.stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getUserTasks(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        List<Task> tasks = taskRepository.findByAssignedTo(user);
        return tasks.stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));

        if (!permissionService.canEditTask(user, task)) {
            throw new IllegalArgumentException("No tienes permisos para editar esta tarea");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        // Actualizar asignación
        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario asignado no encontrado"));
            task.setAssignedTo(assignedTo);
        } else {
            task.setAssignedTo(null);
        }

        // Actualizar labels
        if (request.getLabelIds() != null) {
            List<Label> labels = labelRepository.findAllById(request.getLabelIds());
            task.setLabels(labels);
        }

        task = taskRepository.save(task);
        return mapToTaskResponse(task);
    }

    @Transactional
    public void deleteTask(Long taskId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));

        if (!permissionService.canDeleteTask(user, task)) {
            throw new IllegalArgumentException("No tienes permisos para eliminar esta tarea");
        }

        taskRepository.delete(task);
    }

    private TaskResponse mapToTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setAssignedTo(task.getAssignedTo() != null ? task.getAssignedTo().getUsername() : null);
        response.setProjectName(task.getProject().getName());
        response.setCreatedBy(task.getCreatedBy().getUsername());
        response.setCreatedAt(task.getCreatedAt());
        response.setDueDate(task.getDueDate());
        
        // Mapear labels
        List<LabelResponse> labels = (task.getLabels() != null ? task.getLabels() : new java.util.ArrayList<>())
                .stream()
                .map(label -> {
                    com.davivienda.projectapp.model.Label l = (com.davivienda.projectapp.model.Label) label;
                    LabelResponse labelResponse = new LabelResponse();
                    labelResponse.setId(l.getId());
                    labelResponse.setName(l.getName());
                    labelResponse.setColor(l.getColor());
                    return labelResponse;
                })
                .collect(Collectors.toList());
        response.setLabels(labels);
        
        return response;
    }
} 