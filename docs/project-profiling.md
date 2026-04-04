# Project Profiling - MzansiBuilds

## Overview
MzansiBuilds is a platform for developers to build in public, share project progress, request support, collaborate with peers, and celebrate completed work.

## Problem Statement
Developers often build in isolation, which reduces visibility, accountability, and opportunities for feedback or collaboration. MzansiBuilds addresses this by providing a public activity-driven workflow from project start to completion.

## Target Users
- Developers building personal or portfolio projects
- Developers looking for feedback or collaborators
- Community members following developer activity

## Functional Requirements
- Developer registration and login
- Profile management
- Project creation and management
- Stage and support-required tracking
- Public feed of current projects
- Comments and collaboration requests
- Milestone/progress updates
- Celebration wall for completed projects

## Non-Functional Requirements
- Secure authentication and authorization
- Responsive and user-friendly experience
- Maintainable codebase and clear architecture
- Traceable version control history
- Required UI direction: green, white, and black

## Chosen Stack
- Backend: Spring Boot (Java 17, Web, Validation, Security)
- Data layer: JPA + MySQL (development/runtime), with H2 used only for isolated tests
- Frontend shell: Next.js (to be integrated after backend stabilization)

## Why This Stack
The backend-first stack was selected to prioritize competencies that are heavily assessed: planning quality, security decisions, testability, and maintainable architecture. Spring Boot supports clean separation of concerns, strong validation, and straightforward API test automation.

## Assumptions
- Each project belongs to one developer
- Only a project owner can update or complete their project
- Authenticated developers can comment and request collaboration
- The MVP live feed is implemented as latest-activity REST responses (not WebSockets)

## MVP Scope
### Included
- Authentication API flow
- Project CRUD flow
- Progress updates
- Comments
- Collaboration requests
- Celebration wall endpoint

### Excluded (Current Iteration)
- Real-time notifications
- Direct messaging
- Advanced search/filtering
- Multi-owner team projects

## Start-Off Method
1. Analyzed challenge text and extracted user journey requirements.
2. Defined scope boundaries and assumptions.
3. Chose a backend-first architecture to satisfy judging criteria.
4. Built domain model (User, Project, ProgressUpdate, Comment, CollaborationRequest).
5. Exposed API endpoints around required flows.
6. Added initial service tests and documentation.
7. Added UML diagrams before deep feature expansion.

## UML Artifacts
- Use case diagram: [uml-use-case.md](uml-use-case.md)
- Class diagram: [uml-class-diagram.md](uml-class-diagram.md)

## Traceability
- Competence mapping: planning + UML in this document, testing in backend test classes, secure-by-design baseline in Spring Security config, AI usage in [../AI_USAGE.md](../AI_USAGE.md).
