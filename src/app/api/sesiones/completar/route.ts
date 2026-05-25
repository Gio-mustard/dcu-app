import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FocusSessionRepository } from '@/repositories/FocusSessionRepository'
import { MicroTaskRepository } from '@/repositories/MicroTaskRepository'
import { GoalRepository } from '@/repositories/GoalRepository'

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
      micro_tarea_id, // optional
      enfoque_id, // optional
      duration_minutes,
      task_completed = true,
    } = body

    if (!duration_minutes) {
      return NextResponse.json({ error: 'La duración es requerida' }, { status: 400 })
    }

    const sessionRepo = new FocusSessionRepository(supabase)
    const taskRepo = new MicroTaskRepository(supabase)
    const goalRepo = new GoalRepository(supabase)

    // 1. Log the completed session
    const session = await sessionRepo.createFocusSession({
      user_id: user.id,
      micro_tarea_id: micro_tarea_id || null,
      enfoque_id: enfoque_id || null,
      duration_minutes,
      completed: true,
    })

    let logroAwarded = null
    let insigniaAwarded = null

    // 2. If it was a microtask, complete it and check achievements
    if (micro_tarea_id) {
      if (task_completed) {
        // Fetch the task first to get its details
        const { data: task, error: taskError } = await supabase
          .from('micro_tareas')
          .select('title, badge_title, badge_description, objetivo_id')
          .eq('id', micro_tarea_id)
          .single()

        if (!taskError && task) {
          // Set task status to completed
          await taskRepo.updateStatus(micro_tarea_id, 'completada')

          // Award Logro (Trophy) if there is a badge_title
          if (task.badge_title) {
            try {
              const { data: existingLogro } = await supabase
                .from('logros')
                .select('*')
                .eq('user_id', user.id)
                .eq('micro_tarea_id', micro_tarea_id)
                .maybeSingle()

              if (!existingLogro) {
                const { data: goalDetails } = await supabase
                  .from('objetivos')
                  .select('category')
                  .eq('id', task.objetivo_id)
                  .single()

                const category = goalDetails?.category || 'Personal'

                const { data: newLogro, error: insertError } = await supabase
                  .from('logros')
                  .insert({
                    user_id: user.id,
                    micro_tarea_id,
                    title: task.badge_title,
                    description: task.badge_description,
                    category,
                  })
                  .select()
                  .single()

                if (!insertError && newLogro) {
                  logroAwarded = newLogro
                }
              }
            } catch (e) {
              console.error('Error awarding logro (is SQL script executed?):', e)
            }
          }

          const goalId = task.objetivo_id

          // Fetch all tasks for this goal
          const { data: allTasks, error: allTasksError } = await supabase
            .from('micro_tareas')
            .select('status')
            .eq('objetivo_id', goalId)

          if (!allTasksError && allTasks && allTasks.length > 0) {
            const completedCount = allTasks.filter((t) => t.status === 'completada').length
            const totalCount = allTasks.length
            const newProgress = Math.round((completedCount / totalCount) * 100)

            // Update parent goal progress
            await goalRepo.updateGoalProgress(goalId, newProgress)

            // Check if ALL tasks are completed -> Goal completed!
            const allCompleted = allTasks.every((t) => t.status === 'completada')
            if (allCompleted) {
              // Update parent goal status to completed
              await supabase
                .from('objetivos')
                .update({ status: 'completado', progress: 100 })
                .eq('id', goalId)

              // Award Insignia (Badge)
              try {
                const { data: goalInfo } = await supabase
                  .from('objetivos')
                  .select('title, insignia_title, insignia_description')
                  .eq('id', goalId)
                  .single()

                const goalTitle = goalInfo?.title || 'Objetivo'
                const finalInsigniaTitle = goalInfo?.insignia_title || `Aprendiz de ${goalTitle}`
                const finalInsigniaDescription = goalInfo?.insignia_description || `¡Felicidades! Has completado con éxito todas las micro-tareas y completado el objetivo: "${goalTitle}".`

                const { data: existingInsignia } = await supabase
                  .from('insignias_usuario')
                  .select('*')
                  .eq('user_id', user.id)
                  .eq('objetivo_id', goalId)
                  .maybeSingle()

                if (!existingInsignia) {
                  const { data: newInsignia, error: insigniaError } = await supabase
                    .from('insignias_usuario')
                    .insert({
                      user_id: user.id,
                      objetivo_id: goalId,
                      title: finalInsigniaTitle,
                      description: finalInsigniaDescription
                    })
                    .select()
                    .single()

                  if (!insigniaError && newInsignia) {
                    insigniaAwarded = newInsignia
                  }
                }
              } catch (e) {
                console.error('Error awarding insignia (is SQL script executed?):', e)
              }
            }
          }
        }
      } else {
        // Revert task status to pendiente
        await taskRepo.updateStatus(micro_tarea_id, 'pendiente')
      }
    }

    // --- EXPERIENCE (XP) AND LEVEL SYSTEM ---
    let xpEarned = 0
    let newXp = 0
    let newLevel = 1
    let leveledUp = false

    try {
      const { data: profile } = await supabase
        .from('perfiles')
        .select('level, xp')
        .eq('id', user.id)
        .single()

      let currentXp = profile?.xp ?? 0
      let currentLevel = profile?.level ?? 1

      // 1. Calculate XP Earned
      // Completion of a focus session: +25 XP
      xpEarned += 25
      
      // Completion of a whole Goal: +150 XP
      if (insigniaAwarded) {
        xpEarned += 150
      }

      currentXp += xpEarned

      // 2. Check for Level Up
      // Level 1 needs 100 XP to level up, Level 2 needs 200 XP, Level 3 needs 300 XP, etc.
      let xpNeeded = currentLevel * 100
      while (currentXp >= xpNeeded) {
        currentXp -= xpNeeded
        currentLevel += 1
        xpNeeded = currentLevel * 100
        leveledUp = true
      }

      newXp = currentXp
      newLevel = currentLevel

      // 3. Update Profile
      await supabase
        .from('perfiles')
        .update({
          xp: newXp,
          level: newLevel
        })
        .eq('id', user.id)
    } catch (e) {
      console.error('Error updating profile XP/Level:', e)
    }

    return NextResponse.json({
      success: true,
      id: session.id,
      logroAwarded,
      insigniaAwarded,
      xpEarned,
      newXp,
      newLevel,
      leveledUp,
      xpNeededForNext: newLevel * 100
    })
  } catch (err: any) {
    console.error('Error logging completed session:', err)
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 })
  }
}
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { micro_tarea_id, status, notes } = body

    if (!micro_tarea_id) {
      return NextResponse.json({ error: 'ID de la micro-tarea es requerido' }, { status: 400 })
    }

    const updateFields: any = {}
    if (status) updateFields.status = status
    if (notes !== undefined) {
      updateFields.notes = notes
      updateFields.notes_updated_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('micro_tareas')
      .update(updateFields)
      .eq('id', micro_tarea_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, task: data })
  } catch (err: any) {
    console.error('Error updating task:', err)
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 })
  }
}
