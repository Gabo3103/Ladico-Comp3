// lib/firstExerciseRoute.ts
export type LevelSlug = "basico" | "intermedio" | "avanzado"

/**
 
Devuelve la URL del primer ejercicio para una competencia y nivel.
Agrega aquí tus competencias a medida que vayas creando niveles estáticos.*/
export function firstExerciseRoute(competenceId: string, level: LevelSlug): string {
  // Mapa explícito de rutas iniciales por competencia/nivel
  const map: Record<string, Partial<Record<LevelSlug, string>>> = {
    // Búsqueda y gestión de información
    "1.3": {
      basico: "/test/1.3?level=básico",
      intermedio: "/exercises/comp-1-3/intermedio/ej1",
      avanzado: "/exercises/comp-1-3/avanzado/ej1",
    },

    // Programación 3.4
    "3.4": {
      basico: "/test/1.3?level=básico", // 
      intermedio: "/exercises/comp-3-4/intermedio/ej1", // 
      avanzado: "/exercises/comp-3-4/avanzado/ej1",   
    },


    // Seguridad 4.3
    "4.3": {
      basico: "/test/4.3?level=básico",
      intermedio: "/exercises/comp-4-3/intermedio/ej1",
      avanzado: "/exercises/comp-4-3/avanzado/ej1",
    },

    // 5.1 Resolución de problemas técnicos
    "5.1": {
      basico: "/test/5.1?level=básico",
      intermedio: "/exercises/comp-5-1/intermedio/ej1",
      avanzado: "/exercises/comp-5-1/avanzado/ej1",
    },

    // 5.2 Identificación de necesidades y respuestas tecnológicas
    "5.2": {
      basico: "/test/5.2?level=básico",
      intermedio: "/exercises/comp-5-2/intermedio/ej1",
      avanzado: "/exercises/comp-5-2/avanzado/ej1",
    },

    // 5.3 Uso creativo de las tecnologías digitales
    "5.3": {
      basico: "/test/5.3?level=básico",
      intermedio: "/exercises/comp-5-3/intermedio/ej1",
      avanzado: "/exercises/comp-5-3/avanzado/ej1",
    },

    // 5.4 Identificar y abordar necesidades de competencia digital
    "5.4": {
      basico: "/test/5.4?level=básico",
      intermedio: "/exercises/comp-5-4/intermedio/ej1",
      avanzado: "/exercises/comp-5-4/avanzado/ej1",
    },
  }

  const byLevel = map[competenceId]
  if (byLevel?.[level]) return byLevel[level]!

  // Fallback: usa la ruta genérica "/test/{competencia}?level={nivel}"
  const lv = level === "basico" ? "básico" : level
  return `/test/${competenceId}?level=${encodeURIComponent(lv)}`
}
