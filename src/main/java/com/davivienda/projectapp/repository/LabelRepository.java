package com.davivienda.projectapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.davivienda.projectapp.model.Label;

public interface LabelRepository extends JpaRepository<Label, Long> {
    Optional<Label> findByName(String name);
} 