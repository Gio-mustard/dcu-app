import { SupabaseClient } from '@supabase/supabase-js'

export interface Enfoque {
  id: string
  created_at: string
  user_id: string
  title: string
  category: 'Académico' | 'Salud' | 'Salud Mental' | 'Personal'
  duration: number // en minutos
  icon: string
}

export interface SesionEnfoque {
  id: string
  created_at: string
  user_id: string
  micro_tarea_id: string | null
  enfoque_id: string | null
  duration_minutes: number
  completed: boolean
}

export class FocusSessionRepository {
  constructor(private supabase: SupabaseClient) {}

  async getFreeFocusSessions(userId: string): Promise<Enfoque[]> {
    const { data, error } = await this.supabase
      .from('enfoques')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching free focus templates:', error)
      throw error
    }

    return data || []
  }

  async getSessionsCompletedToday(userId: string): Promise<SesionEnfoque[]> {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    
    const { data, error } = await this.supabase
      .from('sesiones_enfoque')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('created_at', startOfToday.toISOString())

    if (error) {
      console.error('Error fetching today\'s completed sessions:', error)
      throw error
    }

    return data || []
  }

  async createFocusSession(session: Partial<SesionEnfoque> & { user_id: string; duration_minutes: number }): Promise<SesionEnfoque> {
    const { data, error } = await this.supabase
      .from('sesiones_enfoque')
      .insert(session)
      .select()
      .single()

    if (error) {
      console.error('Error creating focus session:', error)
      throw error
    }

    return data
  }

  async createFreeFocusTemplate(focus: Partial<Enfoque> & { user_id: string; title: string; category: Enfoque['category']; duration: number }): Promise<Enfoque> {
    const { data, error } = await this.supabase
      .from('enfoques')
      .insert(focus)
      .select()
      .single()

    if (error) {
      console.error('Error creating free focus template:', error)
      throw error
    }

    return data
  }

  /**
   * Gets ALL completed sessions for a user (for historical analytics).
   */
  async getAllSessions(userId: string): Promise<SesionEnfoque[]> {
    const { data, error } = await this.supabase
      .from('sesiones_enfoque')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching all sessions:', error)
      throw error
    }

    return data || []
  }

  /**
   * Gets sessions for the current week (Mon–today), returning total minutes per day.
   * Returns an array of 7 items: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
   */
  async getSessionsForCurrentWeek(userId: string): Promise<{ day: string; minutes: number }[]> {
    const now = new Date()
    // Find Monday of current week
    const dayOfWeek = now.getDay() // 0=Sun, 1=Mon...
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    const { data, error } = await this.supabase
      .from('sesiones_enfoque')
      .select('created_at, duration_minutes')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('created_at', monday.toISOString())
      .lte('created_at', sunday.toISOString())

    if (error) {
      console.error('Error fetching weekly sessions:', error)
      throw error
    }

    const days = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
    const minutesByDay: number[] = [0, 0, 0, 0, 0, 0, 0]

    for (const session of data || []) {
      const sessionDate = new Date(session.created_at)
      const sessionDay = sessionDate.getDay() // 0=Sun
      // Convert to 0=Mon index
      const mondayIndex = (sessionDay === 0 ? 6 : sessionDay - 1)
      minutesByDay[mondayIndex] += session.duration_minutes
    }

    return days.map((day, i) => ({ day, minutes: minutesByDay[i] }))
  }

  /**
   * Calculates the user's ranking percentile based on focus_hours in the perfiles table.
   * Returns a number between 0–100 representing the top X% (e.g. 5 = Top 5%).
   */
  async getUserRankPercentile(userId: string): Promise<number> {
    // Get all focus_hours from all profiles
    const { data, error } = await this.supabase
      .from('perfiles')
      .select('id, focus_hours')
      .order('focus_hours', { ascending: false })

    if (error || !data || data.length === 0) {
      return 50 // default to top 50% if query fails
    }

    const userIndex = data.findIndex(p => p.id === userId)
    if (userIndex === -1) return 50

    // +1 to convert from 0-based index to rank (1 = best)
    const rank = userIndex + 1
    const percentile = Math.round((rank / data.length) * 100)
    return percentile
  }
}

