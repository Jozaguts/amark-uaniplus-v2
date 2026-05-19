# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm install` — install dependencies
- `pnpm dev` — start the local dev server (Nuxt on port 3000, Vite HMR on 5173)
- `pnpm build` — production build
- `pnpm generate` — static site generation
- `pnpm preview` — preview production build

No test or lint commands are configured yet. When added, prefer Vitest for unit logic and Playwright for browser flows; expose them as `pnpm test` and `pnpm lint`.

## Architecture

**uandiplus** is a Nuxt 4 e-commerce storefront with an integrated canvas-based design editor. Key layers:

- **Pages** (`app/pages/`) — file-based routing. Category pages (`women`, `men`, `kids`, `dogs`, `cats`) share a common structure via `app/pages/content/[section].vue`. The design editor lives at `app/pages/design/[id].vue` and uses Konva (via `app/plugins/vue-konva.client.ts`).
- **Composables** (`app/composables/`) — all data-fetching and shared state lives here. `useStorefront.ts` wraps the `$storefront` plugin for typed API calls. `useDesignCart.ts` and `useDesignDrafts.ts` manage editor state.
- **API client** (`app/plugins/storefront.ts`) — injects `$storefront` and `$fetch` on `NuxtApp`. Errors are normalized through `normalizeStorefrontError`. Types for API responses are in `types/storefront.d.ts` and sibling files under `types/`.
- **Types** (`types/`) — root-level `.d.ts` files define shared domain types (product, cart, draft, editor). Local component-scoped types live in `app/types/`.
- **i18n** — all visible copy must use translation keys. Locales are at `i18n/locales/en.json` and `i18n/locales/es.json`. Always update both files together. Use `useLocalePath()` for locale-aware `NuxtLink` `to` props.

## Key Modules & Integrations

| Module | Purpose |
|---|---|
| `@nuxtjs/i18n` | EN/ES localization, `prefix_except_default` strategy |
| `@element-plus/nuxt` | UI component library (auto-imported) |
| `@nuxt/icon` | Icon system with custom collection at `app/assets/icons/` (prefix `icon`) |
| `@vueuse/nuxt` | VueUse composables (auto-imported) |
| `nuxt-swiper` | Carousel/slider |
| `nuxt-vue3-google-signin` | Google OAuth (client ID via `GOOGLE_CLIENT_ID` env var) |
| `vue-konva` | HTML5 canvas design editor (client-only plugin) |

Runtime config (`.env`): `NUXT_PUBLIC_API_BASE`, `GOOGLE_CLIENT_ID`, `GOOGLE_MAPS_API_KEY`, `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## Coding Conventions

- Vue SFCs with `<script setup lang="ts">`. Two-space indentation.
- PascalCase for components (`HeroSection.vue`), `useX.ts` for composables, lowercase for page filenames.
- Follow `antfu` conventions for TypeScript and tooling. ESLint, when added, should use `@antfu/eslint-config`.
- Use Tailwind for all layout, spacing, color, and typography. Avoid broad custom CSS; `app/assets/sass/main.sass` is for global base styles only.
- Never hardcode user-facing text in templates or scripts — always use i18n keys.
- Do not edit `.nuxt/` or `node_modules/`.

## Dev Server Notes

The Vite server is configured to run on `127.0.0.1:5173` with `strictPort: true` and expects host `uandiplus.test` (or `NUXT_PUBLIC_HOST` env override). The Nuxt dev server binds to `127.0.0.1:3000`. Ensure your local hosts file maps `uandiplus.test` to `127.0.0.1` for HMR to work correctly.
