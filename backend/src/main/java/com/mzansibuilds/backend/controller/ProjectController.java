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

import java.security.Principal;
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
    public Project createProject(Principal principal, @Valid @RequestBody ProjectRequest request) {
        return projectService.createProject(principal.getName(), request);
    }

    @GetMapping("/{id}")
    public Project getProject(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    @PutMapping("/{id}")
    public Project updateProject(Principal principal, @PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return projectService.updateProject(principal.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(Principal principal, @PathVariable Long id) {
        projectService.deleteProject(principal.getName(), id);
    }

    @PatchMapping("/{id}/complete")
    public Project completeProject(Principal principal, @PathVariable Long id) {
        return projectService.completeProject(principal.getName(), id);
    }

    @PostMapping("/{id}/updates")
    public ProgressUpdate addUpdate(Principal principal, @PathVariable Long id, @Valid @RequestBody ProgressUpdateRequest request) {
        return projectService.addProgressUpdate(principal.getName(), id, request);
    }

    @PostMapping("/{id}/comments")
    public ProjectComment addComment(Principal principal, @PathVariable Long id, @Valid @RequestBody CommentRequest request) {
        return projectService.addComment(principal.getName(), id, request);
    }

    @PostMapping("/{id}/raise-hand")
    public CollaborationRequest raiseHand(Principal principal, @PathVariable Long id, @Valid @RequestBody CollaborationRequestDto request) {
        return projectService.raiseHand(principal.getName(), id, request);
    }
}
