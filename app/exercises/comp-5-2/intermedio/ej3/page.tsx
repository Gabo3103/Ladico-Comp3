"use client"
import { useMemo, useState } from "react"
import { shuffledIndices } from "@/lib/shuffle"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import MultipleSelectionGrid from "@/components/MultipleSelectionGrid"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.2"
const PREFIX = "session:5.2:Intermedio"
const OPTIONS = [
  "Configurar respuestas rápidas o atajos de texto para reutilizar mensajes frecuentes dirigidos a clientes.",
  "Guardar ubicaciones frecuentes en la aplicación de mapas y usar comandos de voz para iniciar la navegación rápidamente.",
  "Organizar mejor la agenda y los recordatorios personales para responder más rápido los mensajes.",
  "Activar el asistente de voz del teléfono para dictar cada mensaje antes de enviarlo.",
]
const CORRECT = new Set([0, 1])

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const order = useMemo(() => shuffledIndices(OPTIONS.length), [])
  const [sel, setSel] = useState<Set<number>>(new Set())
  const toggle = (i: number) => setSel(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const handleNext = async () => {
    let ok = 0, bad = 0
    sel.forEach(i => (CORRECT.has(i) ? ok++ : bad++))
    const point: 0 | 1 = ok === 2 && bad === 0 ? 1 : 0
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
    router.push(`/test/comp-5-2-intermedio/results?${qs.toString()}`)
  }

  return (
    <ExerciseShell
      label="| 5.2 Identificación de necesidades y respuestas tecnológicas · Nivel Intermedio"
      index={3} total={3}
      title="Herramientas para tareas repetitivas"
      instruction={'Un compañero pierde tiempo en tareas repetitivas (saludos a clientes vía notificación, búsqueda de rutas, registro de gastos). Seleccione las recomendaciones que aprovechan herramientas de asistencia digital para optimizarlas.'}
      onNext={handleNext}
      onCheck={() => {
        let ok = 0, bad = 0
        sel.forEach(i => (CORRECT.has(i) ? ok++ : bad++))
        return ok === 2 && bad === 0
      }}
      checkDisabled={false}
      nextLabel="Finalizar"
      nextDisabled={sel.size === 0}
    >
      <MultipleSelectionGrid options={OPTIONS} selected={sel} onToggle={toggle} order={order} />
    </ExerciseShell>
  )
}
