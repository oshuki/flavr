import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const router = useRouter()

  if (!config.public.sentryDsn) {
    console.warn('Sentry DSN not configured')
    return
  }

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: config.public.sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.breadcrumbsIntegration({
        console: true,
        dom: true,
        fetch: true,
        history: true,
        xhr: true,
      }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
    
    // Release Tracking
    release: process.env.NUXT_PUBLIC_APP_VERSION || 'development',
    
    // Performance Monitoring
    beforeSend(event) {
      // User-Daten aus Supabase anhängen (falls eingeloggt)
      const user = nuxtApp.$supabase?.auth?.getUser?.()
      if (user) {
        event.user = {
          id: user.id,
          email: user.email,
        }
      }
      return event
    },
   
    // Ignore bestimmte Fehler
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
    ],
  })

  // Capture Vue errors
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    Sentry.captureException(error, {
      contexts: {
        vue: {
          componentName: instance?.$options.name,
          propsData: instance?.$props,
          info,
        },
      },
    })
  }

  // Track page views
  router.afterEach((to) => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${to.path}`,
      level: 'info',
    })
  })
})
