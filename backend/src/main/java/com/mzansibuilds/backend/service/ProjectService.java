package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.CollaborationRequestDto;
import com.mzansibuilds.backend.dto.CommentRequest;
import com.mzansibuilds.backend.dto.ProgressUpdateRequest;
import com.mzansibuilds.backend.dto.ProjectRequest;
import com.mzansibuilds.backend.entity.CollaborationRequest;
import com.mzansibuilds.backend.entity.Project;
import com.mzansibuilds.backend.entity.ProjectComment;
import com.mzansibuilds.backend.entity.ProgressUpdate;

import java.util.List;

public interface ProjectService {
    List<Project> listProjects();
    List<Project> listCelebrationWall();
    Project getProjectById(Long id);
    List<ProgressUpdate> listProgressUpdates(Long projectId);
    List<ProjectComment> listComments(Long projectId);
    List<CollaborationRequest> listCollaborationRequests(Long projectId);
    Project createProject(String requesterId, ProjectRequest request);
    Project updateProject(String requesterId, Long id, ProjectRequest request);
    void deleteProject(String requesterId, Long id);
    Project completeProject(String requesterId, Long id);
    ProgressUpdate addProgressUpdate(String requesterId, Long projectId, ProgressUpdateRequest request);
    ProjectComment addComment(String requesterId, Long projectId, CommentRequest request);
    ProjectComment addReply(String requesterId, Long projectId, Long commentId, CommentRequest request);
    CollaborationRequest raiseHand(String requesterId, Long projectId, CollaborationRequestDto request);
    CollaborationRequest acceptCollaborationRequest(String requesterId, Long projectId, Long requestId);
    CollaborationRequest declineCollaborationRequest(String requesterId, Long projectId, Long requestId);
}
