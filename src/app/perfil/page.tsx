import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilClient from '@/components/PerfilClient'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial profile data on the server
  const { data: profile } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch insignias
  const { data: badges } = await supabase
    .from('insignias_usuario')
    .select('*')
    .eq('user_id', user.id)

  // Fetch public goals
  const { data: publicGoals } = await supabase
    .from('objetivos')
    .select('*')
    .eq('user_id', user.id)
    .eq('visibility', 'Compartido')

  return (
    <PerfilClient
      email={user.email || ''}
      initialProfile={profile}
      initialBadges={badges || []}
      initialGoals={publicGoals || []}
    />
  )
}
