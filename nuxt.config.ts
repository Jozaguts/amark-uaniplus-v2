// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { createResolver } from "nuxt/kit"
const { resolve } = createResolver(import.meta.url)
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n', '@nuxt/fonts', '@nuxt/icon'],
  css: ['~/assets/css/tailwind.css','~/assets/sass/main.sass'],
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json' },
      { code: 'es', language: 'es-MX', file: 'es.json' }
    ],
    defaultLocale: 'en',
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  icon: {
    customCollections: [
      {
        prefix: 'icon',
        dir: resolve('./app/assets/icons'),
        // if you want to include all the icons in nested directories:
        // recursive: true,
      },
    ],
  },
})