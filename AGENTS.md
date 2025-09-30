# Repository Guidelines

## Project Structure & Module Organization
The Vite + React app lives at the repository root. `index.tsx` bootstraps the UI, while `App.tsx` wires core editors. UI panels, modals, and shared icons sit in `components/`; keep new visual elements there alongside their styles. API integrations belong in `services/` (see `services/geminiService.ts` for the Gemini client). Shared TypeScript contracts go in `types.ts`. Bundled assets output to `dist/`; avoid manual edits because the directory is regenerated during builds.

## Build, Test & Development Commands
Run `npm install` once to fetch dependencies. Use `npm run dev` for the live Vite server with hot reload. Before committing, run `npm run build` to ensure production bundling passes and assets compile. Preview the production build locally with `npm run preview`. For quick type validation, use `npx tsc --noEmit` to surface TypeScript errors without building.

## Coding Style & Naming Conventions
Code is TypeScript-first with React functional components. Use 2-space indentation, `PascalCase` for component files (`AddProductModal.tsx`), and `camelCase` for variables, hooks, and helper functions. Keep JSX lean and prefer declarative hooks over class-like patterns. Centralize reusable SVGs or UI primitives in `components/` to avoid duplication. When touching styles, follow the utility-class approach already present in JSX and edit `index.css` only for global resets.

## Testing Guidelines
Automated tests are not yet configured—treat `npm run build` and manual smoke tests (upload, edit, export flows) as the minimum bar. When introducing automated coverage, prefer Vitest plus React Testing Library to match the Vite toolchain. Name future test files `*.test.ts(x)` and keep them colocated with the component under test for easier maintenance.

## Commit & Pull Request Guidelines
Write imperative, focused commit titles (`fix: maintain crop aspect ratio`). If a change bundles multiple areas, use Conventional Commit types where possible for clarity. Every pull request should include a concise summary, verification notes (commands run), and screenshots or clips when the UI shifts. Link relevant issues or tickets and call out any API or environment updates so reviewers can validate integrations.

## Environment & Security Tips
Create `.env.local` with `GEMINI_API_KEY=...`; never commit API keys or service credentials. Regenerate the key if it leaks. Validate that new endpoints funnel through `services/geminiService.ts` so secrets stay server-side when the app is deployed.
