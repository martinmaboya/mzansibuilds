package com.mzansibuilds.backend.repository;

import com.mzansibuilds.backend.entity.CollaborationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CollaborationRequestRepository extends JpaRepository<CollaborationRequest, Long> {
    List<CollaborationRequest> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    boolean existsByProjectIdAndRequesterIdAndStatus(Long projectId, String requesterId, CollaborationRequest.Status status);
    Optional<CollaborationRequest> findByIdAndProjectId(Long id, Long projectId);
}
