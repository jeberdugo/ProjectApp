package com.davivienda.projectapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.User;
import com.davivienda.projectapp.model.UserProject;

public interface UserProjectRepository extends JpaRepository<UserProject, Long> {
    List<UserProject> findByUser(User user);
    List<UserProject> findByProject(Project project);
    
    @Query("SELECT up FROM UserProject up WHERE up.user = :user AND up.project = :project")
    Optional<UserProject> findByUserAndProject(@Param("user") User user, @Param("project") Project project);
    
    @Query("SELECT up FROM UserProject up WHERE up.project = :project AND up.role IN ('OWNER', 'ADMIN')")
    List<UserProject> findAdminsByProject(@Param("project") Project project);
    
    boolean existsByUserAndProject(User user, Project project);
} 