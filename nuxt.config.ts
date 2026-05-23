// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { createResolver } from "nuxt/kit"
const { resolve } = createResolver(import.meta.url)
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n', '@nuxt/fonts', '@nuxt/icon', '@vueuse/nuxt', '@element-plus/nuxt', 'nuxt-swiper', 'nuxt-vue3-google-signin'],
  css: ['~/assets/sass/main.sass', '~/assets/css/tailwind.css', '~/assets/css/design-editor.css'],
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json' },
      { code: 'es', language: 'es-MX', file: 'es.json' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    build: {
      sourcemap: false,
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      allowedHosts: [process.env.NUXT_PUBLIC_HOST ?? 'uandiplus.test','uandiplus.com'],
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: process.env.NUXT_PUBLIC_HOST ?? 'uandiplus.test',
        port: 5173,
        clientPort: 80,
      },
    },
  },
  icon: {
    provider: 'server',
    localApiEndpoint: '/_nuxt_icon',
    customCollections: [
      {
        prefix: 'icon',
        dir: resolve('./app/assets/icons'),
        // if you want to include all the icons in nested directories:
        // recursive: true,
      },
      {
        prefix: 'ruuul',
        dir: resolve('./app/assets/ruuul-icons'),
      },
    ],
  },
  googleSignIn: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  elementPlus: {
    defaultLocale: 'en',
  },
  devServer: {
    host: '127.0.0.1',
    port: 3000,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '/api',
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? process.env.STRIPE_PUBLISHABLE_KEY ?? '',
    },
  },
  ssr: process.env.NUXT_PUBLIC_SSR !== 'false',

  routeRules: {
    // Auth-protected pages → client-only shell (no SSR prerender)
    '/account/**': { ssr: false },
    '/es/account/**': { ssr: false },
    // Checkout & order flow → client-only shell
    '/order/**': { ssr: false },
    '/es/order/**': { ssr: false },
    '/checkout/**': { ssr: false },
    '/es/checkout/**': { ssr: false },
    // Design editor (Konva canvas) → client-only shell
    '/design/**': { ssr: false },
    '/es/design/**': { ssr: false },
    // Dynamic product & category routes → client-only shell
    '/products/**': { ssr: false },
    '/es/products/**': { ssr: false },
    '/categories/**': { ssr: false },
    '/es/categories/**': { ssr: false },
    '/:section/product': { ssr: false },
    '/es/:section/product': { ssr: false },
  },

  nitro: {
    preset: process.env.NUXT_PUBLIC_PRESET,
  },
})
