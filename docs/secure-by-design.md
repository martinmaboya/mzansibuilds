# Secure By Design Evidence

## Security Principle
Security was treated as a baseline design requirement, not a final patch. The backend now enforces authentication for non-public routes and applies authorization checks on owner-only operations.

## Security Controls Implemented

### 1. Authentication Boundary
- Public endpoints: `/api/health`, `/api/auth/**`
- Protected endpoints: all remaining API routes require authentication
- Configured in Spring Security filter chain

### 2. Password Protection
- Registration hashes passwords using BCrypt before storage
- Plain-text password persistence is avoided

### 3. Authorization and Ownership Checks
- Project mutation actions (update, complete, milestone updates) enforce owner-only access
- Non-owner attempts are rejected with a 403 response

### 4. Input Validation and Error Safety
- Request DTOs use Bean Validation annotations (`@NotBlank`, `@Email`, `@NotNull`)
- Validation failures are normalized through a global exception handler
- Ownership failures return explicit `403 Forbidden` instead of unsafe behavior

### 5. Security-Focused Testing Evidence
- Tests verify owner-only restrictions and secure mutation behavior
- Tests validate core authenticated write flows

## Files Demonstrating This Competence
- Security configuration: [backend/src/main/java/com/mzansibuilds/backend/security/SecurityConfig.java](../backend/src/main/java/com/mzansibuilds/backend/security/SecurityConfig.java)
- Ownership enforcement: [backend/src/main/java/com/mzansibuilds/backend/service/InMemoryProjectService.java](../backend/src/main/java/com/mzansibuilds/backend/service/InMemoryProjectService.java)
- Forbidden exception: [backend/src/main/java/com/mzansibuilds/backend/exception/UnauthorizedActionException.java](../backend/src/main/java/com/mzansibuilds/backend/exception/UnauthorizedActionException.java)
- Global error handling: [backend/src/main/java/com/mzansibuilds/backend/exception/GlobalExceptionHandler.java](../backend/src/main/java/com/mzansibuilds/backend/exception/GlobalExceptionHandler.java)
- Security tests: [backend/src/test/java/com/mzansibuilds/backend/service/InMemoryProjectServiceTest.java](../backend/src/test/java/com/mzansibuilds/backend/service/InMemoryProjectServiceTest.java)

## Insight
The key secure-by-design insight is to enforce constraints at architecture boundaries (authentication and authorization) and domain boundaries (ownership checks), then prove them with tests.
