export interface GeneratedResource {
  title: string
  type: 'link' | 'pdf' | 'video'
  url: string
}

export interface GeneratedMicroTask {
  title: string
  complexity: 'Baja' | 'Media' | 'Alta'
  estimated_time: number // En minutos
  scheduled_time: string // Ej: "16:00"
  badge_title: string // Ej: "Arquitecto de Lógica"
  badge_description: string // Ej: "Demuestra tu habilidad encapsulando..."
  guide_steps: string[]
  resources: GeneratedResource[]
}

export interface GeneratedGoalBundle {
  insignia_title: string
  insignia_description: string
  tasks: GeneratedMicroTask[]
}

export class GroqService {
  private static getApiKey(): string | undefined {
    return process.env.GROQ_API_KEY
  }
  /**
   * Genera de 3 a 5 micro-tareas con sus guías y recursos, y la insignia del objetivo utilizando la API de Groq.
   * Si la API Key no está configurada o falla la petición, retorna fallbacks.
   */
  static async generateMicroTasks(
    goalTitle: string,
    goalCategory: string,
    goalDescription?: string,
    targetTimeMinutes?: number
  ): Promise<GeneratedGoalBundle> {
    const apiKey = this.getApiKey()

    if (!apiKey) {
      console.warn('GROQ_API_KEY no encontrada en las variables de entorno. Usando fallbacks.')
      return this.getFallbackGoalBundle(goalCategory, goalTitle)
    }

    const systemPrompt = `Eres un asistente experto en productividad y diseño centrado en el usuario.
Dado un objetivo, debes generar un título y descripción de insignia muy motivadora e inspiradora que el usuario ganará al completar el objetivo al 100% (insignia_title, insignia_description). El título de la insignia debe tener sentido y ser creativo (ej. "El mero mero de React" si es para React, "Guardián de la Salud" para salud, "Buda Concentrado" para meditación).
Además, debes desglosarlo en una lista ordenada secuencialmente de 3 a 5 micro-tareas (tareas cortas y accionables de menos de 60 minutos cada una).
${targetTimeMinutes ? `El usuario tiene una meta de tiempo diario de dedicarle ${targetTimeMinutes} minutos a este objetivo. Por lo tanto, la duración estimada de cada tarea (estimated_time) debe ser un fraccionamiento lógico de esta meta diaria.` : ''}
Para cada micro-tarea:
1. Define un "Logro" (badge_title, badge_description) que declare la habilidad demostrada.
2. Define una guía de ejecución ("guide_steps") detallada y accionable con exactamente 3 a 5 pasos ordenados secuencialmente que expliquen cómo llevar a cabo la tarea paso a paso.
3. Recomienda 1 o 2 recursos reales ("resources") útiles (ej: links oficiales, documentación oficial de herramientas correspondientes, pdf de guía, etc.) con sus URLs válidas para completar esa tarea en específico.

Debes responder ESTRICTAMENTE en formato JSON. No incluyas explicaciones previas ni posteriores. El JSON debe coincidir con este esquema:
{
  "insignia_title": "Nombre creativo con sentido de la insignia del objetivo",
  "insignia_description": "Frase inspiradora felicitando al usuario por completar todo el objetivo.",
  "tasks": [
    {
      "title": "Nombre de la micro-tarea",
      "complexity": "Baja" | "Media" | "Alta",
      "estimated_time": 15,
      "scheduled_time": "16:00",
      "badge_title": "Título del logro de micro-tarea",
      "badge_description": "Frase que reconoce la destreza",
      "guide_steps": ["Paso 1...", "Paso 2...", "Paso 3..."],
      "resources": [
        {
          "title": "Título del recurso específico",
          "type": "link" | "pdf" | "video",
          "url": "https://url-real-y-util.com"
        }
      ]
    }
  ]
}`

    const userPrompt = `Objetivo: "${goalTitle}"
Categoría: ${goalCategory}
${goalDescription ? `Descripción del objetivo: "${goalDescription}"` : ''}
${targetTimeMinutes ? `Meta de tiempo diaria: ${targetTimeMinutes} minutos.` : ''}

Por favor genera la insignia y las micro-tareas con sus guías y recursos en base a esta información.`

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        throw new Error(`API de Groq respondió con código ${response.status}`)
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content || ''
      const parsed = this.cleanAndParseJSON(content)
      
      if (parsed && typeof parsed === 'object') {
        const insignia_title = parsed.insignia_title || `Aprendiz de ${goalTitle}`
        const insignia_description = parsed.insignia_description || `¡Felicidades! Has completado todas las micro-tareas del objetivo: "${goalTitle}".`
        let tasks = parsed.tasks || []
        
        const formattedTasks = tasks.map((t: any) => ({
          title: t.title || 'Micro-tarea',
          complexity: t.complexity || 'Baja',
          estimated_time: t.estimated_time || 15,
          scheduled_time: t.scheduled_time || '16:00',
          badge_title: t.badge_title || 'Logro de Micro-tarea',
          badge_description: t.badge_description || 'Habilidad demostrada.',
          guide_steps: Array.isArray(t.guide_steps) && t.guide_steps.length > 0 ? t.guide_steps : [
            'Identifica la lógica principal y los requisitos de la tarea.',
            'Divide la ejecución en pequeños pasos y trabaja de forma incremental.',
            'Realiza pruebas locales para validar que el resultado funciona según lo esperado.'
          ],
          resources: Array.isArray(t.resources) ? t.resources.map((r: any) => ({
            title: r.title || 'Recurso de apoyo',
            type: r.type || 'link',
            url: r.url || 'https://google.com'
          })) : []
        }))

        return {
          insignia_title,
          insignia_description,
          tasks: formattedTasks
        }
      }
      throw new Error('La respuesta de la IA no es un objeto válido.')
    } catch (error) {
      console.error('Fallo en la generación con Groq, usando fallbacks:', error)
      return this.getFallbackGoalBundle(goalCategory, goalTitle)
    }
  }

  /**
   * Recomienda de 1 a 2 recursos de internet (links) que complementen el objetivo utilizando Groq.
   * Si falla, retorna enlaces de fallback oficiales.
   */
  static async generateRecommendedResources(
    goalTitle: string,
    goalCategory: string
  ): Promise<GeneratedResource[]> {
    const apiKey = this.getApiKey()

    if (!apiKey) {
      console.warn('GROQ_API_KEY no encontrada. Usando recursos de fallback.')
      return this.getFallbackResources(goalCategory, goalTitle)
    }

    const systemPrompt = `Eres un asistente de búsqueda.
Dado un objetivo, debes recomendar exactamente 1 o 2 recursos/enlaces de internet reales y útiles (documentación oficial, guías de referencia, blogs reconocidos o tutoriales de plataformas consolidadas) para ayudar al usuario a completarlo.
Debes responder ESTRICTAMENTE en formato JSON, sin textos decorativos. El JSON debe ser un arreglo de objetos con el siguiente esquema:
[
  {
    "title": "Título del recurso (ej: Guía Oficial de React Router)",
    "type": "link",
    "url": "https://url-real-y-valida.com"
  }
]`

    const userPrompt = `Objetivo: "${goalTitle}"
Categoría: ${goalCategory}

Por favor recomienda los mejores recursos web para este objetivo.`

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 500,
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        throw new Error(`API de Groq respondió con código ${response.status}`)
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content || ''
      const parsed = this.cleanAndParseJSON(content)

      if (Array.isArray(parsed)) {
        return parsed as GeneratedResource[]
      } else if (parsed && typeof parsed === 'object') {
        const key = Object.keys(parsed)[0]
        if (Array.isArray(parsed[key])) {
          return parsed[key] as GeneratedResource[]
        }
      }
      throw new Error('La respuesta de recursos de la IA no es un arreglo válido.')
    } catch (error) {
      console.error('Fallo en la generación de recursos, usando fallback:', error)
      return this.getFallbackResources(goalCategory, goalTitle)
    }
  }

  private static getFallbackResources(category: string, title: string): GeneratedResource[] {
    const titleLower = title.toLowerCase()

    if (titleLower.includes('react')) {
      return [
        { title: 'Guía de Estilos UI.pdf', type: 'pdf', url: 'https://react.dev/blog' },
        { title: 'Documentación Librería', type: 'link', url: 'https://react.dev/reference/react' },
      ]
    }

    switch (category) {
      case 'Académico':
        return [
          { title: 'Google Scholar - Referencias', type: 'link', url: 'https://scholar.google.com' },
          { title: 'Temas Académicos Fundamentales', type: 'link', url: 'https://wikipedia.org' },
        ]
      case 'Salud':
        return [
          { title: 'Guía de Salud y Bienestar CDC', type: 'link', url: 'https://www.cdc.gov' },
        ]
      case 'Salud Mental':
        return [
          { title: 'Técnicas de Mindfulness y Meditación', type: 'link', url: 'https://www.mindful.org' },
        ]
      case 'Personal':
      default:
        return [
          { title: 'Método Bullet Journal Guía', type: 'link', url: 'https://bulletjournal.com' },
        ]
    }
  }



  // --- LOGICA DE PARSEO ROBUSTA ---
  private static cleanAndParseJSON(text: string): any {
    const trimmed = text.trim()
    try {
      return JSON.parse(trimmed)
    } catch {
      const match = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/```\s*([\s\S]*?)\s*```/)
      if (match && match[1]) {
        return JSON.parse(match[1].trim())
      }
      throw new Error('No se pudo extraer JSON válido del texto.')
    }
  }

  // --- METODOS DE FALLBACK ESTÁTICOS ---
  private static getFallbackGoalBundle(category: string, title: string): GeneratedGoalBundle {
    const titleLower = (title || '').toLowerCase()
    let insignia_title = `Campeón de ${title}`
    let insignia_description = `¡Felicidades! Completaste con éxito todas las micro-tareas de tu objetivo: "${title}".`
    
    if (titleLower.includes('react')) {
      insignia_title = 'El mero mero de React'
      insignia_description = '¡Felicidades! Has dominado el ecosistema de React, desde componentes funcionales hasta arquitecturas complejas.'
    } else if (category === 'Salud') {
      insignia_title = 'Guardián de la Salud'
      insignia_description = '¡Felicidades! Has demostrado constancia y disciplina en el cuidado de tu cuerpo y bienestar físico.'
    } else if (category === 'Salud Mental') {
      insignia_title = 'Mente Serena'
      insignia_description = '¡Felicidades! Has integrado con éxito hábitos de meditación, mindfulness y tranquilidad mental.'
    } else if (category === 'Personal') {
      insignia_title = 'Titán de la Productividad'
      insignia_description = '¡Felicidades! Completaste tus metas de organización personal y administración del tiempo.'
    }

    const tasks: GeneratedMicroTask[] = []
    
    if (titleLower.includes('react')) {
      tasks.push(
        { 
          title: 'Configurar Hooks personalizados', 
          complexity: 'Media', 
          estimated_time: 10, 
          scheduled_time: '16:00', 
          badge_title: 'Arquitecto de Lógica', 
          badge_description: 'Demuestra tu habilidad encapsulando lógica de negocio reactiva de forma limpia.',
          guide_steps: [
            'Crea un archivo llamado useForm.ts en tu carpeta de hooks.',
            'Define el estado inicial y maneja los cambios de inputs de forma genérica.',
            'Retorna los valores de estado y la función para limpiar campos.',
            'Importa tu custom hook en un formulario de prueba y valida su comportamiento.'
          ],
          resources: [
            { title: 'Guía oficial de Custom Hooks', type: 'link', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks' }
          ]
        },
        { 
          title: 'Optimizacion de FlatList', 
          complexity: 'Alta', 
          estimated_time: 15, 
          scheduled_time: '16:15', 
          badge_title: 'Maestro del Rendimiento', 
          badge_description: 'Demuestra tu capacidad de optimizar el renderizado de listas complejas.',
          guide_steps: [
            'Añade la propiedad keyExtractor a tu FlatList para optimizar el reconciliador de React.',
            'Implementa getItemLayout si tus celdas tienen un tamaño fijo predecible.',
            'Usa React.memo para evitar renderizados innecesarios de los componentes de celda.',
            'Verifica el consumo de memoria y la fluidez del scroll.'
          ],
          resources: [
            { title: 'Documentación Oficial de FlatList', type: 'link', url: 'https://reactnative.dev/docs/flatlist' }
          ]
        },
        { 
          title: 'Responder cuestionario', 
          complexity: 'Baja', 
          estimated_time: 5, 
          scheduled_time: '16:40', 
          badge_title: 'Cerebro Reactivo', 
          badge_description: 'Demuestra tus conocimientos teóricos sobre el ecosistema de React.',
          guide_steps: [
            'Repasa los conceptos clave del ciclo de vida de React y useEffect.',
            'Abre la sección de test y responde las preguntas de opción múltiple.',
            'Analiza tus respuestas incorrectas para consolidar el conocimiento.'
          ],
          resources: [
            { title: 'Cuestionario de React en W3Schools', type: 'link', url: 'https://www.w3schools.com/react/react_quiz.asp' }
          ]
        }
      )
    } else {
      if (category === 'Salud') {
        tasks.push(
          {
            title: 'Tomar acido',
            complexity: 'Baja',
            estimated_time: 5,
            scheduled_time: '16:00',
            badge_title: 'Salud Preventiva',
            badge_description: 'Cumple con tu toma de suplementos recomendada para el día.',
            guide_steps: [
              'Prepara un vaso de agua fresca de 250ml.',
              'Toma tu dosis diaria de ácido fólico u otras vitaminas indicadas.',
              'Registra la toma en tu diario de hábitos de salud.'
            ],
            resources: [
              { title: 'Guía de Vitaminas y Suplementos CDC', type: 'link', url: 'https://www.cdc.gov' }
            ]
          },
          {
            title: 'Caminata ligera de cardio',
            complexity: 'Media',
            estimated_time: 20,
            scheduled_time: '16:10',
            badge_title: 'Caminante Activo',
            badge_description: 'Completa tu sesión de cardio del día estimulando la salud cardiovascular.',
            guide_steps: [
              'Colócate calzado cómodo y ropa deportiva ligera.',
              'Realiza una caminata a paso ligero por 20 minutos.',
              'Mide tu ritmo cardíaco y realiza estiramientos suaves de piernas al finalizar.'
            ],
            resources: [
              { title: 'Beneficios de la caminata diaria', type: 'link', url: 'https://www.heart.org' }
            ]
          }
        )
      } else if (category === 'Salud Mental') {
        tasks.push(
          {
            title: 'Meditación guiada de calma',
            complexity: 'Baja',
            estimated_time: 15,
            scheduled_time: '16:00',
            badge_title: 'Mente en Calma',
            badge_description: 'Alcanza un estado de serenidad y relajación mental consciente.',
            guide_steps: [
              'Busca un espacio silencioso y libre de interrupciones.',
              'Siéntate en una posición cómoda con la espalda erguida.',
              'Realiza respiraciones diafragmáticas lentas: inhala en 4s, retén en 4s, exhala en 6s.',
              'Concéntrate únicamente en el flujo de tu respiración por 15 minutos.'
            ],
            resources: [
              { title: 'Ejercicios de Respiración Consciente', type: 'link', url: 'https://www.mindful.org' }
            ]
          }
        )
      } else {
        tasks.push(
          {
            title: 'Organizar espacio de trabajo',
            complexity: 'Baja',
            estimated_time: 15,
            scheduled_time: '16:00',
            badge_title: 'Maestro del Orden',
            badge_description: 'Limpia y estructura tu espacio de trabajo para optimizar tu enfoque.',
            guide_steps: [
              'Despeja tu escritorio de objetos innecesarios.',
              'Limpia la superficie de polvo y organiza tus herramientas de escritura.',
              'Ajusta la iluminación y ventilación para un confort óptimo.'
            ],
            resources: [
              { title: 'Consejos de ergonomía laboral', type: 'link', url: 'https://www.osha.gov' }
            ]
          }
        )
      }
    }

    return {
      insignia_title,
      insignia_description,
      tasks
    }
  }
}
