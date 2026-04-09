---
name: frontend-testing-vitest-rtl
description: Guides frontend testing with Vitest and React Testing Library in this project. Use when creating or updating component tests, hook tests, test setup, mocks, async assertions, or regression coverage.
---

# Frontend Testing (Vitest + RTL)

## Quick Rules

- Test user-observable behavior before implementation details.
- Prefer `screen` queries and accessible selectors.
- Use async utilities (`findBy`, `waitFor`) for state transitions.
- Keep test data realistic and minimal.

## Test Design

1. Arrange with realistic props/providers.
2. Act through user interactions.
3. Assert visible outcomes and side effects.
4. Cover success, loading, empty, and error states.

## Project Conventions

- Reuse shared setup in `src/test/setup.ts` when possible.
- Keep imports compatible with `@/` alias.
- Mock network boundaries, not internal component structure.

## Anti-patterns

- Avoid snapshot-heavy tests for dynamic editor content.
- Avoid asserting private state or implementation-only class names.
- Avoid over-mocking core libraries when integration behavior matters.

## Checklist Before Finish

- New behavior has at least one regression test.
- Async flows are awaited correctly (no flaky timing).
- Test titles describe business behavior.
- `npm run test` passes for changed scope.

