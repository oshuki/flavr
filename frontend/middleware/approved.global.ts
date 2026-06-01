const PUBLIC = ['/auth', '/auth/callback', '/pending']

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC.some(p => to.path.startsWith(p))) return

  const client = useSupabaseClient()

  // Use getSession() directly — waits for async session restore from localStorage
  const { data: { session } } = await client.auth.getSession()
  if (!session?.user?.id) return

  // Admin always gets through
  if (session.user.email === 'oshuki@gmail.com') return

  // Always fetch fresh from DB — revoked access takes effect on next navigation
  const { data } = await client
    .from('profiles')
    .select('is_approved')
    .eq('id', session.user.id)
    .single()

  if (!data?.is_approved) return navigateTo('/pending')
})
