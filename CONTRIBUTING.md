# Contributing to Stockway

Thank you for your interest in contributing to Stockway. We are building critical infrastructure for rural supply chains, where reliability and correctness are paramount.

## Contribution Philosophy

*   **Quality Over Speed**: We value robust, maintainable code over quick fixes. Take the time to understand the system before changing it.
*   **Role Integrity**: Respect the boundaries between user roles (Shopkeeper, Warehouse, Rider). Cross-contamination of permissions is a critical failure.
*   **Backend Authority**: The backend is the source of truth. Frontend changes should be reflections of backend capabilities, not workarounds for backend deficiencies.

## Development Standards

### Python / Django
*   Follow **PEP 8** style guidelines.
*   Keep views thin and business logic in services or model methods where appropriate.
*   Use DRF serializers for all data validation.
*   Ensure all new models have proper indices and constraints.

### React / TypeScript
*   Use **TypeScript** strictly; avoid `any`.
*   Prefer functional components and Hooks.
*   Keep components small, focused, and reusable.
*   Follow the existing directory structure and naming conventions.

## Branching & Commits

*   **Branch Naming**: Use descriptive prefixes.
    *   `feat/`: New features
    *   `fix/`: Bug fixes
    *   `docs/`: Documentation updates
    *   `refactor/`: Code improvements without behavior changes
    *   Example: `feat/add-rider-payout-calculation`

*   **Commit Messages**: Write clear, imperative subject lines.
    *   Good: "Implement geospatial query for nearby warehouses"
    *   Bad: "wip", "fixed bug", "updated code"

## Testing Expectations

*   **Pass Local Tests**: Ensure `pytest` passes before pushing.
*   **No Tricks**: Do not modify test settings or bypass checks to force a pass.
*   **Regression Testing**: If you fix a bug, add a test case to prevent it from returning.
*   **Integrity**: Tests must reflect real-world usage. Use factories to generate valid test data.

## Security & Responsibility

*   **No Secrets**: Never commit API keys, passwords, or production secrets. Use environment variables.
*   **Permission Checks**: Every API endpoint must have an appropriate permission class.
*   **Data Safety**: Migrations must be non-destructive whenever possible.
*   **Review**: All code changes require review. Do not self-merge critical changes without a second pair of eyes.

By contributing, you agree to uphold these standards and maintain the professional integrity of the platform.
