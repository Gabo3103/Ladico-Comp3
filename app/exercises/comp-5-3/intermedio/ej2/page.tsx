"use client"
import { useMemo, useState } from "react"
import { shuffledIndices } from "@/lib/shuffle"
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
      "Que elimina la necesidad de revisar el texto / Que ocupa mucho espacio en el dispositivo.",
      "Que acelera la redacción inicial del informe / Que puede incluir datos incorrectos que hay que verificar.",
      "Que garantiza contenido siempre original / Que solo funciona con conexión a Internet.",
    ], correct: 1,
  },
  {
    q: "Enunciado 2: \"Una consideración ética al usar IA para seleccionar candidatos en un proceso de contratación es _____.\"",
    opts: [
      "Que puede reproducir sesgos de los datos con que fue entrenado, afectando la equidad del proceso.",
      "Que suele ser más lento que revisar las hojas de vida a mano en un proceso grande.",
      "Que algunos candidatos podrían no estar familiarizados con el uso de la IA.",
    ], correct: 0,
  },
  {
    q: "Enunciado 3: \"Al evaluar si usar una herramienta de diseño con IA para crear material publicitario, una debilidad relevante es _____.\"",
    opts: [
      "Que las imágenes generadas suelen tener una resolución demasiado baja para imprimir.",
      "Que la herramienta solo puede utilizarse desde un computador de escritorio.",
      "Que las imágenes pueden infringir derechos de autor o parecerse a obras existentes.",
    ], correct: 2,
  },
]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [ans, setAns] = useState<(number | null)[]>([null, null, null])
  const set = (i: number, v: number) => setAns(p => { const n = [...p]; n[i] = v; return n })
  // Orden de opciones aleatorizado por enunciado (índice original conservado).
  const optOrders = useMemo(() => ENUNCIADOS.map(e => shuffledIndices(e.opts.length)), [])

  const handleNext = async () => {
    const ok = ENUNCIADOS.reduce((a, e, i) => a + (ans[i] === e.correct ? 1 : 0), 0)
    const point: 0 | 1 = ok >= 2 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-3/intermedio/ej3")
  }

  return (
    <ExerciseShell
      selectionType="Una opción por enunciado"
      label="| 5.3 Uso creativo de las tecnologías digitales · Nivel Intermedio"
      index={2} total={3}
      title="Fortalezas, debilidades y ética de la IA"
      instruction={'En su equipo de trabajo evalúan si incorporar herramientas de inteligencia artificial para distintas tareas. Identifique correctamente las fortalezas, debilidades y consideraciones éticas en cada caso.'}
      onNext={handleNext}
      onCheck={() => ENUNCIADOS.reduce((a, e, i) => a + (ans[i] === e.correct ? 1 : 0), 0) >= 2}
      checkDisabled={false}
      nextDisabled={ans.some(a => a === null)}
    >
      <div className="space-y-6">
        {ENUNCIADOS.map((e, i) => (
          <div key={i}>
            <p className="font-medium text-gray-800 text-sm mb-2">{e.q}</p>
            <div className="space-y-2" role="radiogroup">
              {optOrders[i].map((j, pos) => (
                <Choice key={j} variant="radio" letter={String.fromCharCode(65 + pos)} selected={ans[i] === j} onClick={() => set(i, j)}>{e.opts[j]}</Choice>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ExerciseShell>
  )
}
