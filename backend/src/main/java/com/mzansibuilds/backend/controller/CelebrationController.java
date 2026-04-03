package com.mzansibuilds.backend.controller;

import com.mzansibuilds.backend.entity.Project;
import com.mzansibuilds.backend.service.ProjectService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/celebration")
public class CelebrationController {

    private final ProjectService projectService;

    public CelebrationController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<Project> wall() {
        return projectService.listCelebrationWall();
    }
}
