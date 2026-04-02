# MzansiBuilds

MzansiBuilds is a standalone backend-first project scaffold for the Derivco Code Skills Quest. The challenge brief is centered on how well the platform handles account management, project creation, live activity, collaboration, progress updates, completion, and documentation.

## What the judges are likely to look for

- Clear project profiling and scope decisions
- Small, meaningful Git commits and visible version control history
- Tests that prove the important flows work
- Secure-by-design thinking such as validation and ownership checks
- Strong documentation, including AI usage disclosure
- Evidence of your own thinking, not just generated output

## Backend-first scope

The current focus is the API and domain structure for:

- developer auth
- project CRUD
- live feed data
- comments
- collaboration requests
- progress updates
- celebration wall data

## Stack

- Spring Boot backend in `backend/`
- Next.js frontend shell in `frontend/` for later expansion
- TypeScript and Tailwind CSS for the UI layer when needed
- In-memory backend service layer first, with JPA repositories already scaffolded for later persistence

## Run locally

```bash
cd backend
mvn test
mvn spring-boot:run
```

## Assessment notes

- Keep the repo public before the Sonke deadline.
- Commit in small steps.
- Document assumptions and trade-offs.
- Add tests early once the core backend routes are stabilized.
- Be explicit about AI usage and keep final decisions human-owned.

## Project Profiling Evidence

- Profiling write-up: [docs/project-profiling.md](docs/project-profiling.md)
- UML use case diagram: [docs/uml-use-case.md](docs/uml-use-case.md)
- UML class diagram: [docs/uml-class-diagram.md](docs/uml-class-diagram.md)
- Backend planning notes: [docs/backend-plan.md](docs/backend-plan.md)
- AI usage disclosure: [AI_USAGE.md](AI_USAGE.md)
