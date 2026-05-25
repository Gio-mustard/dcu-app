import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { GoalRepository } from '@/repositories/GoalRepository'
import { ResourceRepository } from '@/repositories/ResourceRepository'
import EnfoqueClient from '@/components/EnfoqueClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    taskId?: string
    enfoqueId?: string
    instantComplete?: string
    quick?: string
  }>
}

export default async function EnfoquePage({ searchParams }: PageProps) {
  const { taskId, enfoqueId, instantComplete, quick } = await searchParams
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let task = null
  let goal = null
  let resources: any[] = []
  let enfoque = null

  try {
    if (taskId) {
      // Fetch specific micro-task
      const { data: taskData, error: taskError } = await supabase
        .from('micro_tareas')
        .select('*')
        .eq('id', taskId)
        .single()

      if (!taskError && taskData) {
        task = taskData
        
        // Fetch parent goal
        const goalRepo = new GoalRepository(supabase)
        goal = await goalRepo.getGoalById(task.objetivo_id)

        // Fetch resources: first try task-specific resources, fallback to goal resources
        const { data: taskResources } = await supabase
          .from('recursos')
          .select('*')
          .eq('micro_tarea_id', taskId)

        if (taskResources && taskResources.length > 0) {
          resources = taskResources
        } else {
          const resourceRepo = new ResourceRepository(supabase)
          resources = await resourceRepo.getResourcesByGoalId(task.objetivo_id)
        }
      }
    } else if (enfoqueId) {
      // Fetch enfoque template
      const { data: enfoqueData, error: enfoqueError } = await supabase
        .from('enfoques')
        .select('*')
        .eq('id', enfoqueId)
        .single()

      if (!enfoqueError && enfoqueData) {
        enfoque = enfoqueData
      }
    }
  } catch (err) {
    console.error('Error fetching enfoque page data:', err)
  }

  return (
    <EnfoqueClient
      task={task}
      goal={goal}
      resources={resources}
      enfoque={enfoque}
      instantComplete={instantComplete === 'true'}
      isQuickFocus={quick === 'true'}
    />
  )
}
