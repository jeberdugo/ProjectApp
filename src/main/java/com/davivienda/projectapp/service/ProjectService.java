package com.davivienda.projectapp.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.davivienda.projectapp.dto.ProjectRequest;
import com.davivienda.projectapp.dto.ProjectResponse;
import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.ProjectRole;
import com.davivienda.projectapp.model.ProjectStatus;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.model.UserProject;
import com.davivienda.projectapp.repository.ProjectRepository;
import com.davivienda.projectapp.repository.UserProjectRepository;
import com.davivienda.projectapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UserProjectRepository userProjectRepository;
    private final PermissionService permissionService;

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!permissionService.canCreateProject(user)) {
            throw new IllegalArgumentException("No tienes permisos para crear proyectos");
        }

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.ACTIVE)
                .createdBy(user)
                .tasks(new ArrayList<>())
                .userProjects(new ArrayList<>())
                .build();

        project = projectRepository.save(project);

        // Agregar al creador como OWNER del proyecto
        UserProject userProject = UserProject.builder()
                .user(user)
                .project(project)
                .role(ProjectRole.OWNER)
                .build();
        userProjectRepository.save(userProject);

        // Recargar el proyecto para obtener las relaciones actualizadas
        project = projectRepository.findById(project.getId())
                .orElseThrow(() -> new IllegalArgumentException("Error al crear el proyecto"));

        return mapToProjectResponse(project);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canViewProject(user, project)) {
            throw new IllegalArgumentException("No tienes permisos para ver este proyecto");
        }

        return mapToProjectResponse(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getUserProjects(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        List<Project> projects = projectRepository.findProjectsByUser(user);
        return projects.stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canEditProject(user, project)) {
            throw new IllegalArgumentException("No tienes permisos para editar este proyecto");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        project = projectRepository.save(project);
        return mapToProjectResponse(project);
    }

    @Transactional
    public void deleteProject(Long projectId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canDeleteProject(user, project)) {
            throw new IllegalArgumentException("No tienes permisos para eliminar este proyecto");
        }

        projectRepository.delete(project);
    }

    private ProjectResponse mapToProjectResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setStatus(project.getStatus());
        response.setCreatedBy(project.getCreatedBy().getUsername());
        response.setCreatedAt(project.getCreatedAt());
        
        // Verificar si las colecciones no son null antes de llamar size()
        response.setTaskCount(project.getTasks() != null ? project.getTasks().size() : 0);
        response.setMemberCount(project.getUserProjects() != null ? project.getUserProjects().size() : 0);
        
        // Verificar si userProjects no es null antes de hacer stream
        List<String> members = project.getUserProjects() != null ? 
            project.getUserProjects().stream()
                .map(up -> up.getUser().getUsername())
                .collect(Collectors.toList()) : 
            new ArrayList<>();
        response.setMembers(members);
        
        return response;
    }
} 