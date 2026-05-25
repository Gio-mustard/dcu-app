import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ResourceRepository } from '@/repositories/ResourceRepository'
import { GoalRepository } from '@/repositories/GoalRepository'
import { GroqService } from '@/lib/ai/GroqService'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { objetivo_id, title, url, generate_ai } = body

    if (!objetivo_id) {
      return NextResponse.json({ error: 'El ID del objetivo es requerido' }, { status: 400 })
    }

    const resourceRepo = new ResourceRepository(supabase)

    // AI SUGGESTION CASE
    if (generate_ai) {
      const goalRepo = new GoalRepository(supabase)
      const goal = await goalRepo.getGoalById(objetivo_id)

      if (!goal) {
        return NextResponse.json({ error: 'Objetivo no encontrado' }, { status: 404 })
      }

      // Call Groq API to generate resources
      const aiResources = await GroqService.generateRecommendedResources(goal.title, goal.category)
      
      if (aiResources.length === 0) {
        return NextResponse.json({ error: 'No se pudieron generar sugerencias de recursos.' }, { status: 500 })
      }

      // Save the first recommended resource
      const recommended = aiResources[0]
      const newResource = await resourceRepo.createResource({
        objetivo_id,
        title: recommended.title,
        type: 'link', // User constraint: puros links de internet por ahora
        url: recommended.url,
        is_generated: true,
      })

      return NextResponse.json({ success: true, resource: newResource })
    }

    // MANUAL CREATION CASE
    if (!title || !url) {
      return NextResponse.json({ error: 'El título y la URL son requeridos' }, { status: 400 })
    }

    // Validate URL format simply
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json({ error: 'La URL debe comenzar con http:// o https://' }, { status: 400 })
    }

    const newResource = await resourceRepo.createResource({
      objetivo_id,
      title,
      type: 'link',
      url,
      is_generated: false,
    })

    return NextResponse.json({ success: true, resource: newResource })
  } catch (err: any) {
    console.error('Error in API /api/recursos:', err)
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 })
  }
}
