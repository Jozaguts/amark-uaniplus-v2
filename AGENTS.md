# Repository Guidelines

## Project Structure & Module Organization

This is a minimal Nuxt 4 application. The main app entry is `app/app.vue`, which currently renders the Nuxt welcome screen and route announcer. Nuxt configuration lives in `nuxt.config.ts`, TypeScript settings in `tsconfig.json`, and static public assets in `public/`. Generated Nuxt artifacts are written to `.nuxt/` and should not be edited directly. Dependencies are managed with `pnpm-lock.yaml`, so prefer pnpm.

As the app grows, keep Nuxt conventions: pages in `app/pages/`, reusable Vue components in `app/components/`, composables in `app/composables/`, layouts in `app/layouts/`, and server routes or API handlers in `server/`.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies and run Nuxt preparation through `postinstall`.
- `pnpm dev`: start the local development server, usually at `http://localhost:3000`.
- `pnpm build`: build the production application.
- `pnpm generate`: generate a static version of the site.
- `pnpm preview`: preview the production build locally after `pnpm build`.

## Coding Style & Naming Conventions

Use Vue 3 single-file components with TypeScript where practical. Keep indentation at two spaces in Vue, TypeScript, JSON, and config files. Name Vue components in PascalCase, for example `ProductCard.vue`; name composables with the `useThing.ts` pattern; and keep route files lowercase, for example `app/pages/about.vue`.

This repository does not currently define ESLint, Prettier, or a formatter script. Follow the existing Nuxt style: ESM modules, concise config files, and single quotes in TypeScript.

## Testing Guidelines

No test framework or test script is configured yet. When adding tests, prefer Vitest for unit tests and Playwright for browser flows. Place tests close to the feature or in a clear `tests/` directory, and name files with `.test.ts` or `.spec.ts`. Add `pnpm test` with the first test suite.

## Commit & Pull Request Guidelines

Git history currently only contains the initial `init` commit, so there is no established commit convention. Use short, imperative commit messages such as `Add landing page shell` or `Configure test runner`.

Pull requests should include a concise summary, any setup or migration notes, screenshots for visible UI changes, and the commands run for verification, such as `pnpm build`.

## Agent-Specific Instructions

Do not edit generated directories such as `.nuxt/` or dependency folders such as `node_modules/`. Keep changes scoped to source, config, documentation, or public assets unless the task explicitly requires dependency updates.
