import { SupabaseClient } from '@supabase/supabase-js'

export interface Recurso {
  id: string
  objetivo_id: string
  micro_tarea_id?: string | null
  title: string
  type: 'pdf' | 'video' | 'link'
  url: string | null
  is_generated: boolean
}

export class ResourceRepository {
  constructor(private supabase: SupabaseClient) {}

  async getResourcesByGoalId(goalId: string): Promise<Recurso[]> {
    const { data, error } = await this.supabase
      .from('recursos')
      .select('*')
      .eq('objetivo_id', goalId)

    if (error) {
      console.error('Error fetching resources:', error)
      throw error
    }

    return data || []
  }

  async createResource(resource: Partial<Recurso> & { objetivo_id: string; title: string; type: Recurso['type'] }): Promise<Recurso> {
    const { data, error } = await this.supabase
      .from('recursos')
      .insert(resource)
      .select()
      .single()

    if (error) {
      console.error('Error creating resource:', error)
      throw error
    }

    return data
  }

  async getResourcesByTaskId(taskId: string): Promise<Recurso[]> {
    const { data, error } = await this.supabase
      .from('recursos')
      .select('*')
      .eq('micro_tarea_id', taskId)

    if (error) {
      console.error('Error fetching resources for task:', error)
      throw error
    }

    return data || []
  }
}
