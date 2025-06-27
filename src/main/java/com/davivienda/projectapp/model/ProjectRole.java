package com.davivienda.projectapp.model;

public enum ProjectRole {
    OWNER,           // Creador del proyecto, puede hacer todo
    ADMIN,           // Administrador del proyecto
    PROJECT_MANAGER, // Gerente de proyecto
    TEAM_MEMBER,     // Miembro del equipo
    VIEWER           // Solo puede ver
} 