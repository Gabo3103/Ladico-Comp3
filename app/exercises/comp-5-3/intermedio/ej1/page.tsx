"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.3"
const PREFIX = "session:5.3:Intermedio"

// correct: 0 = centrado en las personas, 1 = NO centrado
const SITS: { text: string; correct: 0 | 1 }[] = [
  { text: "Una municipalidad lanza una app de trámites con un diseño sencillo; tardó varios meses más de lo previsto porque incorporó pruebas y comentarios de vecinos mayores, y permite deshacer cada paso antes de confirmar.", correct: 0 },
  { text: "Una app de finanzas muy elogiada por su diseño y rapidez personaliza la experiencia recopilando datos de uso en segundo plano; no explica qué datos toma ni ofrece una forma de desactivarlo.", correct: 1 },
  { text: "Una plataforma de salud reduce funciones vistosas para cargar rápido en teléfonos antiguos y con poca señal, e incluye una versión por teléfono para quienes no usan la app.", correct: 0 },
  { text: "Un servicio de atención reemplaza a sus operadores por un asistente automático disponible las 24 horas que resuelve más rápido; no ofrece una vía para hablar con una persona cuando el caso es complejo.", correct: 1 },
]
const LABELS = ["Enfoque centrado en las personas", "Enfoque NO centrado en las personas"]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [sel, setSel] = useState<(0 | 1 | null)[]>(Array(SITS.length).fill(null))
  const pick = (i: number, v: 0 | 1) => setSel(p => { const n = [...p]; n[i] = v; return n })

  const handleNext = async () => {
    const ok = SITS.reduce((a, s, i) => a + (sel[i] === s.correct ? 1 : 0), 0)
    const point: 0 | 1 = ok >= 3 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 1, point)
    await mark(0, point === 1)
    router.push("/exercises/comp-5-3/intermedio/ej2")
  }

  return (
    <ExerciseShell
      label="| 5.3 Uso creativo de las tecnologías digitales · Nivel Intermedio"
      index={1} total={3}
      title="¿Enfoque centrado en las personas?"
      instruction={'Para cada situación, identifique si aplica o no un enfoque centrado en las personas (human-centric): colocar los derechos, valores y necesidades de las personas en el centro del diseño y uso de la tecnología.'}
      onNext={handleNext} nextDisabled={sel.some(s => s === null)}
    >
      <p className="text-sm text-gray-600 mb-3" aria-live="polite">
        {sel.filter(s => s !== null).length} de {SITS.length} situaciones respondidas
      </p>
      <div className="space-y-4">
        {SITS.map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-800 mb-3"><span className="text-xs font-semibold text-[#286575] mr-2">Situación {i + 1}.</span>{s.text}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {LABELS.map((l, j) => (
                <Choice key={j} variant="radio" selected={sel[i] === j} onClick={() => pick(i, j as 0 | 1)}>{l}</Choice>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ExerciseShell>
  )
}
