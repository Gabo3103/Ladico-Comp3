// lib/caseSeed.ts
// Persiste el seed de selección de caso/escenario por ejercicio dentro de un
// mismo intento de nivel, para que salir y volver no cambie el caso mostrado.
// Se limpia junto con el progreso al finalizar o repetir el nivel.

const isBrowser = typeof window !== "undefined"

function storageKey(competence: string, level: string, ejIndex: 1 | 2 | 3) {
  return `ladico:${competence}:${level}:seed:${ejIndex}`
}

export function getOrCreateSeed(
  competence: string,
  level: string,
  ejIndex: 1 | 2 | 3
): number {
  if (!isBrowser) return Math.random()

  const key = storageKey(competence, level, ejIndex)
  try {
    const existing = localStorage.getItem(key)
    if (existing) {
      const parsed = Number(existing)
      if (!Number.isNaN(parsed)) return parsed
    }
  } catch {
    /* no-op */
  }

  const fresh = Math.random()
  try {
    localStorage.setItem(key, String(fresh))
  } catch {
    /* no-op */
  }
  return fresh
}

export function clearCaseSeeds(competence: string, level: string) {
  if (!isBrowser) return
  try {
    ;([1, 2, 3] as const).forEach((n) => {
      localStorage.removeItem(storageKey(competence, level, n))
    })
  } catch {
    /* no-op */
  }
}
