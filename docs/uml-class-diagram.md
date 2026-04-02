# MzansiBuilds UML Diagrams

Prepared for Derivco Code Skills Quest - Project Profiling

## Class Diagram - main domain model for the MVP

Class Diagram - entities, key attributes, and relationships used by the backend

```mermaid
classDiagram
    class User {
        +Long id
        +String fullName
        +String email
        +String password
        +String bio
        +String githubLink
        +String linkedinLink
        +LocalDateTime createdAt
    }

    class Project {
        +Long id
        +String title
        +String description
        +ProjectStage stage
        +String supportRequired
        +ProjectStatus status
        +boolean completed
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class ProgressUpdate {
        +Long id
        +String milestoneTitle
        +String content
        +LocalDateTime createdAt
    }

    class Comment {
        +Long id
        +String content
        +LocalDateTime createdAt
    }

    class CollaborationRequest {
        +Long id
        +String message
        +RequestStatus status
        +LocalDateTime createdAt
    }

    User "1" --> "0..*" Project : owns
    User "1" --> "0..*" Comment : author
    User "1" --> "0..*" ProgressUpdate : author
    User "1" --> "0..*" CollaborationRequest : creates
    Project "1" --> "0..*" ProgressUpdate : has
    Project "1" --> "0..*" Comment : has
    Project "1" --> "0..*" CollaborationRequest : targets
```

## Backend architecture intent

Layered Spring Boot design with Controller -> Service -> Repository. JWT secures private actions, DTOs handle input/output, and ownership checks ensure only project owners can edit, update, or complete their own projects.
