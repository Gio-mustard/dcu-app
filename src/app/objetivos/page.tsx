import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { GoalRepository } from '@/repositories/GoalRepository'
import { MicroTaskRepository } from '@/repositories/MicroTaskRepository'
import { FocusSessionRepository } from '@/repositories/FocusSessionRepository'
import ObjetivosClient from '@/components/ObjetivosClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ObjetivosPage() {
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
  const sessionRepo = new FocusSessionRepository(supabase)

  let dbGoals: any[] = []
  let dbEnfoques: any[] = []
  let dbTasks: any[] = []

  try {
    // 1. Fetch user's goals
    dbGoals = await goalRepo.getGoalsByUserId(user.id)

    // 2. Fetch free focus templates
    dbEnfoques = await sessionRepo.getFreeFocusSessions(user.id)

    // 3. Fetch all tasks for the user's goals
    const goalIds = dbGoals.map((g) => g.id)
    if (goalIds.length > 0) {
      dbTasks = await taskRepo.getMicroTasksByGoalIds(goalIds)
    }
  } catch (err) {
    console.error('Error fetching objectives page data:', err)
  }

  let avatarUrl: string | null = null
  try {
    const { data: profile } = await supabase
      .from('perfiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle()
    avatarUrl = profile?.avatar_url || null
  } catch (e) {
    console.error('Error fetching avatar_url:', e)
  }

  const email = user.email || ''
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'

  return (
    <ObjetivosClient
      email={email}
      userName={userName}
      dbGoals={dbGoals}
      dbEnfoques={dbEnfoques}
      dbTasks={dbTasks}
      avatarUrl={avatarUrl}
    />
  )
}
