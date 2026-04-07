package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.CollaborationRequestDto;
import com.mzansibuilds.backend.dto.CommentRequest;
import com.mzansibuilds.backend.dto.ProgressUpdateRequest;
import com.mzansibuilds.backend.dto.ProjectRequest;
import com.mzansibuilds.backend.entity.CollaborationRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;
import com.mzansibuilds.backend.entity.Project;
import com.mzansibuilds.backend.entity.ProjectComment;
import com.mzansibuilds.backend.entity.ProjectStage;
import com.mzansibuilds.backend.entity.ProgressUpdate;
import com.mzansibuilds.backend.entity.SupportType;
import com.mzansibuilds.backend.exception.UnauthorizedActionException;
import com.mzansibuilds.backend.repository.CollaborationRequestRepository;
import com.mzansibuilds.backend.repository.DeveloperUserRepository;
import com.mzansibuilds.backend.repository.ProgressUpdateRepository;
import com.mzansibuilds.backend.repository.ProjectCommentRepository;
import com.mzansibuilds.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InMemoryProjectService implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProgressUpdateRepository progressUpdateRepository;
    private final ProjectCommentRepository projectCommentRepository;
    private final CollaborationRequestRepository collaborationRequestRepository;
    private final DeveloperUserRepository developerUserRepository;

    public InMemoryProjectService(
            ProjectRepository projectRepository,
            ProgressUpdateRepository progressUpdateRepository,
            ProjectCommentRepository projectCommentRepository,
            CollaborationRequestRepository collaborationRequestRepository,
            DeveloperUserRepository developerUserRepository
    ) {
        this.projectRepository = projectRepository;
        this.progressUpdateRepository = progressUpdateRepository;
        this.projectCommentRepository = projectCommentRepository;
        this.collaborationRequestRepository = collaborationRequestRepository;
        this.developerUserRepository = developerUserRepository;
    }

    @Override
    public List<Project> listProjects() {
        return projectRepository.findAllByOrderByUpdatedAtDesc();
    }

    @Override
    public List<Project> listCelebrationWall() {
        return projectRepository.findByCompletedTrueOrderByUpdatedAtDesc();
    }

    @Override
    public Project getProjectById(Long id) {
        return findProject(id);
    }

    @Override
    public List<ProgressUpdate> listProgressUpdates(Long projectId) {
        findProject(projectId);
        return progressUpdateRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    @Override
    public List<ProjectComment> listComments(Long projectId) {
        findProject(projectId);
        return projectCommentRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
    }

    @Override
    public List<CollaborationRequest> listCollaborationRequests(Long projectId) {
        findProject(projectId);
        return collaborationRequestRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    @Override
    public Project createProject(String requesterId, ProjectRequest request) {
        Project project = new Project();
        project.setOwnerId(requesterId);
        DeveloperUser owner = developerUserRepository.findByEmail(requesterId).orElse(null);
        project.setOwnerName(owner != null ? owner.getFullName() : requesterId);
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setStage(request.stage());
        project.setSupportRequired(request.supportRequired());
        project.setCompleted(false);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        return projectRepository.save(project);
    }

    @Override
    public Project updateProject(String requesterId, Long id, ProjectRequest request) {
        Project project = findProject(id);
        ensureOwner(requesterId, project);
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setStage(request.stage());
        project.setSupportRequired(request.supportRequired());
        project.setUpdatedAt(LocalDateTime.now());
        return projectRepository.save(project);
    }

    @Override
    public void deleteProject(String requesterId, Long id) {
        Project project = findProject(id);
        ensureOwner(requesterId, project);
        projectRepository.deleteById(id);
    }

    @Override
    public Project completeProject(String requesterId, Long id) {
        Project project = findProject(id);
        ensureOwner(requesterId, project);
        project.setCompleted(true);
        project.setStage(ProjectStage.COMPLETED);
        project.setUpdatedAt(LocalDateTime.now());
        return projectRepository.save(project);
    }

    @Override
    public ProgressUpdate addProgressUpdate(String requesterId, Long projectId, ProgressUpdateRequest request) {
        Project project = findProject(projectId);
        ensureOwner(requesterId, project);
        ProgressUpdate update = new ProgressUpdate();
        update.setProjectId(projectId);
        update.setAuthorId(requesterId);
        update.setMilestone(request.milestone());
        update.setNote(request.note());
        update.setCreatedAt(LocalDateTime.now());
        return progressUpdateRepository.save(update);
    }

    @Override
    public ProjectComment addComment(String requesterId, Long projectId, CommentRequest request) {
        findProject(projectId);
        ProjectComment comment = new ProjectComment();
        comment.setProjectId(projectId);
        comment.setAuthorId(requesterId);
        comment.setParentCommentId(null);
        comment.setMessage(request.message());
        comment.setCreatedAt(LocalDateTime.now());
        return projectCommentRepository.save(comment);
    }

    @Override
    public ProjectComment addReply(String requesterId, Long projectId, Long commentId, CommentRequest request) {
        Project project = findProject(projectId);
        ProjectComment parentComment = projectCommentRepository.findByIdAndProjectId(commentId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        ProjectComment rootComment = resolveThreadRoot(projectId, parentComment);
        boolean canReply = requesterId.equals(project.getOwnerId()) || requesterId.equals(rootComment.getAuthorId());
        if (!canReply) {
            throw new UnauthorizedActionException("Only the project owner or original commenter can reply in this thread");
        }

        ProjectComment reply = new ProjectComment();
        reply.setProjectId(projectId);
        reply.setAuthorId(requesterId);
        reply.setParentCommentId(rootComment.getId());
        reply.setMessage(request.message());
        reply.setCreatedAt(LocalDateTime.now());
        return projectCommentRepository.save(reply);
    }

    @Override
    public CollaborationRequest raiseHand(String requesterId, Long projectId, CollaborationRequestDto request) {
        Project project = findProject(projectId);

        if (project.getOwnerId().equals(requesterId)) {
            throw new IllegalArgumentException("Project owners cannot raise a hand on their own projects");
        }

        if (collaborationRequestRepository.existsByProjectIdAndRequesterIdAndStatus(
                projectId,
                requesterId,
                CollaborationRequest.Status.OPEN
        )) {
            throw new IllegalArgumentException("You already have an open collaboration request for this project");
        }

        CollaborationRequest collaborationRequest = new CollaborationRequest();
        collaborationRequest.setProjectId(projectId);
        collaborationRequest.setRequesterId(requesterId);
        collaborationRequest.setMessage(request.message());
        collaborationRequest.setStatus(CollaborationRequest.Status.OPEN);
        collaborationRequest.setCreatedAt(LocalDateTime.now());
        return collaborationRequestRepository.save(collaborationRequest);
    }

    @Override
    public CollaborationRequest acceptCollaborationRequest(String requesterId, Long projectId, Long requestId) {
        return decideCollaborationRequest(requesterId, projectId, requestId, CollaborationRequest.Status.ACCEPTED);
    }

    @Override
    public CollaborationRequest declineCollaborationRequest(String requesterId, Long projectId, Long requestId) {
        return decideCollaborationRequest(requesterId, projectId, requestId, CollaborationRequest.Status.DECLINED);
    }

    private CollaborationRequest decideCollaborationRequest(
            String requesterId,
            Long projectId,
            Long requestId,
            CollaborationRequest.Status nextStatus
    ) {
        Project project = findProject(projectId);
        ensureOwner(requesterId, project);

        CollaborationRequest request = collaborationRequestRepository.findByIdAndProjectId(requestId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Collaboration request not found"));

        if (request.getStatus() != CollaborationRequest.Status.OPEN) {
            throw new IllegalArgumentException("Only open collaboration requests can be updated");
        }

        request.setStatus(nextStatus);
        return collaborationRequestRepository.save(request);
    }

    private ProjectComment resolveThreadRoot(Long projectId, ProjectComment comment) {
        ProjectComment current = comment;
        while (current.getParentCommentId() != null) {
            current = projectCommentRepository.findByIdAndProjectId(current.getParentCommentId(), projectId)
                    .orElseThrow(() -> new IllegalArgumentException("Comment thread is invalid"));
        }
        return current;
    }

    private void ensureOwner(String requesterId, Project project) {
        if (!project.getOwnerId().equals(requesterId)) {
            throw new UnauthorizedActionException("Only the project owner can perform this action");
        }
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }
}
