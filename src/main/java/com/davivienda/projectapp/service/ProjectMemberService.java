package com.davivienda.projectapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.davivienda.projectapp.dto.ProjectMemberRequest;
import com.davivienda.projectapp.dto.ProjectMemberResponse;
import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.ProjectRole;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.model.UserProject;
import com.davivienda.projectapp.repository.ProjectRepository;
import com.davivienda.projectapp.repository.UserProjectRepository;
import com.davivienda.projectapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {
    private final UserProjectRepository userProjectRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final PermissionService permissionService;

    @Transactional
    public ProjectMemberResponse addMember(Long projectId, ProjectMemberRequest request, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canManageProjectMembers(currentUser, project)) {
            throw new IllegalArgumentException("No tienes permisos para gestionar miembros del proyecto");
        }

        User userToAdd = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuario a agregar no encontrado"));

        // Verificar si el usuario ya es miembro del proyecto
        if (userProjectRepository.existsByUserAndProject(userToAdd, project)) {
            throw new IllegalArgumentException("El usuario ya es miembro del proyecto");
        }

        UserProject userProject = UserProject.builder()
                .user(userToAdd)
                .project(project)
                .role(request.getRole() != null ? request.getRole() : ProjectRole.TEAM_MEMBER)
                .build();

        userProject = userProjectRepository.save(userProject);
        return mapToProjectMemberResponse(userProject);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getProjectMembers(Long projectId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canViewProject(user, project)) {
            throw new IllegalArgumentException("No tienes permisos para ver los miembros de este proyecto");
        }

        List<UserProject> userProjects = userProjectRepository.findByProject(project);
        return userProjects.stream()
                .map(this::mapToProjectMemberResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectMemberResponse updateMemberRole(Long projectId, String memberUsername, 
                                                ProjectRole newRole, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canManageProjectMembers(currentUser, project)) {
            throw new IllegalArgumentException("No tienes permisos para gestionar miembros del proyecto");
        }

        User memberUser = userRepository.findByUsername(memberUsername)
                .orElseThrow(() -> new IllegalArgumentException("Miembro no encontrado"));

        UserProject userProject = userProjectRepository.findByUserAndProject(memberUser, project)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no es miembro del proyecto"));

        // No permitir cambiar el rol del OWNER
        if (userProject.getRole() == ProjectRole.OWNER) {
            throw new IllegalArgumentException("No se puede cambiar el rol del propietario del proyecto");
        }

        userProject.setRole(newRole);
        userProject = userProjectRepository.save(userProject);
        return mapToProjectMemberResponse(userProject);
    }

    @Transactional
    public void removeMember(Long projectId, String memberUsername, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));

        if (!permissionService.canManageProjectMembers(currentUser, project)) {
            throw new IllegalArgumentException("No tienes permisos para gestionar miembros del proyecto");
        }

        User memberUser = userRepository.findByUsername(memberUsername)
                .orElseThrow(() -> new IllegalArgumentException("Miembro no encontrado"));

        UserProject userProject = userProjectRepository.findByUserAndProject(memberUser, project)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no es miembro del proyecto"));

        // No permitir eliminar al OWNER
        if (userProject.getRole() == ProjectRole.OWNER) {
            throw new IllegalArgumentException("No se puede eliminar al propietario del proyecto");
        }

        userProjectRepository.delete(userProject);
    }

    @Transactional
    public ProjectMemberResponse ensureCreatorIsOwner(Long projectId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));
        // Solo el creador puede llamarlo
        if (!project.getCreatedBy().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Solo el creador puede asegurarse como OWNER");
        }
        if (!userProjectRepository.existsByUserAndProject(user, project)) {
            UserProject userProject = UserProject.builder()
                    .user(user)
                    .project(project)
                    .role(ProjectRole.OWNER)
                    .build();
            userProject = userProjectRepository.save(userProject);
            return mapToProjectMemberResponse(userProject);
        } else {
            // Ya es miembro, retorna el registro existente
            UserProject userProject = userProjectRepository.findByUserAndProject(user, project)
                    .orElseThrow();
            return mapToProjectMemberResponse(userProject);
        }
    }

    private ProjectMemberResponse mapToProjectMemberResponse(UserProject userProject) {
        ProjectMemberResponse response = new ProjectMemberResponse();
        response.setUsername(userProject.getUser().getUsername());
        response.setEmail(userProject.getUser().getEmail());
        response.setRole(userProject.getRole());
        response.setJoinedAt(userProject.getJoinedAt());
        return response;
    }
} 