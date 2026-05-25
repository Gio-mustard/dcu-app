import { SupabaseClient } from '@supabase/supabase-js'

export interface Objetivo {
  id: string
  created_at: string
  user_id: string
  title: string
  description: string | null
  category: 'Académico' | 'Salud' | 'Salud Mental' | 'Personal'
  progress: number
  status: 'en_curso' | 'completado' | 'borrador'
  rhythm_days: string[] | null
  target_time: number | null // en minutos
  visibility: 'Privado' | 'Compartido'
  smart_reminders: boolean
  reminder_start: string
  reminder_end: string
}

export class GoalRepository {
  constructor(private supabase: SupabaseClient) {}

  async getGoalsByUserId(userId: string): Promise<Objetivo[]> {
    const { data, error } = await this.supabase
      .from('objetivos')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching goals:', error)
      throw error
    }

    return data || []
  }

  async getActiveGoalsToday(userId: string, dayOfWeekSpanish: string): Promise<Objetivo[]> {
    const goals = await this.getGoalsByUserId(userId)
    
    return goals.filter(goal => {
      if (goal.status !== 'en_curso') return false
      if (!goal.rhythm_days || goal.rhythm_days.length === 0) return true
      
      const normalizedDays = goal.rhythm_days.map(d => d.toLowerCase())
      const todayLower = dayOfWeekSpanish.toLowerCase()
      
      return (
        normalizedDays.includes(todayLower) ||
        normalizedDays.includes('todos') ||
        normalizedDays.includes('diario') ||
        normalizedDays.includes('daily')
      )
    })
  }

  async getGoalById(id: string): Promise<Objetivo | null> {
    const { data, error } = await this.supabase
      .from('objetivos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching goal by id:', error)
      return null
    }

    return data
  }

  async createGoal(goal: Partial<Objetivo> & { user_id: string; title: string; category: Objetivo['category'] }): Promise<Objetivo> {
    const { data, error } = await this.supabase
      .from('objetivos')
      .insert(goal)
      .select()
      .single()

    if (error) {
      console.error('Error creating goal:', error)
      throw error
    }

    return data
  }

  async updateGoalProgress(id: string, progress: number): Promise<void> {
    const { error } = await this.supabase
      .from('objetivos')
      .update({ progress })
      .eq('id', id)

    if (error) {
      console.error('Error updating goal progress:', error)
      throw error
    }
  }
}
