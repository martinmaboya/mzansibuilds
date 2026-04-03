# Test-Driven Development Evidence

## What TDD Means in This Project
Test-Driven Development is the practice of writing tests that describe expected behavior, then implementing or adjusting the code so those tests pass.

## How the Backend Tests Are Structured
The MzansiBuilds backend includes tests for the main user journey flows:
- health check endpoint
- project creation
- project completion
- milestone progress updates
- comments
- collaboration requests
- error handling for missing projects

## Why These Tests Matter
These tests focus on the same behaviors that the challenge brief asks for. That means they protect the project from regressions in the core flows that matter most for assessment.

## TDD Workflow Used
1. Define expected behavior in a test.
2. Implement the smallest change needed for the test to pass.
3. Refactor safely while keeping the test suite green.
4. Keep the tests in CI so changes are validated automatically.

## Evidence in the Repo
- Backend service tests: [backend/src/test/java/com/mzansibuilds/backend/service](../backend/src/test/java/com/mzansibuilds/backend/service)
- Health endpoint test: [backend/src/test/java/com/mzansibuilds/backend/controller/HealthControllerTest.java](../backend/src/test/java/com/mzansibuilds/backend/controller/HealthControllerTest.java)
- CI workflow: [../.github/workflows/ci.yml](../.github/workflows/ci.yml)

## Insight
TDD is valuable because it turns requirements into executable checks. For MzansiBuilds, that means the important user journey is protected by repeatable tests rather than only manual verification.
