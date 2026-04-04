package com.mzansibuilds.backend.repository;

import com.mzansibuilds.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCompletedTrueOrderByUpdatedAtDesc();
    List<Project> findAllByOrderByUpdatedAtDesc();
}
