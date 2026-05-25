import { SupabaseClient } from '@supabase/supabase-js'

export interface MicroTask {
  id: string
  objetivo_id: string
  title: string
  complexity: 'Baja' | 'Media' | 'Alta'
  estimated_time: number // en minutos
  scheduled_time: string | null // Ej: '16:00'
  status: 'pendiente' | 'en_enfoque' | 'completada'
  badge_title: string | null
  badge_description: string | null
  guide_steps: string[]
  video_url: string | null
  notes: string | null
  notes_updated_at: string | null
}

export class MicroTaskRepository {
  constructor(private supabase: SupabaseClient) {}

  async getMicroTasksByGoalId(goalId: string): Promise<MicroTask[]> {
    const { data, error } = await this.supabase
      .from('micro_tareas')
      .select('*')
      .eq('objetivo_id', goalId)

    if (error) {
      console.error('Error fetching micro tasks:', error)
      throw error
    }

    return data || []
  }

  async getMicroTasksByGoalIds(goalIds: string[]): Promise<MicroTask[]> {
    if (goalIds.length === 0) return []

    const { data, error } = await this.supabase
      .from('micro_tareas')
      .select('*')
      .in('objetivo_id', goalIds)

    if (error) {
      console.error('Error fetching micro tasks by goal ids:', error)
      throw error
    }

    return data || []
  }

  async updateStatus(id: string, status: MicroTask['status']): Promise<MicroTask> {
    const { data, error } = await this.supabase
      .from('micro_tareas')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating micro task status:', error)
      throw error
    }

    return data
  }
}
