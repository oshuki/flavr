// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  
  modules: [
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt',
  ],

  runtimeConfig: {
    // Server-only secrets (never exposed to client)
    // ... add server secrets here if needed

    // Public runtime config (exposed to client)
    public: {
      backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NUXT_PUBLIC_SUPABASE_KEY || '',
      }
    }
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY || '',
    redirectOptions: {
      login: '/auth',
      callback: '/auth/callback',
      exclude: [],
    }
  },

  pwa: {
    manifest: {
      name: 'Flavr',
      short_name: 'Flavr',
      description: 'Deine persönliche Rezeptverwaltung',
      theme_color: '#FFF6EE',
      icons: [
        { 
          src: '/icon-192.png', 
          sizes: '192x192', 
          type: 'image/png' 
        },
        { 
          src: '/icon-512.png', 
          sizes: '512x512', 
          type: 'image/png' 
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
    }
  },

  devtools: { enabled: true },
})
