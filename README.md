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
- MySQL runtime database with automatic creation enabled from the JDBC URL
- H2 test profile for isolated backend test runs

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

## Code Version Control Evidence

- Competence write-up: [docs/code-version-control.md](docs/code-version-control.md)
- CI workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)

## Test-Driven Development Evidence

- Competence write-up: [docs/test-driven-development.md](docs/test-driven-development.md)
- Backend service tests: [backend/src/test/java/com/mzansibuilds/backend/service](backend/src/test/java/com/mzansibuilds/backend/service)
- Controller test: [backend/src/test/java/com/mzansibuilds/backend/controller/HealthControllerTest.java](backend/src/test/java/com/mzansibuilds/backend/controller/HealthControllerTest.java)

## Secure By Design Evidence

- Competence write-up: [docs/secure-by-design.md](docs/secure-by-design.md)
- Security config: [backend/src/main/java/com/mzansibuilds/backend/security/SecurityConfig.java](backend/src/main/java/com/mzansibuilds/backend/security/SecurityConfig.java)
- Ownership checks: [backend/src/main/java/com/mzansibuilds/backend/service/InMemoryProjectService.java](backend/src/main/java/com/mzansibuilds/backend/service/InMemoryProjectService.java)
