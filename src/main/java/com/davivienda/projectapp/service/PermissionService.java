package com.davivienda.projectapp.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.ProjectRole;
import com.davivienda.projectapp.model.Task;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.model.UserProject;
import com.davivienda.projectapp.repository.UserProjectRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final UserProjectRepository userProjectRepository;

    public boolean canCreateProject(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ADMIN") || role.getName().equals("USER"));
    }

    public boolean canViewProject(User user, Project project) {
        // El creador siempre puede ver
        if (project.getCreatedBy().getId().equals(user.getId())) {
            return true;
        }
        
        // Verificar si el usuario es miembro del proyecto
        return userProjectRepository.existsByUserAndProject(user, project);
    }

    public boolean canEditProject(User user, Project project) {
        // El creador siempre puede editar
        if (project.getCreatedBy().getId().equals(user.getId())) {
            return true;
        }
        
        Optional<UserProject> userProject = userProjectRepository.findByUserAndProject(user, project);
        return userProject.map(up -> 
            up.getRole() == ProjectRole.OWNER || 
            up.getRole() == ProjectRole.ADMIN || 
            up.getRole() == ProjectRole.PROJECT_MANAGER
        ).orElse(false);
    }

    public boolean canDeleteProject(User user, Project project) {
        // Solo el creador puede eliminar
        return project.getCreatedBy().getId().equals(user.getId());
    }

    public boolean canCreateTask(User user, Project project) {
        if (!canViewProject(user, project)) {
            return false;
        }
        
        // Cualquier miembro del proyecto puede crear tareas
        return true;
    }

    public boolean canEditTask(User user, Task task) {
        // El creador de la tarea siempre puede editarla
        if (task.getCreatedBy().getId().equals(user.getId())) {
            return true;
        }
        
        // El asignado puede editar su tarea
        if (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(user.getId())) {
            return true;
        }
        
        // Administradores del proyecto pueden editar cualquier tarea
        Optional<UserProject> userProject = userProjectRepository.findByUserAndProject(user, task.getProject());
        return userProject.map(up -> 
            up.getRole() == ProjectRole.OWNER || 
            up.getRole() == ProjectRole.ADMIN || 
            up.getRole() == ProjectRole.PROJECT_MANAGER
        ).orElse(false);
    }

    public boolean canDeleteTask(User user, Task task) {
        // Solo el creador o administradores pueden eliminar
        if (task.getCreatedBy().getId().equals(user.getId())) {
            return true;
        }
        
        Optional<UserProject> userProject = userProjectRepository.findByUserAndProject(user, task.getProject());
        return userProject.map(up -> 
            up.getRole() == ProjectRole.OWNER || 
            up.getRole() == ProjectRole.ADMIN
        ).orElse(false);
    }

    public boolean canManageProjectMembers(User user, Project project) {
        Optional<UserProject> userProject = userProjectRepository.findByUserAndProject(user, project);
        return userProject.map(up -> 
            up.getRole() == ProjectRole.OWNER || 
            up.getRole() == ProjectRole.ADMIN
        ).orElse(false);
    }

    public ProjectRole getUserRoleInProject(User user, Project project) {
        Optional<UserProject> userProject = userProjectRepository.findByUserAndProject(user, project);
        return userProject.map(UserProject::getRole).orElse(null);
    }
} 