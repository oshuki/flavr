export const useProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isApproved = useState<boolean | null>('profile-approved', () => null)
  const isAdmin    = useState<boolean>('profile-admin', () => false)

  const loadProfile = async (forUserId?: string) => {
    const uid = forUserId ?? user.value?.id
    if (!uid) return
    const { data } = await supabase
      .from('profiles')
      .select('is_approved, is_admin')
      .eq('id', uid)
      .single()

    isApproved.value = data?.is_approved ?? false
    isAdmin.value    = data?.is_admin    ?? false
  }

  const allProfiles = async () => {
    const { data } = await supabase.rpc('get_all_profiles')
    return data ?? []
  }

  const setApproved = async (targetId: string, approved: boolean) => {
    await supabase.rpc('set_user_approved', {
      target_user_id: targetId,
      approved,
    })
  }

  return {
    isApproved: readonly(isApproved),
    isAdmin:    readonly(isAdmin),
    loadProfile,
    allProfiles,
    setApproved,
  }
}
