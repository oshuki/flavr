// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  
  // Disable SSR for SPA mode - fixes IPC errors
  ssr: false,
  
  // Nitro preset for static generation
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    }
  },
  
  app: {
    head: {
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/icon-192.png' }
      ],
      meta: [
        { name: 'theme-color', content: '#1C1917' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Flavr' }
      ]
    }
  },
  
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
    },
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      secure: true
    },
    clientOptions: {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storage: process.client ? window.localStorage : undefined,
        storageKey: 'sb-auth-token',
      }
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
    devOptions: {
      enabled: false, // Disable in dev, only production
    },
    strategies: 'generateSW',
    manifest: {
      name: 'Flavr - Rezeptverwaltung',
      short_name: 'Flavr',
      description: 'Deine persönliche Rezeptverwaltung mit KI-Unterstützung',
      theme_color: '#1C1917',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      icons: [
        { 
          src: '/icon-192.png', 
          sizes: '192x192', 
          type: 'image/png',
          purpose: 'any maskable'
        },
        { 
          src: '/icon-512.png', 
          sizes: '512x512', 
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/htescszituyzooubmxkh\.supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            }
          }
        },
        {
          urlPattern: /^https:\/\/.*\.railway\.app\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 5 // 5 minutes
            }
          }
        }
      ]
    }
  },

  devtools: { enabled: true },
})
