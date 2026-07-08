"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice, SegChoice } from "@/components/Choice"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.4"
const PREFIX = "session:5.4:Avanzado"

const P1_OPTS = [
  "Que la persona comprenda y practique los pasos para hacer videollamadas y enviar fotos por sí misma.",
  "Que usted mantenga siempre configurado el teléfono de la persona.",
  "Que la persona memorice un número de soporte para llamar ante cualquier duda.",
  "Que la persona evite usar el teléfono para no equivocarse.",
]
const P1_CORRECT = 0

const MENU = ["Demostración breve", "Práctica guiada acompañada", "Apoyo más extenso o repetido"]
type Row = { need: string; correct: number }
const ROWS: Row[] = [
  { need: "Contestar una videollamada entrante.", correct: 0 },
  { need: "Iniciar una videollamada buscando el contacto correcto.", correct: 1 },
  { need: "Enviar fotos seleccionándolas desde la galería.", correct: 1 },
  { need: "Reconocer y no aceptar videollamadas de números desconocidos.", correct: 2 },
]

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [p1, setP1] = useState<number | null>(null)
  const [rows, setRows] = useState<(number | null)[]>(Array(ROWS.length).fill(null))
  const pickRow = (r: number, o: number) => setRows(p => { const n = [...p]; n[r] = o; return n })

  const handleNext = async () => {
    const p1ok = p1 === P1_CORRECT ? 1 : 0
    const rowsOk = ROWS.reduce((a, r, i) => a + (rows[i] === r.correct ? 1 : 0), 0)
    const total = p1ok + rowsOk // máx 5
    const point: 0 | 1 = total >= 3 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 3, point)
    await mark(2, point === 1)
    const prog = getProgress(COMPETENCE, "avanzado")
    const qs = new URLSearchParams({
      score: String(Math.round((levelPoints(prog) / 3) * 100)),
      passed: String(isLevelPassed(prog)), correct: String(levelPoints(prog)), total: "3",
      competence: COMPETENCE, level: "avanzado",
      q1: String(getPoint(prog, 1)), q2: String(getPoint(prog, 2)), q3: String(getPoint(prog, 3)),
      sid: sessionId ?? "",
    })
    router.push(`/test/comp-5-4-advanced/results?${qs.toString()}`)
  }

  return (
    <ExerciseShell
      label="| 5.4 Identificar y abordar necesidades de competencia digital · Nivel Avanzado"
      index={3} total={3}
      title="Apoyo proporcional a un familiar mayor"
      instruction={'Parte 1: seleccionar una sola respuesta. Parte 2: elegir una opción en cada fila.\n\nSituación: usted acompaña a un familiar mayor que quiere "hacer su vida más fácil" usando el teléfono para videollamadas y enviar fotos a la familia, ganando autonomía. Identifique la verdadera necesidad de aprendizaje y, para cada tarea, elija el tipo de apoyo proporcional a su complejidad.'}
      onNext={handleNext} nextLabel="Finalizar" nextDisabled={p1 === null || rows.some(s => s === null)}
    >
      <div className="space-y-6">
        <div>
          <p className="text-base font-semibold text-gray-800 mb-2">Parte 1 — ¿Cuál es la verdadera necesidad de aprendizaje?</p>
          <div className="space-y-2" role="radiogroup" aria-label="Parte 1: verdadera necesidad de aprendizaje">
            {P1_OPTS.map((o, j) => (
              <Choice key={j} variant="radio" letter={String.fromCharCode(65 + j)} selected={p1 === j} onClick={() => setP1(j)}>{o}</Choice>
            ))}
          </div>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800 mb-2">Parte 2 — Elija el apoyo proporcional para cada tarea</p>
          <div className="space-y-3">
            {ROWS.map((r, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-800 mb-3">{r.need}</p>
                <div className="grid sm:grid-cols-3 gap-2" role="radiogroup" aria-label={r.need}>
                  {MENU.map((m, j) => (
                    <SegChoice key={j} selected={rows[i] === j} onClick={() => pickRow(i, j)}>{m}</SegChoice>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ExerciseShell>
  )
}
