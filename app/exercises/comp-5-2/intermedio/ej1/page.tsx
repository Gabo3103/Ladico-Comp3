"use client"
import { useMemo, useState } from "react"
import { shuffledIndices } from "@/lib/shuffle"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.2"
const PREFIX = "session:5.2:Intermedio"

type Row = { ctx: string; sit: string; opts: string[]; correct: number }
const ROWS: Row[] = [
  { ctx: "Trabajo", sit: "Recibe a diario correos largos de distintos clientes y debe responder rápido sin dejar fuera lo que cada uno pide.",
    opts: ["Usar las respuestas automáticas sugeridas.", "Resumir automáticamente el correo.", "Traducir el correo automáticamente.", "Usar el corrector de redacción."], correct: 1 },
  { ctx: "Vida diaria", sit: "Entre muchas notificaciones, a veces no nota las importantes.",
    opts: ["Activar el modo \"no molestar\".", "Activar el resumen automático de notificaciones.", "Priorizar las notificaciones por remitente.", "Borrar las notificaciones antiguas."], correct: 2 },
  { ctx: "Accesibilidad", sit: "Una persona con baja visión amplía el texto, pero al hacerlo las pantallas se desordenan y quedan botones fuera del borde.",
    opts: ["Activar la lupa de pantalla.", "Aumentar el tamaño del texto.", "Activar el alto contraste.", "Activar el lector de pantalla."], correct: 0 },
  { ctx: "Trámites", sit: "Necesita pasar los montos y fechas de varias fotos de boletas a una planilla sin equivocarse.",
    opts: ["Extraer el texto de las fotos automáticamente.", "Usar el autocompletar de la planilla.", "Dictar los montos por voz.", "Adjuntar las fotos en la planilla."], correct: 0 },
  { ctx: "Estudio", sit: "Tiene varias clases grabadas en audio y quiere repasar solo lo clave sin reescucharlas completas.",
    opts: ["Reproducir las grabaciones a mayor velocidad.", "Transcribir el audio a texto.", "Recortar el audio por temas.", "Generar una nota de voz con el resumen."], correct: 1 },
]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [sel, setSel] = useState<(number | null)[]>(Array(ROWS.length).fill(null))
  const pick = (r: number, o: number) => setSel(p => { const n = [...p]; n[r] = o; return n })
  // Orden de filas y de opciones por fila, aleatorizado (índices originales conservados).
  const rowOrder = useMemo(() => shuffledIndices(ROWS.length), [])
  const optOrders = useMemo(() => ROWS.map(r => shuffledIndices(r.opts.length)), [])

  const handleNext = async () => {
    const ok = ROWS.reduce((a, r, i) => a + (sel[i] === r.correct ? 1 : 0), 0)
    const point: 0 | 1 = ok >= 3 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 1, point)
    await mark(0, point === 1)
    router.push("/exercises/comp-5-2/intermedio/ej2")
  }

  return (
    <ExerciseShell
      selectionType="Una opción por fila"
      label="| 5.2 Identificación de necesidades y respuestas tecnológicas · Nivel Intermedio"
      index={1} total={3}
      title="Elegir la función digital adecuada"
      instruction={'Para cada situación, elija la función digital de asistencia más adecuada. Debe marcar una opción por fila.'}
      onNext={handleNext}
      onCheck={() => ROWS.reduce((a, r, i) => a + (sel[i] === r.correct ? 1 : 0), 0) >= 3}
      checkDisabled={false}
      nextDisabled={sel.some(s => s === null)}
    >
      <p className="text-sm text-gray-600 mb-3" aria-live="polite">
        {sel.filter(s => s !== null).length} de {ROWS.length} casos respondidos
      </p>
      <div className="space-y-4">
        {rowOrder.map((i) => {
          const r = ROWS[i]
          return (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-800 mb-3"><span className="inline-block text-xs font-semibold text-[#286575] bg-[#e8f3f4] rounded-full px-2 py-0.5 mr-2">{r.ctx}</span>{r.sit}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {optOrders[i].map((j, pos) => (
                <Choice key={j} variant="radio" letter={String.fromCharCode(65 + pos)} selected={sel[i] === j} onClick={() => pick(i, j)}>{r.opts[j]}</Choice>
              ))}
            </div>
          </div>
          )
        })}
      </div>
    </ExerciseShell>
  )
}
