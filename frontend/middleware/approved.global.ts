// Unprotected routes that never need approval check
const PUBLIC = ['/auth', '/auth/callback', '/pending']

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC.some(p => to.path.startsWith(p))) return

  const user = useSupabaseUser()
  if (!user.value) return  // supabase module handles redirect to /auth

  // Admin email always gets through without DB check
  if (user.value.email === 'oshuki@gmail.com') return

  const { isApproved, loadProfile } = useProfile()

  if (isApproved.value === null) await loadProfile()
  if (!isApproved.value) return navigateTo('/pending')
})
