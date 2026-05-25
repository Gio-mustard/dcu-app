import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoalRepository } from '@/repositories/GoalRepository'
import { FocusSessionRepository } from '@/repositories/FocusSessionRepository'
import { ResourceRepository } from '@/repositories/ResourceRepository'
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
    const {
      type, // 'objetivo' | 'enfoque'
      title,
      category, // 'Académico' | 'Salud' | 'Salud Mental' | 'Personal'
      rhythm_days, // array of strings (e.g. ['Lunes', 'Martes'])
      target_time, // number of minutes
      visibility, // 'Privado' | 'Compartido'
      smart_reminders, // boolean
      reminder_start,
      reminder_end,
      status, // 'en_curso' | 'borrador'
    } = body

    if (!title || !category) {
      return NextResponse.json({ error: 'Título y categoría son requeridos' }, { status: 400 })
    }

    // --- CASE 1: CREATE GOAL (OBJETIVO) ---
    if (type === 'objetivo') {
      const goalRepo = new GoalRepository(supabase)
      const resourceRepo = new ResourceRepository(supabase)

      // Generate AI bundle (insignia + tasks + guides + resources)
      let bundle = {
        insignia_title: `Aprendiz de ${title}`,
        insignia_description: `¡Felicidades! Has completado todas las micro-tareas y completado el objetivo: "${title}".`,
        tasks: [] as any[]
      }

      try {
        bundle = await GroqService.generateMicroTasks(title, category, undefined, target_time)
      } catch (err) {
        console.error('Failed to generate AI bundle:', err)
      }

      // Create the goal with the generated insignia details
      const goal = await goalRepo.createGoal({
        user_id: user.id,
        title,
        category,
        rhythm_days,
        target_time,
        visibility: visibility || 'Privado',
        smart_reminders: smart_reminders !== undefined ? smart_reminders : true,
        reminder_start: reminder_start || '09:00 AM',
        reminder_end: reminder_end || '08:00 PM',
        status: status || 'en_curso',
        description: `Objetivo ${category.toLowerCase()} para mejorar en: ${title}.`,
        insignia_title: bundle.insignia_title,
        insignia_description: bundle.insignia_description
      } as any) // cast to any to support new columns in DB

      // Save each micro-task and its specific resources
      if (bundle.tasks && bundle.tasks.length > 0) {
        try {
          for (const taskItem of bundle.tasks) {
            const { data: insertedTask, error: taskError } = await supabase
              .from('micro_tareas')
              .insert({
                objetivo_id: goal.id,
                title: taskItem.title,
                complexity: taskItem.complexity,
                estimated_time: taskItem.estimated_time,
                scheduled_time: taskItem.scheduled_time,
                status: 'pendiente',
                badge_title: taskItem.badge_title || null,
                badge_description: taskItem.badge_description || null,
                guide_steps: taskItem.guide_steps || []
              })
              .select('id')
              .single()

            if (!taskError && insertedTask && taskItem.resources && taskItem.resources.length > 0) {
              for (const res of taskItem.resources) {
                await resourceRepo.createResource({
                  objetivo_id: goal.id,
                  micro_tarea_id: insertedTask.id,
                  title: res.title,
                  type: res.type,
                  url: res.url,
                  is_generated: true
                } as any)
              }
            }
          }
        } catch (taskErr) {
          console.error('Error saving tasks/resources:', taskErr)
        }
      }

      return NextResponse.json({ success: true, id: goal.id })
    }

    // --- CASE 2: CREATE FOCUS TEMPLATE (ENFOQUE) ---
    if (type === 'enfoque') {
      const focusSessionRepo = new FocusSessionRepository(supabase)

      const enfoque = await focusSessionRepo.createFreeFocusTemplate({
        user_id: user.id,
        title,
        category,
        duration: target_time || 25, // default to 25 mins
        icon: category === 'Salud Mental' ? 'meditation' : category === 'Salud' ? 'run' : 'book',
      })

      return NextResponse.json({ success: true, id: enfoque.id })
    }

    return NextResponse.json({ error: 'Tipo de actividad inválido' }, { status: 400 })
  } catch (err: any) {
    console.error('Error in API /api/objetivos/crear:', err)
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 })
  }
}
