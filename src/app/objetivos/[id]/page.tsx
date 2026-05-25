import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { GoalRepository } from '@/repositories/GoalRepository'
import { MicroTaskRepository } from '@/repositories/MicroTaskRepository'
import { ResourceRepository } from '@/repositories/ResourceRepository'
import { FocusSessionRepository } from '@/repositories/FocusSessionRepository'
import GoalDetailClient from '@/components/GoalDetailClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GoalDetailPage({ params }: PageProps) {
  const { id } = await params
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
  const sessionRepo = new FocusSessionRepository(supabase)

  let goal = null
  let tasks: any[] = []
  let resources: any[] = []
  let todaySessions: any[] = []

  try {
    // 1. Fetch goal details
    goal = await goalRepo.getGoalById(id)

    if (!goal || goal.user_id !== user.id) {
      redirect('/objetivos')
    }

    // 2. Fetch tasks for this goal
    tasks = await taskRepo.getMicroTasksByGoalId(id)

    // 3. Fetch resources for this goal
    resources = await resourceRepo.getResourcesByGoalId(id)

    // 4. Fetch today's completed sessions
    todaySessions = await sessionRepo.getSessionsCompletedToday(user.id)
  } catch (err) {
    console.error('Error fetching goal detail page data:', err)
    redirect('/objetivos')
  }

  return (
    <GoalDetailClient
      goal={goal}
      tasks={tasks}
      resources={resources}
      todaySessions={todaySessions}
    />
  )
}
