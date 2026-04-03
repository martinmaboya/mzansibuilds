package com.mzansibuilds.backend.controller;

import com.mzansibuilds.backend.dto.CollaborationRequestDto;
import com.mzansibuilds.backend.dto.CommentRequest;
import com.mzansibuilds.backend.dto.ProgressUpdateRequest;
import com.mzansibuilds.backend.dto.ProjectRequest;
import com.mzansibuilds.backend.entity.CollaborationRequest;
import com.mzansibuilds.backend.entity.Project;
import com.mzansibuilds.backend.entity.ProjectComment;
import com.mzansibuilds.backend.entity.ProgressUpdate;
import com.mzansibuilds.backend.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<Project> listProjects() {
        return projectService.listProjects();
    }

    @PostMapping
    public Project createProject(@Valid @RequestBody ProjectRequest request) {
        return projectService.createProject(request);
    }

    @GetMapping("/{id}")
    public Project getProject(@PathVariable String id) {
        return projectService.listProjects().stream()
                .filter(project -> project.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable String id, @Valid @RequestBody ProjectRequest request) {
        return projectService.updateProject(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable String id) {
        projectService.listProjects().stream()
                .filter(project -> project.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }

    @PatchMapping("/{id}/complete")
    public Project completeProject(@PathVariable String id) {
        return projectService.completeProject(id);
    }

    @PostMapping("/{id}/updates")
    public ProgressUpdate addUpdate(@PathVariable String id, @Valid @RequestBody ProgressUpdateRequest request) {
        return projectService.addProgressUpdate(id, request);
    }

    @PostMapping("/{id}/comments")
    public ProjectComment addComment(@PathVariable String id, @Valid @RequestBody CommentRequest request) {
        return projectService.addComment(id, request);
    }

    @PostMapping("/{id}/raise-hand")
    public CollaborationRequest raiseHand(@PathVariable String id, @Valid @RequestBody CollaborationRequestDto request) {
        return projectService.raiseHand(id, request);
    }
}
