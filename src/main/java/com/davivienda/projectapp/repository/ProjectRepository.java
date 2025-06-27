package com.davivienda.projectapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.User;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(User user);
    
    @Query("SELECT p FROM Project p JOIN p.userProjects up WHERE up.user = :user")
    List<Project> findProjectsByUser(@Param("user") User user);
    
    @Query("SELECT p FROM Project p JOIN p.userProjects up WHERE up.user = :user AND up.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER')")
    List<Project> findProjectsByUserWithAdminRole(@Param("user") User user);
    
    List<Project> findByStatus(com.davivienda.projectapp.model.ProjectStatus status);
} 