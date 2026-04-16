// Tag keywords for content-based category matching
const CAT_TAGS: Record<string, string[]> = {
  'Rind & Kalb': ['rind', 'kalb', 'wagyu', 'beef', 'brisket', 'steak', 'tatar', 'carpaccio', 'pastrami'],
  'Geflügel': ['hähnchen', 'geflügel', 'chicken', 'pute', 'gans', 'rotisserie', 'pollo'],
  'Schwein': ['schwein', 'bacon', 'spareribs', 'pulled pork', 'haxe', 'chorizo', 'salsiccia', 'schaschlik', 'schweinebauch', 'krustenbraten', 'schnitzel', 'pork'],
  'Fisch & Seafood': ['fisch', 'lachs', 'seafood', 'thunfisch', 'meeresfrüchte', 'garnelen', 'oktopus', 'tuna', 'ceviche', 'tataki', 'dorade', 'pulpo', 'rabas'],
  'Wild & Lamm': ['lamm', 'wild', 'hirsch', 'reh'],
  'Gemüse': ['gemüse', 'vegetarisch', 'vegan', 'sellerie'],
  'Burger': ['burger'],
  'Pizza & Pasta': ['pizza', 'pasta', 'nudel', 'spaghetti', 'bolognese', 'carbonara', 'pide', 'salsiccia bolo'],
  'Vorspeisen & Beilagen': ['vorspeise', 'beilage', 'slider', 'satay', 'spieß', 'gyros', 'pita'],
  'Dips, Saucen & Rubs': ['dip', 'sauce', 'rub', 'tzatziki', 'acili ezme', 'bigbutter', 'pfefferrahm', 'bratenjus', 'schmalz', 'magic dust', 'kräuterbutter'],
  'Brot & Buns': ['brot', 'baguette', 'buns', 'brötchen', 'focaccia', 'fladenbrot', 'kornspitz', 'pita'],
  'Süßkram': ['dessert', 'brownie', 'eis', 'kuchen', 'cake', 'schokolad', 'candy', 'ananas', 'backen'],
  'Asien Spezial': ['asiatisch', 'asia', 'wok', 'thai', 'vietnamesisch', 'hoisin', 'sommerrollen', 'surf & turf'],
  'Beefer': ['beefer'],
  'Dutchoven': ['dutchoven'],
  'Spanische Tapas': ['tapas', 'gambas', 'patatas bravas', 'pimientos'],
  'Tacos & Co': ['taco', 'mexikanisch', 'quesadilla'],
}

export const useCategories = () => {
  const CATS = [
    'Alle',
    'Rind & Kalb',
    'Geflügel',
    'Schwein',
    'Fisch & Seafood',
    'Wild & Lamm',
    'Gemüse',
    'Burger',
    'Pizza & Pasta',
    'Vorspeisen & Beilagen',
    'Dips, Saucen & Rubs',
    'Brot & Buns',
    'Süßkram',
    'Asien Spezial',
    'Beefer',
    'Dutchoven',
    'Spanische Tapas',
    'Tacos & Co',
    'Frühstück',
    'Mittagessen',
    'Abendessen',
    'Snack',
    'Dessert',
    'Backen',
    'Getränk'
  ]

  const CAT_EMOJI: Record<string, string> = {
    'Alle': '📖',
    'Rind & Kalb': '🥩',
    'Geflügel': '🍗',
    'Schwein': '🐷',
    'Fisch & Seafood': '🐟',
    'Wild & Lamm': '🦌',
    'Gemüse': '🥦',
    'Burger': '🍔',
    'Pizza & Pasta': '🍕',
    'Vorspeisen & Beilagen': '🥗',
    'Dips, Saucen & Rubs': '🧄',
    'Brot & Buns': '🥖',
    'Süßkram': '🍫',
    'Asien Spezial': '🥢',
    'Beefer': '🔥',
    'Dutchoven': '🍲',
    'Spanische Tapas': '🥘',
    'Tacos & Co': '🌮',
    'Frühstück': '🌅',
    'Mittagessen': '☀️',
    'Abendessen': '🌙',
    'Snack': '🍎',
    'Dessert': '🍰',
    'Backen': '🥐',
    'Getränk': '🥤'
  }

  const CAT_TAGS: Record<string, string[]> = {
    'Rind & Kalb': ['rind', 'kalb', 'wagyu', 'beef', 'brisket', 'steak', 'tatar', 'carpaccio', 'pastrami'],
    'Geflügel': ['hähnchen', 'geflügel', 'chicken', 'pute', 'gans', 'rotisserie', 'pollo'],
    'Schwein': ['schwein', 'bacon', 'spareribs', 'pulled pork', 'haxe', 'chorizo', 'salsiccia', 'schaschlik', 'schweinebauch', 'krustenbraten', 'schnitzel', 'pork'],
    'Fisch & Seafood': ['fisch', 'lachs', 'seafood', 'thunfisch', 'meeresfrüchte', 'garnelen', 'oktopus', 'tuna', 'ceviche', 'tataki', 'dorade', 'pulpo', 'rabas'],
    'Wild & Lamm': ['lamm', 'wild', 'hirsch', 'reh'],
    'Gemüse': ['gemüse', 'vegetarisch', 'vegan', 'sellerie'],
    'Burger': ['burger'],
    'Pizza & Pasta': ['pizza', 'pasta', 'nudel', 'spaghetti', 'bolognese', 'carbonara', 'pide', 'salsiccia bolo'],
    'Vorspeisen & Beilagen': ['vorspeise', 'beilage', 'slider', 'satay', 'spieß', 'gyros', 'pita'],
    'Dips, Saucen & Rubs': ['dip', 'sauce', 'rub', 'tzatziki', 'acili ezme', 'bigbutter', 'pfefferrahm', 'bratenjus', 'schmalz', 'magic dust', 'kräuterbutter'],
    'Brot & Buns': ['brot', 'baguette', 'buns', 'brötchen', 'focaccia', 'fladenbrot', 'kornspitz', 'pita'],
    'Süßkram': ['dessert', 'brownie', 'eis', 'kuchen', 'cake', 'schokolad', 'candy', 'ananas', 'backen'],
    'Asien Spezial': ['asiatisch', 'asia', 'wok', 'thai', 'vietnamesisch', 'hoisin', 'sommerrollen', 'surf & turf'],
    'Beefer': ['beefer'],
    'Dutchoven': ['dutchoven'],
    'Spanische Tapas': ['tapas', 'gambas', 'patatas bravas', 'pimientos'],
    'Tacos & Co': ['taco', 'mexikanisch', 'quesadilla'],
  }

  const activeCategory = useState<string>('activeCategory', () => 'Alle')

  const setCategory = (cat: string) => {
    activeCategory.value = cat
  }

  const categorizeRecipe = (recipe: any): string => {
    const text = `${recipe.title || ''} ${(recipe.ingredients || []).join(' ')} ${(recipe.tags || []).join(' ')}`.toLowerCase()
    
    for (const [cat, keywords] of Object.entries(CAT_TAGS)) {
      if (keywords.some(kw => text.includes(kw))) {
        return cat
      }
    }
    
    return 'Abendessen'
  }

  return {
    categories: CATS,
    emoji: CAT_EMOJI,
    tags: CAT_TAGS,
    activeCategory: readonly(activeCategory),
    setCategory,
    categorizeRecipe,
  }
}
