package com.mzansibuilds.backend.repository;

import com.mzansibuilds.backend.entity.CollaborationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollaborationRequestRepository extends JpaRepository<CollaborationRequest, String> {
    List<CollaborationRequest> findByProjectIdOrderByCreatedAtDesc(String projectId);
}
