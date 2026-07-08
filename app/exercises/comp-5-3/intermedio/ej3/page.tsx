"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import MultipleSelectionGrid from "@/components/MultipleSelectionGrid"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.3"
const PREFIX = "session:5.3:Intermedio"
const OPTIONS = [
  "Crear un grupo de WhatsApp con los vecinos para coordinar puntos de recolección, horarios y voluntarios.",
  "Diseñar un afiche digital gratuito con una herramienta en línea y difundirlo por las redes sociales del barrio.",
  "Comprar publicidad pagada dirigida a todo el país para la campaña.",
  "Crear una planilla compartida en línea para registrar las donaciones recibidas y a qué familia se destinan.",
  "Publicar fotografías de las familias afectadas en las redes sociales del barrio.",
  "Usar un mapa en línea para compartir con los vecinos la ubicación de los puntos de recolección.",
]
const CORRECT = new Set([0, 1, 3, 5])

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [sel, setSel] = useState<Set<number>>(new Set())
  const toggle = (i: number) => setSel(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const handleNext = async () => {
    let ok = 0, bad = 0
    sel.forEach(i => (CORRECT.has(i) ? ok++ : bad++))
    const point: 0 | 1 = ok >= 3 && bad === 0 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 3, point)
    await mark(2, point === 1)
    const prog = getProgress(COMPETENCE, "intermedio")
    const qs = new URLSearchParams({
      score: String(Math.round((levelPoints(prog) / 3) * 100)),
      passed: String(isLevelPassed(prog)), correct: String(levelPoints(prog)), total: "3",
      competence: COMPETENCE, level: "intermedio",
      q1: String(getPoint(prog, 1)), q2: String(getPoint(prog, 2)), q3: String(getPoint(prog, 3)),
      sid: sessionId ?? "",
    })
    router.push(`/test/comp-5-3-intermedio/results?${qs.toString()}`)
  }

  return (
    <ExerciseShell
      label="| 5.3 Uso creativo de las tecnologías digitales · Nivel Intermedio"
      index={3} total={3}
      title="Uso responsable de la tecnología en una campaña"
      instruction={'La directiva de una junta de vecinos necesita organizar en tres días, y con poco presupuesto, una campaña para recolectar alimentos para familias afectadas por inundaciones. Seleccione TODAS las acciones que usan tecnologías digitales de forma responsable y ética para resolver el problema.'}
      onNext={handleNext} nextLabel="Finalizar" nextDisabled={sel.size === 0}
    >
      <MultipleSelectionGrid options={OPTIONS} selected={sel} onToggle={toggle} />
    </ExerciseShell>
  )
}
