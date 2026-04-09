---
name: react-query-data-patterns
description: Applies TanStack React Query patterns for fetching, caching, and mutation flows in React apps. Use when adding data hooks, query keys, invalidation, optimistic updates, pagination, or request state handling.
---

# React Query Data Patterns

## Goals

- Keep server state predictable and cache-friendly.
- Standardize query keys and invalidation logic.
- Avoid duplicated loading/error handling across screens.

## Core Conventions

- Use stable query key factories per resource/domain.
- Keep fetchers pure and reusable outside components.
- Set `staleTime` and retry behavior intentionally.
- Invalidate only the minimum affected keys after mutation.

## Mutation Workflow

1. Define mutation input/output types.
2. Run optimistic update only when rollback is clear.
3. Invalidate or update cache based on changed scope.
4. Surface success/error feedback in UI consistently.

## Loading and Error UX

- Prefer granular loading states over full-page blockers.
- Handle empty states separately from errors.
- Normalize API error messages before rendering.

## Testing Notes

- Test hook/component behavior with QueryClient provider.
- Reset cache between tests to avoid cross-test coupling.
- Validate invalidation behavior in mutation tests.

