import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  // Valores por defecto; se sobrescriben con las variables NUXT_* de .env.*
  runtimeConfig: {
    apiSecret: '',
    public: {
      appEnv: 'development',
      siteUrl: '',
      apiBase: '',
      turnstileSiteKey: '',
    },
  },

  // El panel admin y la cuenta del cliente son SPA: la sesion vive en memoria del navegador
  routeRules: {
    '/admin': { ssr: false },
    '/admin/**': { ssr: false },
    '/cuenta': { ssr: false },
    '/cuenta/**': { ssr: false },
    '/login': { ssr: false },
    '/registro': { ssr: false },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'La Bendita Lencería',
      meta: [
        { name: 'description', content: 'Tienda online de lencería La Bendita.' },
      ],
    },
  },
})
