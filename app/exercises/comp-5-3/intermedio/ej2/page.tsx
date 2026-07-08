"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.3"
const PREFIX = "session:5.3:Intermedio"

const ENUNCIADOS = [
  {
    q: "Enunciado 1: \"Una fortaleza de usar IA para generar borradores de informes es _____; una debilidad es _____.\"",
    opts: [
      "Que elimina la necesidad de revisión humana / Que ocupa mucho espacio en el dispositivo.",
      "Que reduce el tiempo de redacción inicial / Que el contenido puede contener datos incorrectos o desactualizados que requieren verificación humana.",
      "Que siempre genera contenido original / Que funciona solo con conexión a Internet.",
    ], correct: 1,
  },
  {
    q: "Enunciado 2: \"Una consideración ética al usar IA para seleccionar candidatos en un proceso de contratación es _____.\"",
    opts: [
      "Que el sistema podría reproducir sesgos discriminatorios presentes en los datos con los que fue entrenado, afectando la equidad del proceso.",
      "Que el sistema es más lento que la revisión manual de currículos.",
      "Que los candidatos podrían no saber usar inteligencia artificial.",
    ], correct: 0,
  },
  {
    q: "Enunciado 3: \"Al evaluar si usar una herramienta de diseño con IA para crear material publicitario, una debilidad relevante es _____.\"",
    opts: [
      "Que las imágenes generadas son siempre de baja resolución.",
      "Que la herramienta solo funciona en computadores de escritorio.",
      "Que las imágenes generadas pueden infringir derechos de autor o parecerse a obras existentes sin atribución.",
    ], correct: 2,
  },
]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [ans, setAns] = useState<(number | null)[]>([null, null, null])
  const set = (i: number, v: number) => setAns(p => { const n = [...p]; n[i] = v; return n })

  const handleNext = async () => {
    const ok = ENUNCIADOS.reduce((a, e, i) => a + (ans[i] === e.correct ? 1 : 0), 0)
    const point: 0 | 1 = ok >= 2 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-3/intermedio/ej3")
  }

  return (
    <ExerciseShell
      label="| 5.3 Uso creativo de las tecnologías digitales · Nivel Intermedio"
      index={2} total={3}
      title="Fortalezas, debilidades y ética de la IA"
      instruction={'En su equipo de trabajo evalúan si incorporar herramientas de inteligencia artificial para distintas tareas. Identifique correctamente las fortalezas, debilidades y consideraciones éticas en cada caso.'}
      onNext={handleNext} nextDisabled={ans.some(a => a === null)}
    >
      <div className="space-y-6">
        {ENUNCIADOS.map((e, i) => (
          <div key={i}>
            <p className="font-medium text-gray-800 text-sm mb-2">{e.q}</p>
            <div className="space-y-2" role="radiogroup">
              {e.opts.map((o, j) => (
                <Choice key={j} variant="radio" letter={String.fromCharCode(65 + j)} selected={ans[i] === j} onClick={() => set(i, j)}>{o}</Choice>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ExerciseShell>
  )
}
