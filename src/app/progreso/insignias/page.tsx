import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InsigniasClient from '@/components/InsigniasClient'

export const dynamic = 'force-dynamic'

export default async function InsigniasPage() {
  const supabase = await createClient()

  // Verify auth session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch parallel profile, achievements (logros), and badges (insignias) from DB
  const [perfil, dbLogros, dbInsignias] = await Promise.all([
    supabase.from('perfiles').select('*').eq('id', user.id).single().then(r => r.data),
    supabase.from('logros').select('*').eq('user_id', user.id).then(r => r.data || []),
    supabase.from('insignias_usuario').select('*').eq('user_id', user.id).then(r => r.data || []),
  ])

  const userName = perfil?.full_name || user.email?.split('@')[0] || 'Usuario'
  const avatarUrl = perfil?.avatar_url || null

  const earnedInsignias = dbInsignias.map((ins: any) => ({
    id: ins.id,
    title: ins.title,
    description: ins.description || '',
    createdAt: ins.created_at || null,
  }))

  const earnedLogros = dbLogros.map((log: any) => ({
    id: log.id,
    title: log.title,
    description: log.description || '',
    category: log.category || 'Personal',
    createdAt: log.created_at || null,
  }))

  return (
    <InsigniasClient
      userName={userName}
      avatarUrl={avatarUrl}
      earnedInsignias={earnedInsignias}
      earnedLogros={earnedLogros}
    />
  )
}
