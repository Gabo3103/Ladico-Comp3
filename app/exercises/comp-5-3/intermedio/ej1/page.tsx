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
  { text: "Una empresa desarrolla una app de salud que permite al usuario elegir qué datos personales comparte, ofrece la información en lenguaje simple y fue diseñada con la participación de pacientes reales durante su desarrollo.", correct: 0 },
  { text: "Un banco lanza una app móvil que solo funciona en celulares de última generación y requiere verificación biométrica sin alternativa, dejando fuera a clientes con dispositivos antiguos o con discapacidad.", correct: 1 },
  { text: "Una plataforma de educación en línea permite ajustar el tamaño del texto, ofrece subtítulos en los videos y adapta el ritmo del contenido según el avance de cada estudiante.", correct: 0 },
  { text: "Un sistema de postulación laboral filtra automáticamente los currículos usando IA sin que los postulantes sepan los criterios de selección ni tengan forma de apelar el resultado.", correct: 1 },
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
      instruction={'Elegir una opción en cada fila.\n\nInstrucción: para cada situación, identifique si aplica o no un enfoque centrado en las personas (human-centric): colocar los derechos, valores y necesidades de las personas en el centro del diseño y uso de la tecnología.'}
      onNext={handleNext}
    >
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
