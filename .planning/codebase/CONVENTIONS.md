# Coding Conventions

**Analysis Date:** 2026-03-29

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `src/components/ui/Modal.tsx`, `src/features/accounts/AccountsPage.tsx`)
- Logic/Data: camelCase (e.g., `src/features/finance/api/queries.ts`, `src/features/dashboard/mocks/dashboardData.ts`)
- Tests: suffix `.test.tsx` or `.test.ts` (e.g., `src/test/AccountsPage.test.tsx`)

**Functions:**
- Components: Named exports using `export function ComponentName` (e.g., `export function Modal` in `src/components/ui/Modal.tsx`)
- Hooks/Utilities: camelCase (e.g., `useAccounts`, `renderWithProviders`)
- Selectors: Prefix `get` (e.g., `getFinancialSummary`, `getGoalsProgress`)

**Variables:**
- State/Props: camelCase (e.g., `isOpen`, `onClose`)
- Constants: camelCase or UPPER_CASE (observed camelCase for mock data)

**Types:**
- Interfaces: PascalCase (e.g., `interface ModalProps`)
- Prop Types: Suffix `Props` (e.g., `ModalProps`)

## Code Style

**Formatting:**
- Indentation: 2 spaces
- Quotes: Single quotes for imports and strings (observed in `src/components/ui/Modal.tsx`)
- Semicolons: Always used

**Linting:**
- Config: Enforced via `tsconfig.json` ("strict": true, "noUnusedLocals": true)
- Tool: ESLint/Prettier (configs absent but code matches common React/Vite defaults)

## Import Organization

**Order:**
1. React and standard libraries (`react`, `react-dom`)
2. External dependencies (`react-router-dom`, `@tanstack/react-query`)
3. Internal features/components (`../features/...`)
4. Styles/Types (if applicable)

**Path Aliases:**
- Not detected in `tsconfig.json`. Relative paths are used (e.g., `../features/finance/api/queries`).

## Error Handling

**Patterns:**
- Early returns for guard clauses (e.g., `if (!isOpen) return null;`)
- React Query for API error states (isError, error)

## Logging

**Framework:** console (no dedicated logging library detected)

## Comments

**When to Comment:**
- Minimal commenting observed. Comments used for high-level test descriptions or explaining logic (e.g., `// Mock das queries` in `src/test/AccountsPage.test.tsx`).

## Function Design

**Size:** Small, focused functions. Components use hooks (`useRef`, `useEffect`) to manage side effects.

**Parameters:** Named parameters via objects/interfaces for props.

**Return Values:** Explicit functional component returns or inferred types for utility functions.

## Module Design

**Exports:** Prefer named exports (e.g., `export function`, `export const`).

**Barrel Files:** Not frequently used; direct imports from file paths are preferred.

---

*Convention analysis: 2026-03-29*
