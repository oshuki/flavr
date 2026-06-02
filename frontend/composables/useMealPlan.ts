import type { MealPlan, MealPlanDay } from '~/types'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
type Day = typeof DAYS[number]
type Slot = keyof MealPlanDay

const getMonday = (date: Date): string => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

export const useMealPlan = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const weekStart = useState<string>('mealplan-week', () => getMonday(new Date()))
  const plan = useState<MealPlan>('mealplan-data', () => ({ weekStart: weekStart.value, meals: {} }))
  const loading = useState<boolean>('mealplan-loading', () => false)

  const loadPlan = async (week: string) => {
    if (!user.value) return
    loading.value = true
    try {
      const { data } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('week_start', week)
        .maybeSingle()

      plan.value = {
        id: data?.id,
        weekStart: week,
        meals: (data?.meals as Record<string, MealPlanDay>) || {},
      }
    } finally {
      loading.value = false
    }
  }

  const saveMeal = async (day: Day, slot: Slot, recipeId: string | null) => {
    if (!user.value) return
    const userId = (user.value as any).id || (user.value as any).sub

    const updatedMeals: Record<string, MealPlanDay> = {
      ...plan.value.meals,
      [day]: {
        ...plan.value.meals[day],
        [slot]: recipeId ?? undefined,
      },
    }

    if (recipeId === null) {
      delete updatedMeals[day][slot]
      if (!updatedMeals[day].breakfast && !updatedMeals[day].dinner) {
        delete updatedMeals[day]
      }
    }

    plan.value = { ...plan.value, meals: updatedMeals }

    await supabase.from('meal_plans').upsert({
      ...(plan.value.id ? { id: plan.value.id } : {}),
      user_id: userId,
      week_start: weekStart.value,
      meals: updatedMeals,
      updated_at: new Date().toISOString(),
    })
  }

  const prevWeek = async () => {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() - 7)
    weekStart.value = d.toISOString().slice(0, 10)
    await loadPlan(weekStart.value)
  }

  const nextWeek = async () => {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + 7)
    weekStart.value = d.toISOString().slice(0, 10)
    await loadPlan(weekStart.value)
  }

  const getKW = (isoDate: string): number => {
    const d = new Date(isoDate)
    const jan4 = new Date(d.getFullYear(), 0, 4)
    const startOfWeek1 = new Date(jan4)
    startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
    return Math.floor((d.getTime() - startOfWeek1.getTime()) / 604800000) + 1
  }

  return {
    weekStart: readonly(weekStart),
    plan: readonly(plan),
    loading: readonly(loading),
    DAYS,
    loadPlan,
    saveMeal,
    prevWeek,
    nextWeek,
    getKW,
  }
}
