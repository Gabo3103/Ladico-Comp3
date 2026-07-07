"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.4"
const PREFIX = "session:5.4:Avanzado"
const OPTIONS = [
  "Enseñarle a configurar él mismo los límites de tiempo y el bienestar digital del teléfono.",
  "Enseñarle a reconocer contenidos y riesgos, y a ajustar su propia configuración de privacidad.",
  "Acordar juntos reglas de uso y revisarlas periódicamente con él.",
  "Configurarle usted todos los ajustes sin explicarle cómo funcionan.",
  "Bloquearle el teléfono sin que entienda por qué.",
]
const CORRECT = new Set([0, 1, 2])

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [sel, setSel] = useState<Set<number>>(new Set())
  const toggle = (i: number) => setSel(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const handleNext = async () => {
    let ok = 0, bad = 0
    sel.forEach(i => (CORRECT.has(i) ? ok++ : bad++))
    const point: 0 | 1 = ok >= 2 && bad === 0 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 1, point)
    await mark(0, point === 1)
    router.push("/exercises/comp-5-4/avanzado/ej2")
  }

  return (
    <ExerciseShell
      label="| 5.4 Identificar y abordar necesidades de competencia digital · Nivel Avanzado"
      index={1} total={3}
      title="Apoyar la autonomía digital de un adolescente"
      instruction={'Seleccionar más de una respuesta (la persona puede marcar más de una opción).\n\nSituación: usted acompaña a un adolescente para que aprenda a manejar de forma autónoma y segura su tiempo de pantalla y su privacidad en el teléfono. Marque qué conviene enseñarle y acordar con él para que logre esa autonomía.'}
      onNext={handleNext} nextDisabled={sel.size === 0}
    >
      <div className="space-y-2" role="group" aria-label="Opciones de respuesta (puede marcar más de una)">
        {OPTIONS.map((o, i) => (
          <Choice key={i} variant="check" selected={sel.has(i)} onClick={() => toggle(i)}>{String.fromCharCode(65 + i)}) {o}</Choice>
        ))}
      </div>
    </ExerciseShell>
  )
}
