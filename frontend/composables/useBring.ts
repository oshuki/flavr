interface BringAuthData {
  uuid: string
  name: string
  email: string
  access_token: string
  refresh_token: string
}

interface BringList {
  listUuid: string
  name: string
  theme: string
}

interface BringItem {
  name: string
  spec?: string
}

export const useBring = () => {
  // Only run on client
  if (process.server) {
    return {
      bringData: ref(null),
      selectedList: ref(null),
      lists: ref([]),
      isConnected: ref(false),
      isLoading: ref(false),
      error: ref(null),
      loadBringData: () => {},
      bringLogin: async () => ({ success: false, error: 'Not available on server' }),
      bringGetLists: async () => ({ success: false, error: 'Not available on server' }),
      bringSelectList: async () => {},
      bringAddItems: async () => ({ success: false, error: 'Not available on server' }),
      bringLogout: async () => {},
    }
  }

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const bringData = useState<BringAuthData | null>('bring-data', () => null)
  const selectedList = useState<BringList | null>('bring-selected-list', () => null)
  const lists = useState<BringList[]>('bring-lists', () => [])
  const isConnected = useState<boolean>('bring-connected', () => false)
  const isLoading = useState<boolean>('bring-loading', () => false)
  const error = useState<string | null>('bring-error', () => null)

  // Load Bring! data from user metadata
  const loadBringData = async () => {
    if (!user.value) return
    
    const { data, error: metaError } = await supabase.auth.getUser()
    
    if (metaError) {
      console.error('Error loading user metadata:', metaError)
      return
    }

    const metadata = data.user?.user_metadata
    
    if (metadata?.bring_uuid && metadata?.bring_token) {
      bringData.value = {
        uuid: metadata.bring_uuid,
        name: metadata.bring_name || '',
        email: metadata.bring_email || '',
        access_token: metadata.bring_token,
        refresh_token: metadata.bring_refresh_token || '',
      }
      
      if (metadata.bring_list_id && metadata.bring_list_name) {
        selectedList.value = {
          listUuid: metadata.bring_list_id,
          name: metadata.bring_list_name,
          theme: metadata.bring_list_theme || 'ch.publisheria.bring.theme.home',
        }
      }
      
      isConnected.value = true
    }
  }

  // Login to Bring!
  const bringLogin = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${backendUrl}/api/bring/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login fehlgeschlagen')
      }

      bringData.value = data
      isConnected.value = true

      // Save to user metadata
      await saveBringDataToMetadata(data)

      return { success: true, data }
    } catch (e: any) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  // Get shopping lists
  const bringGetLists = async () => {
    if (!bringData.value) {
      error.value = 'Nicht eingeloggt'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${backendUrl}/api/bring/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: bringData.value.access_token,
          uuid: bringData.value.uuid,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Listen konnten nicht geladen werden')
      }

      lists.value = data.lists || []
      return { success: true, lists: lists.value }
    } catch (e: any) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  // Select a list
  const bringSelectList = async (list: BringList) => {
    selectedList.value = list

    // Save to user metadata
    if (!user.value) return

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        bring_list_id: list.listUuid,
        bring_list_name: list.name,
        bring_list_theme: list.theme,
      },
    })

    if (updateError) {
      console.error('Error saving list selection:', updateError)
    }
  }

  // Add items to list
  const bringAddItems = async (items: BringItem[]) => {
    if (!bringData.value || !selectedList.value) {
      error.value = 'Keine Liste ausgewählt'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${backendUrl}/api/bring/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: bringData.value.access_token,
          uuid: bringData.value.uuid,
          listId: selectedList.value.listUuid,
          items,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Artikel konnten nicht hinzugefügt werden')
      }

      return { success: data.success, results: data.results, message: data.message }
    } catch (e: any) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const bringLogout = async () => {
    bringData.value = null
    selectedList.value = null
    lists.value = []
    isConnected.value = false

    // Clear user metadata
    if (!user.value) return

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        bring_uuid: null,
        bring_name: null,
        bring_email: null,
        bring_token: null,
        bring_refresh_token: null,
        bring_list_id: null,
        bring_list_name: null,
        bring_list_theme: null,
      },
    })

    if (updateError) {
      console.error('Error clearing Bring! data:', updateError)
    }
  }

  // Helper: Save Bring! auth data to user metadata
  const saveBringDataToMetadata = async (data: BringAuthData) => {
    if (!user.value) return

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        bring_uuid: data.uuid,
        bring_name: data.name,
        bring_email: data.email,
        bring_token: data.access_token,
        bring_refresh_token: data.refresh_token,
      },
    })

    if (updateError) {
      console.error('Error saving Bring! data:', updateError)
    }
  }

  return {
    bringData,
    selectedList,
    lists,
    isConnected,
    isLoading,
    error,
    loadBringData,
    bringLogin,
    bringGetLists,
    bringSelectList,
    bringAddItems,
    bringLogout,
  }
}
