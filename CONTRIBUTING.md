# CONTRIBUTING GUIDELINES
## Retail Inventory Management System (RIMS)
**Project Code:** `PRG_RIMS_001`  

Thank you for contributing to the Retail Inventory Management System. To maintain code quality, security, and architectural integrity, please adhere to these guidelines:

### 1. Code Standards
- **Java**: Follow Google Java Style Guide. Maintain separation of concerns: Controllers -> Services -> Repositories -> Entities. Always use DTOs for API payloads.
- **TypeScript & React**: Use functional components, explicit typing for all props and API responses, Tailwind utility classes, and accessible semantic HTML.
- **SQL / Migrations**: All database schema changes must be submitted as versioned Flyway migration scripts under `backend/src/main/resources/db/migration/V{N}__{description}.sql`. Never modify existing applied migrations.

### 2. Branching & Commit Conventions
- Branch naming: `feature/epic-{number}-{description}`, `bugfix/{issue-id}`, `docs/{topic}`.
- Conventional Commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.

### 3. Testing Requirements
- Every new business logic feature must be accompanied by JUnit 5 unit or Mockito integration tests.
- Verify that `mvn clean test` and `npm test` pass before raising a pull request.
