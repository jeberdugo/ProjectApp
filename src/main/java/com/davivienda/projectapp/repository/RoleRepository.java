package com.davivienda.projectapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.davivienda.projectapp.model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
} 