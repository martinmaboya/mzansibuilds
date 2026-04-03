package com.mzansibuilds.backend.repository;

import com.mzansibuilds.backend.entity.ProgressUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, String> {
    List<ProgressUpdate> findByProjectIdOrderByCreatedAtDesc(String projectId);
}
