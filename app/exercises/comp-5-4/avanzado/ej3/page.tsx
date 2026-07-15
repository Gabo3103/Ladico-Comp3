"use client"
import { useMemo, useState } from "react"
import { shuffledIndices } from "@/lib/shuffle"
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
  { need: "Que el adulto mayor conteste una videollamada entrante.", correct: 0 },
  { need: "Que el adulto mayor inicie una videollamada buscando el contacto en la agenda.", correct: 1 },
  { need: "Que el adulto mayor seleccione fotos de la galería y las envíe.", correct: 1 },
  { need: "Que el adulto mayor reconozca y rechace videollamadas de números desconocidos.", correct: 2 },
]

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [p1, setP1] = useState<number | null>(null)
  const [rows, setRows] = useState<(number | null)[]>(Array(ROWS.length).fill(null))
  const pickRow = (r: number, o: number) => setRows(p => { const n = [...p]; n[r] = o; return n })
  // P1: se mezclan las opciones (índice original conservado). P2: se mezcla el orden de las filas; la escala de apoyo se mantiene.
  const p1Order = useMemo(() => shuffledIndices(P1_OPTS.length), [])
  const rowOrder = useMemo(() => shuffledIndices(ROWS.length), [])

  const handleNext = async () => {
    const p1ok = p1 === P1_CORRECT ? 1 : 0
    const rowsOk = ROWS.reduce((a, r, i) => a + (rows[i] === r.correct ? 1 : 0), 0)
    // Aprueba solo si la Parte 1 es correcta Y al menos 3 de 4 filas de la Parte 2
    const point: 0 | 1 = p1ok === 1 && rowsOk >= 3 ? 1 : 0
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
      instruction={'Usted acompaña a un familiar adulto mayor que quiere usar el teléfono por su cuenta para hacer videollamadas y enviar fotos a la familia, ganando autonomía. Parte 1: identifique cuál es su verdadera necesidad de aprendizaje. Parte 2: para cada tarea, elija el tipo de apoyo proporcional a su dificultad.'}
      onNext={handleNext}
      onCheck={() => {
        const p1ok = p1 === P1_CORRECT ? 1 : 0
        const rowsOk = ROWS.reduce((a, r, i) => a + (rows[i] === r.correct ? 1 : 0), 0)
        return p1ok === 1 && rowsOk >= 3
      }}
      checkDisabled={false}
      nextLabel="Finalizar"
      nextDisabled={p1 === null || rows.some(s => s === null)}
    >
      <div className="space-y-6">
        <div>
          <p className="text-base font-semibold text-gray-800 mb-2">Parte 1 — ¿Cuál es la verdadera necesidad de aprendizaje?</p>
          <div className="space-y-2" role="radiogroup" aria-label="Parte 1: Verdadera necesidad de aprendizaje">
            {p1Order.map((j, pos) => (
              <Choice key={j} variant="radio" letter={String.fromCharCode(65 + pos)} selected={p1 === j} onClick={() => setP1(j)}>{P1_OPTS[j]}</Choice>
            ))}
          </div>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800 mb-2">Parte 2 — Elija el apoyo proporcional para cada tarea</p>
          <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
            <p><b className="text-gray-800">Demostración breve:</b> se lo muestran una vez.</p>
            <p><b className="text-gray-800">Práctica guiada acompañada:</b> lo practica con alguien al lado.</p>
            <p><b className="text-gray-800">Apoyo más extenso o repetido:</b> acompañamiento sostenido por la dificultad de la tarea.</p>
          </div>
          <div className="space-y-3">
            {rowOrder.map((i) => {
              const r = ROWS[i]
              return (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-800 mb-3">{r.need}</p>
                <div className="grid sm:grid-cols-3 gap-2" role="radiogroup" aria-label={r.need}>
                  {MENU.map((m, j) => (
                    <SegChoice key={j} selected={rows[i] === j} onClick={() => pickRow(i, j)}>{m}</SegChoice>
                  ))}
                </div>
              </div>
              )
            })}
          </div>
        </div>
      </div>
    </ExerciseShell>
  )
}
