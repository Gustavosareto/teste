# Testing Patterns

**Analysis Date:** 2026-03-29

## Test Framework

**Runner:**
- **Vitest** 4.1.2
- Config: Configured via `package.json` "test": "vitest run".

**Assertion Library:**
- **Vitest** `expect`, `describe`, `it`
- **@testing-library/jest-dom** for DOM assertions (e.g., `toBeInTheDocument`).

**Run Commands:**
```bash
npm run test           # Run all tests using Vitest
```

## Test File Organization

**Location:**
- Centralized in `src/test/` (e.g., `src/test/AccountsPage.test.tsx`, `src/test/selectors.test.ts`).

**Naming:**
- Suffix: `.test.tsx` for components, `.test.ts` for logic.

**Structure:**
```
src/test/
├── AccountsPage.test.tsx
├── Navigation.test.tsx
└── selectors.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from 'vitest';
// ... test code ...
describe('Feature or Page Name', () => {
  it('should perform a specific action', () => {
    // ... test logic ...
  });
});
```

**Patterns:**
- **Arrange-Act-Assert (AAA):** Data setup, component rendering, then DOM/result checks.
- **renderWithProviders:** Helper to wrap components with `QueryClientProvider` and `MemoryRouter` (seen in `src/test/AccountsPage.test.tsx`).

## Mocking

**Framework:** **Vitest** (vi)

**Patterns:**
```typescript
import { vi } from 'vitest';
import * as queries from '../features/finance/api/queries';

vi.mock('../features/finance/api/queries', async () => {
  const actual = await vi.importActual('../features/finance/api/queries');
  return { ...actual, useAccounts: vi.fn() };
});

// Setup specific mock implementation per test
vi.mocked(queries.useAccounts).mockReturnValue({ ... });
```

**What to Mock:**
- API hooks (React Query)
- Router context (via helper)

**What NOT to Mock:**
- Pure functions (selectors/utils) where possible.
- UI components (render whole trees for integration value).

## Fixtures and Factories

**Test Data:**
- Native JSON objects/arrays directly in tests or from mock data files (e.g., `src/features/dashboard/mocks/dashboardData.ts`).

**Location:**
- `src/features/[feature]/mocks/`
- `src/features/[feature]/data/`

## Coverage

**Requirements:** No coverage reporting script detected in `package.json`.

## Test Types

**Unit Tests:**
- Selectors and utility functions (e.g., `src/test/selectors.test.ts`).

**Integration Tests:**
- Component/Page level tests checking rendering and mock data handling (e.g., `src/test/AccountsPage.test.tsx`).

**E2E Tests:**
- Not detected in the current codebase.

## Common Patterns

**Async Testing:**
- `waitFor()` from `@testing-library/react`.

**Error Testing:**
- Mocking failed states (isError: true) and checking DOM for error messages/empty states.

---

*Testing analysis: 2026-03-29*
