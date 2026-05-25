import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { GoalRepository } from '@/repositories/GoalRepository'
import { MicroTaskRepository } from '@/repositories/MicroTaskRepository'
import { ResourceRepository } from '@/repositories/ResourceRepository'
import MicroTaskDetailClient from '@/components/MicroTaskDetailClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string; taskId: string }>
}

export default async function MicroTaskDetailPage({ params }: PageProps) {
  const { id, taskId } = await params
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Initialize Repositories
  const goalRepo = new GoalRepository(supabase)
  const taskRepo = new MicroTaskRepository(supabase)
  const resourceRepo = new ResourceRepository(supabase)

  let goal = null
  let task = null
  let resources: any[] = []

  try {
    // 1. Fetch parent goal
    goal = await goalRepo.getGoalById(id)
    if (!goal || goal.user_id !== user.id) {
      redirect('/objetivos')
    }

    // 2. Fetch all tasks for this goal to locate the specific task
    const tasks = await taskRepo.getMicroTasksByGoalId(id)
    task = tasks.find((t) => t.id === taskId) || null

    if (!task) {
      redirect(`/objetivos/${id}`)
    }

    // 3. Fetch resources: first try task-specific resources, fallback to goal resources
    const { data: taskResources } = await supabase
      .from('recursos')
      .select('*')
      .eq('micro_tarea_id', taskId)

    if (taskResources && taskResources.length > 0) {
      resources = taskResources
    } else {
      resources = await resourceRepo.getResourcesByGoalId(id)
    }
  } catch (err) {
    console.error('Error fetching micro-task page data:', err)
    redirect(`/objetivos/${id}`)
  }

  return (
    <MicroTaskDetailClient
      task={task}
      goal={goal}
      resources={resources}
    />
  )
}
