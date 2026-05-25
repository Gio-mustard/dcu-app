import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''

    if (!query.trim()) {
      return NextResponse.json({ users: [] })
    }

    const searchTerm = `%${query.trim()}%`

    // Fetch all public perfiles to perform name and interest category search in memory
    const { data: allProfiles, error: errAllProfiles } = await supabase
      .from('perfiles')
      .select('id, full_name, social_categories')
      .eq('social_open', true)

    if (errAllProfiles) console.error('Error fetching all profiles:', errAllProfiles)

    const queryLower = query.trim().toLowerCase()
    const matchedProfileIds = new Set<string>()

    // Match profiles by name or social categories (interests)
    allProfiles?.forEach((p) => {
      const nameMatch = p.full_name?.toLowerCase().includes(queryLower)
      const categoryMatch = (p.social_categories || []).some((cat: string) =>
        cat.toLowerCase().includes(queryLower)
      )
      if (nameMatch || categoryMatch) {
        matchedProfileIds.add(p.id)
      }
    })

    // 2. Search profiles by shared goal title or category
    const { data: goalsMatch, error: errGoals } = await supabase
      .from('objetivos')
      .select('user_id')
      .eq('visibility', 'Compartido')
      .or(`title.ilike.${searchTerm},category.ilike.${searchTerm}`)

    if (errGoals) console.error('Error searching goals by title/category:', errGoals)

    // 3. Search profiles by badge title
    const { data: badgesMatch, error: errBadges } = await supabase
      .from('insignias_usuario')
      .select('user_id')
      .ilike('title', searchTerm)

    if (errBadges) console.error('Error searching badges by title:', errBadges)

    // 4. Search profiles by logro title
    const { data: logrosMatch, error: errLogros } = await supabase
      .from('logros')
      .select('user_id')
      .ilike('title', searchTerm)

    if (errLogros) console.error('Error searching achievements by title:', errLogros)

    // Collect unique matched user_ids
    const matchedUserIds = new Set<string>(matchedProfileIds)
    goalsMatch?.forEach((g) => matchedUserIds.add(g.user_id))
    badgesMatch?.forEach((b) => matchedUserIds.add(b.user_id))
    logrosMatch?.forEach((l) => matchedUserIds.add(l.user_id))

    // Exclude current user from search results
    matchedUserIds.delete(user.id)

    if (matchedUserIds.size === 0) {
      return NextResponse.json({ users: [] })
    }

    // Fetch the matched user profiles details
    const { data: matchedProfiles, error: errProfiles } = await supabase
      .from('perfiles')
      .select('*')
      .in('id', Array.from(matchedUserIds))
      .eq('social_open', true)

    if (errProfiles) throw errProfiles

    // Fetch current user's own goals to calculate common objectives
    const { data: myGoals } = await supabase
      .from('objetivos')
      .select('title, category')
      .eq('user_id', user.id)

    const myGoalCategories = new Set(myGoals?.map((g) => g.category) || [])
    const myGoalTitles = myGoals?.map((g) => g.title.toLowerCase()) || []

    // For each profile, fetch their public goals, badges and achievements, then compute commonalities
    const profilesWithData = await Promise.all(
      (matchedProfiles || []).map(async (profile) => {
        // Public goals
        const { data: publicGoals } = await supabase
          .from('objetivos')
          .select('*')
          .eq('user_id', profile.id)
          .eq('visibility', 'Compartido')

        // Badges (Insignias)
        const { data: badges } = await supabase
          .from('insignias_usuario')
          .select('*')
          .eq('user_id', profile.id)

        // Logros (Trofeos)
        const { data: achievements } = await supabase
          .from('logros')
          .select('*')
          .eq('user_id', profile.id)

        // Calculate common categories and goals
        const commonCategories: string[] = []
        const commonGoals: Array<{ title: string; category: string }> = []

        publicGoals?.forEach((g) => {
          if (myGoalCategories.has(g.category) && !commonCategories.includes(g.category)) {
            commonCategories.push(g.category)
          }

          const titleLower = g.title.toLowerCase()
          const isCommonTitle = myGoalTitles.some((myTitle) => {
            // Find if there is a common keyword of 4+ characters (e.g. "react", "cálculo")
            const words = myTitle.split(/\s+/).filter((w: string) => w.length > 3)
            return words.some((w: string) => titleLower.includes(w))
          })

          if (isCommonTitle) {
            commonGoals.push({ title: g.title, category: g.category })
          }
        })

        return {
          ...profile,
          goals: publicGoals || [],
          badges: badges || [],
          logros: achievements || [],
          commonCategories,
          commonGoals,
        }
      })
    )

    return NextResponse.json({ users: profilesWithData })
  } catch (err: any) {
    console.error('Error searching social users:', err)
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 })
  }
}
