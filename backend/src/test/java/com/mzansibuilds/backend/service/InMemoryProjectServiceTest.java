package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.CollaborationRequestDto;
import com.mzansibuilds.backend.dto.CommentRequest;
import com.mzansibuilds.backend.dto.ProgressUpdateRequest;
import com.mzansibuilds.backend.dto.ProjectRequest;
import com.mzansibuilds.backend.entity.Project;
import com.mzansibuilds.backend.entity.ProjectStage;
import com.mzansibuilds.backend.entity.SupportType;
import com.mzansibuilds.backend.exception.UnauthorizedActionException;
import com.mzansibuilds.backend.repository.CollaborationRequestRepository;
import com.mzansibuilds.backend.repository.DeveloperUserRepository;
import com.mzansibuilds.backend.repository.ProgressUpdateRepository;
import com.mzansibuilds.backend.repository.ProjectCommentRepository;
import com.mzansibuilds.backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class InMemoryProjectServiceTest {

    @Autowired
    private InMemoryProjectService service;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private ProjectCommentRepository projectCommentRepository;

    @Autowired
    private CollaborationRequestRepository collaborationRequestRepository;

    @Autowired
    private DeveloperUserRepository developerUserRepository;

    @Autowired
    private InMemoryAuthService authService;

    private static final String OWNER_EMAIL = "developer@example.com";

    @BeforeEach
    void setUp() {
        collaborationRequestRepository.deleteAll();
        projectCommentRepository.deleteAll();
        progressUpdateRepository.deleteAll();
        projectRepository.deleteAll();
        developerUserRepository.deleteAll();
        authService.register(new com.mzansibuilds.backend.dto.RegisterRequest(
                "Developer User",
                OWNER_EMAIL,
                "devpass123!",
                "Owner account",
                null,
                null
        ));
    }

    @Test
    void createProjectAddsProjectToFeed() {
        ProjectRequest request = new ProjectRequest(
                "Open Ledger",
                "Project management tracker",
                ProjectStage.PLANNING,
                SupportType.FEEDBACK
        );

        Project project = service.createProject(OWNER_EMAIL, request);

        assertEquals("Open Ledger", project.getTitle());
        assertEquals(ProjectStage.PLANNING, project.getStage());
        assertTrue(service.listProjects().stream().anyMatch(item -> item.getId().equals(project.getId())));
    }

    @Test
    void completeProjectMovesProjectToCelebrationWall() {
        Project project = service.createProject(OWNER_EMAIL, new ProjectRequest(
                "MzansiBuilds",
                "Public build tracker",
                ProjectStage.IN_PROGRESS,
                SupportType.BACKEND_HELP
        ));
        Project completedProject = service.completeProject(OWNER_EMAIL, project.getId());

        assertTrue(completedProject.isCompleted());
        assertEquals(ProjectStage.COMPLETED, completedProject.getStage());
        assertTrue(service.listCelebrationWall().stream().anyMatch(item -> item.getId().equals(project.getId())));
    }

    @Test
    void addProgressUpdateCapturesMilestoneForProject() {
        Project project = service.createProject(OWNER_EMAIL, new ProjectRequest(
                "MzansiBuilds",
                "Public build tracker",
                ProjectStage.IN_PROGRESS,
                SupportType.BACKEND_HELP
        ));

        var update = service.addProgressUpdate(
                OWNER_EMAIL,
                project.getId(),
                new ProgressUpdateRequest("Auth flow", "Added registration and login endpoints")
        );

        assertEquals(project.getId(), update.getProjectId());
        assertEquals("Auth flow", update.getMilestone());
        assertEquals("Added registration and login endpoints", update.getNote());
    }

    @Test
    void addCommentCapturesCommentForProject() {
        Project project = service.createProject(OWNER_EMAIL, new ProjectRequest(
                "MzansiBuilds",
                "Public build tracker",
                ProjectStage.IN_PROGRESS,
                SupportType.BACKEND_HELP
        ));

        var comment = service.addComment(
                OWNER_EMAIL,
                project.getId(),
                new CommentRequest("This looks clean and ready for review")
        );

        assertEquals(project.getId(), comment.getProjectId());
        assertEquals("This looks clean and ready for review", comment.getMessage());
    }

    @Test
    void raiseHandCreatesOpenCollaborationRequest() {
        Project project = service.createProject(OWNER_EMAIL, new ProjectRequest(
                "MzansiBuilds",
                "Public build tracker",
                ProjectStage.IN_PROGRESS,
                SupportType.BACKEND_HELP
        ));

        var request = service.raiseHand(
                OWNER_EMAIL,
                project.getId(),
                new CollaborationRequestDto("Happy to help with the backend validation")
        );

        assertEquals(project.getId(), request.getProjectId());
        assertEquals("Happy to help with the backend validation", request.getMessage());
        assertEquals("OPEN", request.getStatus().name());
    }

    @Test
    void completeUnknownProjectThrowsHelpfulError() {
        assertThrows(IllegalArgumentException.class, () -> service.completeProject("developer@example.com", "missing-project"));
    }

    @Test
    void updateByNonOwnerIsRejected() {
        ProjectRequest request = new ProjectRequest(
                "Updated title",
                "Updated description",
                ProjectStage.TESTING,
                SupportType.BACKEND_HELP
        );

        Project project = service.createProject(OWNER_EMAIL, new ProjectRequest(
                "MzansiBuilds",
                "Public build tracker",
                ProjectStage.IN_PROGRESS,
                SupportType.BACKEND_HELP
        ));

        assertThrows(UnauthorizedActionException.class, () ->
                service.updateProject("someone-else", project.getId(), request)
        );
    }
}
