# Repository Guidelines

## Project Purpose

This project is a Nuxt 4 site focused on high-fidelity visual replication from a reference website. The stack is Vue 3, Nuxt 4, Tailwind CSS, TypeScript, and pnpm. Add libraries only when there is a real need; prefer native Nuxt/Vue/Tailwind patterns first.

Use the provided URL and screenshots as references. Do not copy protected assets unless the user confirms permission.

## Project Structure & Module Organization

The current app entry is `app/app.vue`. Nuxt config lives in `nuxt.config.ts`, TypeScript settings in `tsconfig.json`, and static files in `public/`. Do not edit `.nuxt/` or `node_modules/`.

Follow Nuxt conventions:

- `app/pages/`: route pages.
- `app/components/`: reusable Vue components.
- `app/composables/`: shared `useThing.ts` composables.
- `app/layouts/`: Nuxt layouts.
- `server/`: server routes and utilities.
- `app/assets/`: build-processed assets.
- `public/`: direct static files.

## Commands

- `pnpm install`: install dependencies.
- `pnpm dev`: start the local server, usually `http://localhost:3000`.
- `pnpm build`: build for production.
- `pnpm generate`: generate a static site.
- `pnpm preview`: preview the production build after `pnpm build`.

## Coding Style

Use Vue single-file components with TypeScript where practical. Keep two-space indentation. Name components in PascalCase (`HeroSection.vue`), composables as `useX.ts`, and pages with lowercase URL names (`app/pages/about.vue`).

Follow `antfu` conventions for TypeScript, pnpm, organization, and future ESLint setup. If linting is added, prefer `@antfu/eslint-config` and expose `pnpm lint`.

All user-facing text must use i18n. Add or update translation keys in root locale files `i18n/locales/en.json` and `i18n/locales/es.json` together; do not hardcode visible copy in Vue templates or scripts.

## Visual Replication Workflow

Start with URL, desktop screenshot, mobile screenshot, and key states such as menu open, hover, modal, carousel, or validation. Implement section by section.

Use Tailwind for layout, spacing, color, typography, and responsive rules. Avoid broad custom CSS. Create reusable components only when repetition is real.

Verify desktop and mobile before closing UI work. Text must not overflow, overlap, or disappear.

## Testing Guidelines

No test framework is configured. When introduced, prefer Vitest for unit logic and Playwright for browser flows. Name tests `*.test.ts` or `*.spec.ts`. Add `pnpm test`.

## Commit & Pull Request Guidelines

History only contains `init`, so no convention is established. Use short, imperative messages such as `Add replicated hero section`.

Pull requests should include a summary, reference URL/screenshots, UI screenshots, and verification commands such as `pnpm build`.

## Agent-Specific Instructions

Use `.agents/skills/nuxt` as the primary Nuxt skill because this repo uses Nuxt 4. Treat `.codex/skills/nuxt` as secondary because it is Nuxt 3.x-based. Use `antfu` for tooling and code style.

For replication tasks, use URL plus screenshots. Browse the live site for interaction, responsive behavior, or exact structure. Use screenshots for visual fidelity.

Do not include routine verification footers such as `pnpm build passed` or the current dev server URL in final responses unless the user explicitly asks for verification details or a server status update.
