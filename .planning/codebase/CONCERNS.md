# Codebase Concerns

**Analysis Date:** 2026-03-29

## Tech Debt

**Mock Data Persistence:**
- Issue: Mutations (like `createGoal`) modify exported constants from a mock file directly. This state is volatile and resets on page reload, but persists across component re-renders during the session, potentially leading to inconsistent UI states if multiple parts of the app rely on this shared mutable state without proper synchronization.
- Files: `src/features/finance/api/queries.ts`, `src/features/finance/data/financeMockData.ts`
- Impact: Unpredictable behavior during development and testing; difficult to simulate concurrent access or multiple users.
- Fix approach: Implement a more robust mock server (e.g., MSW) or a local storage-backed state for mocks.

**Type Safety (Usage of 'any'):**
- Issue: Extensive use of `any` in test files and some UI components for tooltips and event payloads.
- Files: `src/test/AccountsPage.test.tsx`, `src/test/selectors.test.ts`, `src/features/dashboard/components/CashFlowChart.tsx`
- Impact: Reduces the effectiveness of TypeScript's static analysis, making the codebase more prone to runtime errors after refactoring.
- Fix approach: Define proper interfaces or types for mock data and library-specific event payloads (e.g., Recharts tooltip props).

## Security Considerations

**Insecure ID Generation:**
- Issue: Using `Math.random().toString(36).substr(2, 9)` for generating entity IDs.
- Files: `src/features/finance/api/queries.ts`
- Current mitigation: None. It's currently used only for mock data creation.
- Recommendations: Replace with a cryptographically secure UUID generator (e.g., `crypto.randomUUID()` or the `uuid` package) to prevent ID collisions and predictability if this logic moves to a production-like environment.

## Performance Bottlenecks

**Simulated API Latency:**
- Issue: Every "API" call has a hardcoded `setTimeout` delay (600ms to 800ms).
- Files: `src/features/finance/api/queries.ts`
- Cause: Intentional simulation of network latency.
- Improvement path: Ensure this simulation is easily toggleable for performance testing and that UI loading states (skeletons) are consistently implemented across all pages to handle the perceived lag.

## Test Coverage Gaps

**Feature Coverage:**
- What's not tested: Most feature pages (Bills, Goals, Dashboard) and shared components (Modal, Typography, Layouts) lack dedicated unit or integration tests.
- Files: `src/features/bills/BillsPage.tsx`, `src/features/goals/GoalsPage.tsx`, `src/features/dashboard/DashboardOverview.tsx`, `src/components/ui/Modal.tsx`
- Risk: Regressions in core financial logic or UI interactions might go unnoticed.
- Priority: High

**Utility and SEO Coverage:**
- What's not tested: `PageMetadata` and shared layout logic.
- Files: `src/components/seo/PageMetadata.tsx`, `src/components/layouts/DashboardLayout.tsx`
- Risk: Broken SEO tags or layout issues across the application.
- Priority: Medium

---

*Concerns audit: 2026-03-29*
