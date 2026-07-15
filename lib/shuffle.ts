// Utilidades de mezcla (Fisher-Yates). Se usan para variar el orden de
// opciones/filas/pasos en cada carga sin alterar la lógica de puntaje:
// el índice original se conserva; solo cambia el orden de presentación.

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Devuelve [0..n-1] en orden aleatorio.
export function shuffledIndices(n: number): number[] {
  return shuffle(Array.from({ length: n }, (_, i) => i))
}

// Como shuffledIndices, pero evita devolver el orden idéntico (útil para
// "ordenar pasos", donde no debe aparecer ya ordenado). Si n < 2, retorna [0..n-1].
export function shuffledIndicesNotIdentity(n: number): number[] {
  if (n < 2) return Array.from({ length: n }, (_, i) => i)
  let order = shuffledIndices(n)
  let guard = 0
  while (order.every((v, i) => v === i) && guard++ < 20) order = shuffledIndices(n)
  return order
}
