package com.mzansibuilds.backend.repository;

import com.mzansibuilds.backend.entity.ProjectComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectCommentRepository extends JpaRepository<ProjectComment, Long> {
    List<ProjectComment> findByProjectIdOrderByCreatedAtAsc(Long projectId);
    Optional<ProjectComment> findByIdAndProjectId(Long id, Long projectId);
}
