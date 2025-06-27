package com.davivienda.projectapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.davivienda.projectapp.model.Project;
import com.davivienda.projectapp.model.Task;
import com.davivienda.projectapp.model.User;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignedTo(User user);
    List<Task> findByCreatedBy(User user);
    List<Task> findByProjectAndStatus(Project project, com.davivienda.projectapp.model.TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.project = :project AND t.assignedTo = :user")
    List<Task> findByProjectAndAssignedTo(@Param("project") Project project, @Param("user") User user);
} 