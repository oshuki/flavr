<template>
  <div class="settings-page">
    <div class="settings-container">
      <h1>⚙️ Einstellungen</h1>

      <!-- Data Management -->
      <div class="settings-section">
        <h2>📦 Daten-Verwaltung</h2>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-label">Alle Rezepte exportieren</div>
            <div class="setting-sub">Lade alle deine Rezepte als JSON-Datei herunter</div>
          </div>
          <button class="btn-secondary" @click="exportData" :disabled="exporting">
            {{ exporting ? 'Exportiere...' : '💾 Export' }}
          </button>
        </div>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-label">Rezepte importieren</div>
            <div class="setting-sub">JSON-Datei mit Rezepten hochladen</div>
          </div>
          <label class="btn-secondary" style="cursor: pointer; margin: 0;">
            📂 Import
            <input
              type="file"
              accept=".json,application/json"
              style="display: none"
              @change="importData"
            >
          </label>
        </div>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-label">Rezeptanzahl</div>
            <div class="setting-sub">Aktuell gespeicherte Rezepte</div>
          </div>
          <div class="stat-badge">
            {{ recipes.length }} Rezepte
          </div>
        </div>
      </div>

      <!-- Import from Text/URL -->
      <div class="settings-section">
        <h2>📥 Import-Optionen</h2>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-label">Rezept aus URL importieren</div>
            <div class="setting-sub">Instagram, TikTok, oder andere Links</div>
          </div>
          <button class="btn-secondary" @click="showUrlImport = true">
            🔗 URL Import
          </button>
        </div>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-label">Rezept aus Text importieren</div>
            <div class="setting-sub">Kopierten Text einfügen</div>
          </div>
          <button class="btn-secondary" @click="showTextImport = true">
            📝 Text Import
          </button>
        </div>
      </div>

      <!-- Bring! Integration -->
      <ClientOnly>
        <div class="settings-section">
          <h2>🛒 Bring! Shopping List</h2>

          <div v-if="!bringConnected" class="settings-row">
            <div class="setting-info">
              <div class="setting-label">Mit Bring! verbinden</div>
              <div class="setting-sub">Exportiere Zutaten direkt zu deiner Einkaufsliste</div>
            </div>
            <button class="btn-secondary" @click="showBringLogin = true">
              🔗 Verbinden
            </button>
          </div>

          <div v-else>
            <div class="settings-row">
              <div class="setting-info">
                <div class="setting-label">Verbunden mit Bring!</div>
                <div class="setting-sub">{{ bringData?.email }}</div>
              </div>
              <button class="btn-secondary" @click="handleBringLogout">
                🔌 Trennen
              </button>
            </div>

            <div class="settings-row">
              <div class="setting-info">
                <div class="setting-label">Aktive Einkaufsliste</div>
                <div class="setting-sub">
                  {{ selectedList?.name || 'Keine Liste ausgewählt' }}
                </div>
              </div>
              <button class="btn-secondary" @click="loadAndShowLists">
                📋 Liste wählen
              </button>
            </div>
          </div>
        </div>
      </ClientOnly>

      <!-- Danger Zone -->
      <div class="settings-section danger-section">
        <h2>⚠️ Gefahrenzone</h2>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-label">Alle Daten löschen</div>
            <div class="setting-sub">
              Diese Aktion kann nicht rückgängig gemacht werden!
            </div>
          </div>
          <button class="btn-secondary btn-danger" @click="confirmClearAll">
            🗑️ Alles löschen
          </button>
        </div>
      </div>

      <!-- PWA Info -->
      <div class="settings-section">
        <h2>📱 PWA Installation</h2>
        <div class="pwa-info">
          <p><strong>Auf iPhone installieren:</strong></p>
          <ol>
            <li>Öffne diese Seite in Safari</li>
            <li>Tippe auf den <strong>Teilen-Button</strong> (☐↑)</li>
            <li>Wähle <strong>"Zum Home-Bildschirm"</strong></li>
            <li>Die App erscheint als Icon auf deinem Homescreen</li>
          </ol>
          <p style="margin-top: 16px;">
            <strong>Vorteile:</strong> Offline-Nutzung, App-ähnliche Experience, schneller Zugriff
          </p>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <div class="about-info">
          <p><strong>Flavr</strong> - Deine persönliche Rezeptverwaltung</p>
          <p style="color: var(--muted); font-size: 14px; margin-top: 8px;">
            Version 2.0 • Built with Nuxt 3 & ❤️
          </p>
        </div>
      </div>
    </div>

    <!-- URL Import Modal -->
    <div v-if="showUrlImport" class="modal-overlay" @click="showUrlImport = false">
      <div class="modal-content" @click.stop>
        <h3>🔗 Rezept aus URL importieren</h3>
        <p class="modal-sub">Füge einen Link zu einem Rezept ein (z.B. Instagram, TikTok)</p>
        
        <input
          v-model="urlInput"
          type="url"
          class="form-input"
          placeholder="https://..."
          style="margin-bottom: 16px;"
        >
        
        <div class="modal-actions">
          <button class="btn-secondary" @click="showUrlImport = false">
            Abbrechen
          </button>
          <button
            class="btn-primary"
            :disabled="!urlInput || importing"
            @click="importFromUrl"
          >
            {{ importing ? 'Importiere...' : 'Importieren' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Text Import Modal -->
    <div v-if="showTextImport" class="modal-overlay" @click="showTextImport = false">
      <div class="modal-content" @click.stop>
        <h3>📝 Rezept aus Text importieren</h3>
        <p class="modal-sub">Füge kopierten Rezepttext ein</p>
        
        <textarea
          v-model="textInput"
          class="form-textarea"
          placeholder="Title: ...
Zutaten:
- ...
Schritte:
1. ..."
          rows="10"
          style="margin-bottom: 16px;"
        ></textarea>
        
        <div class="modal-actions">
          <button class="btn-secondary" @click="showTextImport = false">
            Abbrechen
          </button>
          <button
            class="btn-primary"
            :disabled="!textInput || importing"
            @click="importFromText"
          >
            {{ importing ? 'Analysiere...' : 'Analysieren & Importieren' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3>⚠️ Alle Daten löschen?</h3>
        <p>
          Möchtest du wirklich <strong>ALLE {{ recipes.length }} Rezepte</strong> löschen?
          Diese Aktion kann nicht rückgängig gemacht werden!
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">
            Abbrechen
          </button>
          <button class="btn-primary btn-danger" @click="handleClearAll">
            Alle Daten löschen
          </button>
        </div>
      </div>
    </div>

    <!-- Bring! Login Modal -->
    <ClientOnly>
      <div v-if="showBringLogin" class="modal-overlay" @click="showBringLogin = false">
        <div class="modal-content" @click.stop>
          <h3>🛒 Mit Bring! verbinden</h3>
          <p class="modal-sub">Gib deine Bring! Login-Daten ein</p>
          
          <input
            v-model="bringEmail"
            type="email"
            class="form-input"
            placeholder="E-Mail"
            style="margin-bottom: 12px;"
          >
          
          <input
            v-model="bringPassword"
            type="password"
            class="form-input"
            placeholder="Passwort"
            style="margin-bottom: 16px;"
          >
          
          <p v-if="bringError" style="color: #c33; margin-bottom: 16px; font-size: 14px;">
            {{ bringError }}
          </p>
          
          <div class="modal-actions">
            <button class="btn-secondary" @click="showBringLogin = false">
              Abbrechen
            </button>
            <button
              class="btn-primary"
              :disabled="!bringEmail || !bringPassword || bringLoading"
              @click="handleBringLogin"
            >
              {{ bringLoading ? 'Verbinde...' : 'Verbinden' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Bring! List Selection Modal -->
      <div v-if="showBringLists" class="modal-overlay" @click="showBringLists = false">
        <div class="modal-content" @click.stop>
          <h3>📋 Einkaufsliste wählen</h3>
          <p class="modal-sub">Wähle die Liste für deine Rezeptzutaten</p>
          
          <div v-if="bringLoading" style="text-align: center; padding: 20px;">
            Lade Listen...
          </div>
          
          <div v-else-if="bringLists.length === 0" style="text-align: center; padding: 20px; color: var(--muted);">
            Keine Listen gefunden
          </div>
          
          <div v-else style="margin-bottom: 16px;">
            <div
              v-for="list in bringLists"
              :key="list.listUuid"
              class="list-option"
              :class="{ active: selectedList?.listUuid === list.listUuid }"
              @click="handleSelectList(list)"
            >
              📋 {{ list.name }}
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-secondary" @click="showBringLists = false">
              Schließen
            </button>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types'

const { recipes, loadRecipes, saveRecipe, deleteRecipe } = useRecipes()
const { parseRecipeFromText } = useAI()
const { categorizeRecipe } = useCategories()

// Bring! composable
const {
  bringData,
  selectedList,
  lists: bringLists,
  isConnected: bringConnected,
  isLoading: bringLoading,
  error: bringError,
  loadBringData,
  bringLogin,
  bringGetLists,
  bringSelectList,
  bringLogout,
} = useBring()

const exporting = ref(false)
const importing = ref(false)
const showUrlImport = ref(false)
const showTextImport = ref(false)
const showDeleteModal = ref(false)
const showBringLogin = ref(false)
const showBringLists = ref(false)
const urlInput = ref('')
const textInput = ref('')
const bringEmail = ref('')
const bringPassword = ref('')

// Export all recipes as JSON
const exportData = () => {
  exporting.value = true
  
  try {
    const data = {
      recipes: recipes.value,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    }
    
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `flavr-recipes-${Date.now()}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export error:', e)
    alert('Fehler beim Export')
  } finally {
    exporting.value = false
  }
}

// Import recipes from JSON file
const importData = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  importing.value = true

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    const recipesToImport = data.recipes || data || []
    
    if (!Array.isArray(recipesToImport)) {
      throw new Error('Ungültiges Format')
    }

    // Save all recipes
    for (const recipe of recipesToImport) {
      await saveRecipe({
        ...recipe,
        id: recipe.id || crypto.randomUUID(),
        createdAt: recipe.createdAt || Date.now(),
      })
    }

    await loadRecipes()
    alert(`${recipesToImport.length} Rezepte importiert!`)
  } catch (e) {
    console.error('Import error:', e)
    alert('Fehler beim Import. Bitte überprüfe die Datei.')
  } finally {
    importing.value = false
    input.value = '' // Reset
  }
}

// Import from URL
const importFromUrl = async () => {
  if (!urlInput.value) return

  importing.value = true

  try {
    // For now, use text parsing (in production, you might fetch the URL content)
    const response = await fetch(urlInput.value)
    const html = await response.text()
    
    // Extract text from HTML (simplified)
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    
    const parsed = await parseRecipeFromText(text)
    
    if (parsed) {
      const recipe: Recipe = {
        id: crypto.randomUUID(),
        title: parsed.title || 'Importiertes Rezept',
        category: categorizeRecipe(parsed),
        duration: parsed.duration || 0,
        servings: parsed.servings || 2,
        ingredients: parsed.ingredients || [],
        steps: parsed.steps || [],
        tags: ['Import', 'URL'],
        sourceApp: urlInput.value,
        isFavorite: false,
        createdAt: Date.now(),
      }
      
      await saveRecipe(recipe)
      navigateTo(`/recipe/${recipe.id}`)
    } else {
      alert('Konnte kein Rezept aus der URL extrahieren')
    }
  } catch (e) {
    console.error('URL import error:', e)
    alert('Fehler beim Import. Bitte versuche es mit einer anderen URL.')
  } finally {
    importing.value = false
    showUrlImport.value = false
    urlInput.value = ''
  }
}

// Import from text
const importFromText = async () => {
  if (!textInput.value) return

  importing.value = true

  try {
    const parsed = await parseRecipeFromText(textInput.value)
    
    if (parsed) {
      const recipe: Recipe = {
        id: crypto.randomUUID(),
        title: parsed.title || 'Importiertes Rezept',
        category: categorizeRecipe(parsed),
        duration: parsed.duration || 0,
        servings: parsed.servings || 2,
        ingredients: parsed.ingredients || [],
        steps: parsed.steps || [],
        tags: ['Import', 'Text'],
        isFavorite: false,
        createdAt: Date.now(),
      }
      
      await saveRecipe(recipe)
      navigateTo(`/recipe/${recipe.id}`)
    } else {
      alert('Konnte kein Rezept aus dem Text extrahieren')
    }
  } catch (e) {
    console.error('Text import error:', e)
    alert('Fehler beim Import')
  } finally {
    importing.value = false
    showTextImport.value = false
    textInput.value = ''
  }
}

// Clear all data
const confirmClearAll = () => {
  showDeleteModal.value = true
}

const handleClearAll = async () => {
  try {
    // Delete all recipes
    for (const recipe of recipes.value) {
      await deleteRecipe(recipe.id)
    }
    
    showDeleteModal.value = false
    alert('Alle Daten wurden gelöscht')
    navigateTo('/')
  } catch (e) {
    console.error('Clear all error:', e)
    alert('Fehler beim Löschen')
  }
}

// Bring! handlers
const handleBringLogin = async () => {
  const result = await bringLogin(bringEmail.value, bringPassword.value)
  
  if (result.success) {
    showBringLogin.value = false
    bringEmail.value = ''
    bringPassword.value = ''
    
    // Auto-load lists
    setTimeout(() => loadAndShowLists(), 500)
  }
}

const handleBringLogout = async () => {
  if (confirm('Möchtest du die Verbindung zu Bring! trennen?')) {
    await bringLogout()
  }
}

const loadAndShowLists = async () => {
  const result = await bringGetLists()
  
  if (result.success) {
    showBringLists.value = true
  } else {
    alert('Fehler beim Laden der Listen: ' + result.error)
  }
}

const handleSelectList = async (list: any) => {
  await bringSelectList(list)
  showBringLists.value = false
}

onMounted(() => {
  if (recipes.value.length === 0) {
    loadRecipes()
  }
  
  // Load Bring! data from user metadata
  loadBringData()
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-container {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.settings-container > h1 {
  font-size: 32px;
  margin-bottom: 32px;
}

.settings-section {
  padding: 24px 0;
  border-bottom: 1px solid var(--border);
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 0;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 500;
  margin-bottom: 4px;
}

.setting-sub {
  font-size: 14px;
  color: var(--muted);
}

.stat-badge {
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
}

.danger-section {
  background: #fff5f5;
  padding: 24px;
  margin: 24px -32px;
  border-bottom: none;
}

.danger-section h2 {
  color: #c33;
}

.pwa-info,
.about-info {
  background: var(--bg);
  padding: 20px;
  border-radius: 12px;
}

.pwa-info ol {
  margin: 12px 0;
  padding-left: 20px;
}

.pwa-info li {
  padding: 4px 0;
  line-height: 1.6;
}

.about-info {
  text-align: center;
}

.list-option {
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.list-option:hover {
  border-color: var(--primary);
  background: #f8f8ff;
}

.list-option.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-bottom: 8px;
}

.modal-sub {
  color: var(--muted);
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-actions button {
  flex: 1;
}

@media (max-width: 600px) {
  .settings-container {
    padding: 20px;
  }

  .settings-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .settings-row button,
  .settings-row label {
    width: 100%;
  }
}
</style>
