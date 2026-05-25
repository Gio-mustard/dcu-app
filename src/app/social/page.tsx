import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SocialClient from '@/components/SocialClient'

export const dynamic = 'force-dynamic'

export default async function SocialPage() {
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial profile data to render top left avatar
  const { data: profile } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <SocialClient 
      userProfile={profile}
    />
  )
}
