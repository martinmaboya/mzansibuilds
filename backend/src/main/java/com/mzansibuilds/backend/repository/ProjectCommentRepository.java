package com.mzansibuilds.backend.repository;

import com.mzansibuilds.backend.entity.ProjectComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectCommentRepository extends JpaRepository<ProjectComment, Long> {
    List<ProjectComment> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
