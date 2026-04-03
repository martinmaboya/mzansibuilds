package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.ProjectRequest;
import com.mzansibuilds.backend.dto.ProgressUpdateRequest;
import com.mzansibuilds.backend.dto.CommentRequest;
import com.mzansibuilds.backend.dto.CollaborationRequestDto;
import com.mzansibuilds.backend.entity.Project;
import com.mzansibuilds.backend.entity.ProjectStage;
import com.mzansibuilds.backend.entity.SupportType;
import com.mzansibuilds.backend.exception.UnauthorizedActionException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InMemoryProjectServiceTest {

    private final InMemoryProjectService service = new InMemoryProjectService();

    @Test
    void createProjectAddsProjectToFeed() {
        ProjectRequest request = new ProjectRequest(
                "Open Ledger",
                "Project management tracker",
                ProjectStage.PLANNING,
                SupportType.FEEDBACK
        );

        Project project = service.createProject("developer@example.com", request);

        assertEquals("Open Ledger", project.getTitle());
        assertEquals(ProjectStage.PLANNING, project.getStage());
        assertTrue(service.listProjects().stream().anyMatch(item -> item.getId().equals(project.getId())));
    }

    @Test
    void completeProjectMovesProjectToCelebrationWall() {
        Project completedProject = service.completeProject("developer@example.com", "project_1");

        assertTrue(completedProject.isCompleted());
        assertEquals(ProjectStage.COMPLETED, completedProject.getStage());
        assertTrue(service.listCelebrationWall().stream().anyMatch(item -> item.getId().equals("project_1")));
    }

    @Test
    void addProgressUpdateCapturesMilestoneForProject() {
        var update = service.addProgressUpdate(
                "developer@example.com",
                "project_1",
                new ProgressUpdateRequest("Auth flow", "Added registration and login endpoints")
        );

        assertEquals("project_1", update.getProjectId());
        assertEquals("Auth flow", update.getMilestone());
        assertEquals("Added registration and login endpoints", update.getNote());
    }

    @Test
    void addCommentCapturesCommentForProject() {
        var comment = service.addComment(
                "developer@example.com",
                "project_1",
                new CommentRequest("This looks clean and ready for review")
        );

        assertEquals("project_1", comment.getProjectId());
        assertEquals("This looks clean and ready for review", comment.getMessage());
    }

    @Test
    void raiseHandCreatesOpenCollaborationRequest() {
        var request = service.raiseHand(
                "developer@example.com",
                "project_1",
                new CollaborationRequestDto("Happy to help with the backend validation")
        );

        assertEquals("project_1", request.getProjectId());
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

        assertThrows(UnauthorizedActionException.class, () ->
                service.updateProject("someone-else", "project_1", request)
        );
    }
}
