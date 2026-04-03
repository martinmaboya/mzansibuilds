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
    Project createProject(String requesterId, ProjectRequest request);
    Project updateProject(String requesterId, String id, ProjectRequest request);
    Project completeProject(String requesterId, String id);
    ProgressUpdate addProgressUpdate(String requesterId, String projectId, ProgressUpdateRequest request);
    ProjectComment addComment(String requesterId, String projectId, CommentRequest request);
    CollaborationRequest raiseHand(String requesterId, String projectId, CollaborationRequestDto request);
}
