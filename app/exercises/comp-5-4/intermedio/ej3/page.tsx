"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { SegChoice } from "@/components/Choice"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.4"
const PREFIX = "session:5.4:Intermedio"
const MENU = ["Demostración breve", "Guía para practicar", "Curso o apoyo más completo"]

type Row = { need: string; correct: number }
const ROWS: Row[] = [
  { need: "Cambiar la foto de perfil y el nombre visible del negocio en una red social.", correct: 0 },
  { need: "Escribir descripciones de productos claras y atractivas para publicarlas.", correct: 1 },
  { need: "Configurar el cobro en línea entendiendo comisiones, boletas y seguridad.", correct: 2 },
  { need: "Subir una primera publicación con foto y precio del producto.", correct: 1 },
  { need: "Saber qué datos de clientes puede guardar y cómo protegerlos.", correct: 2 },
]

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [sel, setSel] = useState<(number | null)[]>(Array(ROWS.length).fill(null))
  const pick = (r: number, o: number) => setSel(p => { const n = [...p]; n[r] = o; return n })

  const handleNext = async () => {
    const ok = ROWS.reduce((a, r, i) => a + (sel[i] === r.correct ? 1 : 0), 0)
    const point: 0 | 1 = ok >= 3 ? 1 : 0
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
    router.push(`/test/comp-5-4-intermedio/results?${qs.toString()}`)
  }

  return (
    <ExerciseShell
      label="| 5.4 Identificar y abordar necesidades de competencia digital · Nivel Intermedio"
      index={3} total={3}
      title="¿Qué aprender para vender en línea?"
      instruction={'Tiene un pequeño negocio de productos caseros y quiere empezar a vender por internet y recibir pagos. Para cada necesidad, elija el tipo de aprendizaje o apoyo más proporcional a su complejidad.'}
      onNext={handleNext}
      onCheck={() => ROWS.reduce((a, r, i) => a + (sel[i] === r.correct ? 1 : 0), 0) >= 3}
      checkDisabled={false}
      nextLabel="Finalizar"
      nextDisabled={sel.some(s => s === null)}
    >
      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
        <p><b className="text-gray-800">Demostración breve:</b> le muestran una vez cómo se hace.</p>
        <p><b className="text-gray-800">Guía para practicar:</b> instrucciones paso a paso para que lo practique solo/a.</p>
        <p><b className="text-gray-800">Curso o apoyo más completo:</b> aprendizaje guiado y repetido por su complejidad o riesgo.</p>
      </div>
      <p className="text-xs text-gray-500 mb-3" aria-live="polite">{sel.filter(s => s !== null).length} de {ROWS.length} filas respondidas</p>
      <div className="space-y-3">
        {ROWS.map((r, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-[13px] text-gray-800 mb-2.5">{r.need}</p>
            <div className="grid sm:grid-cols-3 gap-2" role="radiogroup" aria-label={r.need}>
              {MENU.map((m, j) => (
                <SegChoice key={j} selected={sel[i] === j} onClick={() => pick(i, j)}>{m}</SegChoice>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ExerciseShell>
  )
}
