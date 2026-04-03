package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.CollaborationRequestDto;
import com.mzansibuilds.backend.dto.CommentRequest;
import com.mzansibuilds.backend.dto.ProgressUpdateRequest;
import com.mzansibuilds.backend.dto.ProjectRequest;
import com.mzansibuilds.backend.entity.CollaborationRequest;
import com.mzansibuilds.backend.entity.Project;
import com.mzansibuilds.backend.entity.ProjectComment;
import com.mzansibuilds.backend.entity.ProjectStage;
import com.mzansibuilds.backend.entity.ProgressUpdate;
import com.mzansibuilds.backend.entity.SupportType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class InMemoryProjectService implements ProjectService {

    private final List<Project> projects = new ArrayList<>();
    private final List<ProgressUpdate> updates = new ArrayList<>();
    private final List<ProjectComment> comments = new ArrayList<>();
    private final List<CollaborationRequest> collaborationRequests = new ArrayList<>();

    public InMemoryProjectService() {
        Project project = new Project();
        project.setId("project_1");
        project.setOwnerId("user_1");
        project.setOwnerName("Martin Maboya");
        project.setTitle("MzansiBuilds");
        project.setDescription("Public build tracker for the Derivco Code Skills Quest.");
        project.setStage(ProjectStage.IN_PROGRESS);
        project.setSupportRequired(SupportType.BACKEND_HELP);
        project.setCompleted(false);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        projects.add(project);
    }

    @Override
    public List<Project> listProjects() {
        return projects.stream()
                .sorted(Comparator.comparing(Project::getUpdatedAt).reversed())
                .toList();
    }

    @Override
    public List<Project> listCelebrationWall() {
        return projects.stream()
                .filter(Project::isCompleted)
                .sorted(Comparator.comparing(Project::getUpdatedAt).reversed())
                .toList();
    }

    @Override
    public Project createProject(ProjectRequest request) {
        Project project = new Project();
        project.setId("project_" + (projects.size() + 1));
        project.setOwnerId("user_1");
        project.setOwnerName("Martin Maboya");
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setStage(request.stage());
        project.setSupportRequired(request.supportRequired());
        project.setCompleted(false);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        projects.add(project);
        return project;
    }

    @Override
    public Project updateProject(String id, ProjectRequest request) {
        Project project = findProject(id);
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setStage(request.stage());
        project.setSupportRequired(request.supportRequired());
        project.setUpdatedAt(LocalDateTime.now());
        return project;
    }

    @Override
    public Project completeProject(String id) {
        Project project = findProject(id);
        project.setCompleted(true);
        project.setStage(ProjectStage.COMPLETED);
        project.setUpdatedAt(LocalDateTime.now());
        return project;
    }

    @Override
    public ProgressUpdate addProgressUpdate(String projectId, ProgressUpdateRequest request) {
        findProject(projectId);
        ProgressUpdate update = new ProgressUpdate();
        update.setId("update_" + (updates.size() + 1));
        update.setProjectId(projectId);
        update.setAuthorId("user_1");
        update.setMilestone(request.milestone());
        update.setNote(request.note());
        update.setCreatedAt(LocalDateTime.now());
        updates.add(update);
        return update;
    }

    @Override
    public ProjectComment addComment(String projectId, CommentRequest request) {
        findProject(projectId);
        ProjectComment comment = new ProjectComment();
        comment.setId("comment_" + (comments.size() + 1));
        comment.setProjectId(projectId);
        comment.setAuthorId("user_1");
        comment.setMessage(request.message());
        comment.setCreatedAt(LocalDateTime.now());
        comments.add(comment);
        return comment;
    }

    @Override
    public CollaborationRequest raiseHand(String projectId, CollaborationRequestDto request) {
        findProject(projectId);
        CollaborationRequest collaborationRequest = new CollaborationRequest();
        collaborationRequest.setId("request_" + (collaborationRequests.size() + 1));
        collaborationRequest.setProjectId(projectId);
        collaborationRequest.setRequesterId("user_1");
        collaborationRequest.setMessage(request.message());
        collaborationRequest.setStatus(CollaborationRequest.Status.OPEN);
        collaborationRequest.setCreatedAt(LocalDateTime.now());
        collaborationRequests.add(collaborationRequest);
        return collaborationRequest;
    }

    private Project findProject(String id) {
        Optional<Project> project = projects.stream().filter(item -> item.getId().equals(id)).findFirst();
        return project.orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }
}
