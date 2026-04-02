# Code Version Control and CI/CD Evidence

## Objective
This document demonstrates Git version control practices and CI/CD workflow capability for the Derivco Code Skills competence.

## Git Repository Practices Used
- Public GitHub repository created and linked to the assessment platform.
- Frequent, focused commits with clear intent.
- Competence-based commits to keep submission evidence traceable.
- Pull-request ready history through quality-gated CI on push and PR events.

## Commit Strategy
The repository uses small, purposeful commits instead of one bulk upload.

Examples from current history:
- Initial repository setup
- Project profiling evidence commit
- UML refinement commit

This supports assessors in verifying iterative development and decision traceability.

## Branching and Collaboration Model
- Primary branch: main
- Change model: feature work prepared locally in small units, then merged/pushed with clean commit messages.
- Recommended extension: use short-lived feature branches for larger changes before merge.

## CI/CD Pipeline Implemented
Workflow file: .github/workflows/ci.yml

Pipeline behavior:
- Triggers on push to main
- Triggers on pull requests targeting main
- Runs backend test stage with Maven on Ubuntu runner
- Uses Java 17 setup and Maven dependency caching
- Applies a simple quality gate job after tests

## Why This Meets the Competence
- Demonstrates practical Git usage in day-to-day development.
- Provides automated validation before integration.
- Shows understanding of CI/CD fundamentals: trigger, build/test stage, and merge gate.
- Supports maintainability and confidence in code changes.

## Next Improvements
- Add frontend CI checks once frontend implementation starts.
- Add code style and static analysis steps.
- Add release workflow for tagged versions.
