package com.davivienda.projectapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.davivienda.projectapp.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
} 