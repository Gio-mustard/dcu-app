import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PublicPerfilClient from '@/components/PublicPerfilClient'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{
    id: string
  }>
}

export default async function PublicPerfilPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If looking at ourselves, redirect to own profile route
  if (id === user.id) {
    redirect('/perfil')
  }

  // Fetch target user profile
  const { data: profile } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  // Fetch target user's shared goals
  const { data: publicGoals } = await supabase
    .from('objetivos')
    .select('*')
    .eq('user_id', id)
    .eq('visibility', 'Compartido')

  // Fetch target user's badges
  const { data: badges } = await supabase
    .from('insignias_usuario')
    .select('*')
    .eq('user_id', id)

  // Fetch target user's logros
  const { data: logros } = await supabase
    .from('logros')
    .select('*')
    .eq('user_id', id)

  // Fetch current user's goals to identify matching goals/interests
  const { data: myGoals } = await supabase
    .from('objetivos')
    .select('*')
    .eq('user_id', user.id)

  return (
    <PublicPerfilClient
      profile={profile}
      goals={publicGoals || []}
      badges={badges || []}
      logros={logros || []}
      myGoals={myGoals || []}
    />
  )
}
