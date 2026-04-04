# Backend

This folder contains the Spring Boot backend for MzansiBuilds.

## Why this is backend-first

The Derivco Code Skills Quest is judged heavily on structure, security, testing, documentation, and version control. Building the backend first makes it easier to prove those areas before adding UI polish.

## Included

- Spring Boot application bootstrap
- Domain entities for users, projects, progress, comments, and collaboration requests
- DTOs for request validation
- In-memory services for early flow validation
- REST controllers for health, auth, projects, feed, and celebration wall
- Basic security configuration
- Unit tests for the main backend flows
- MySQL runtime datasource with database auto-creation enabled
- H2 test datasource for isolated test execution

## Run

```bash
mvn test
mvn spring-boot:run
```
