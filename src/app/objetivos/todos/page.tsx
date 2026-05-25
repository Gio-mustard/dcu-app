import { createClient } from '@/lib/supabase/server'
import { GoalRepository } from '@/repositories/GoalRepository'
import { redirect } from 'next/navigation'
import TodosObjetivosClient from '@/components/TodosObjetivosClient'

export const dynamic = 'force-dynamic'

export default async function TodosObjetivosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const goalRepo = new GoalRepository(supabase)

  let allGoals: any[] = []
  let avatarUrl: string | null = null

  try {
    allGoals = await goalRepo.getGoalsByUserId(user.id)
  } catch (err) {
    console.error('Error fetching all goals:', err)
  }

  try {
    const { data: profile } = await supabase
      .from('perfiles')
      .select('avatar_url, full_name')
      .eq('id', user.id)
      .maybeSingle()
    avatarUrl = profile?.avatar_url || null
  } catch (e) {
    console.error('Error fetching profile:', e)
  }

  const userName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'

  return (
    <TodosObjetivosClient
      userName={userName}
      avatarUrl={avatarUrl}
      allGoals={allGoals}
    />
  )
}
