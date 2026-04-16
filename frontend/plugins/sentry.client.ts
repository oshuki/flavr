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
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
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
})
