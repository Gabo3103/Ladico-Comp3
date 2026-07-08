"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronUp, ChevronDown } from "lucide-react"
import ExerciseShell from "@/components/ExerciseShell"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.2"
const PREFIX = "session:5.2:Intermedio"

// id = posición correcta (1..4)
const STEPS = [
  { id: 1, text: "Abrir una aplicación de recordatorios o alarmas que permita avisos repetidos." },
  { id: 2, text: "Configurar avisos diarios independientes por horario (08:00, 14:00 y 21:00), con nombre y alerta." },
  { id: 3, text: "Revisar que el aviso suene y se vea con el celular bloqueado." },
  { id: 4, text: "Verificar que los tres avisos quedaron registrados." },
]
const INITIAL = [3, 1, 4, 2]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const byId = Object.fromEntries(STEPS.map(s => [s.id, s]))
  const [order, setOrder] = useState<number[]>(INITIAL)
  const [hasMoved, setHasMoved] = useState(false)

  const move = (idx: number, dir: -1 | 1) => {
    setOrder(prev => {
      const n = [...prev]; const j = idx + dir
      if (j < 0 || j >= n.length) return prev
      setHasMoved(true)
      ;[n[idx], n[j]] = [n[j], n[idx]]; return n
    })
  }

  const handleNext = async () => {
    let ok = 0
    order.forEach((id, pos) => { if (id === pos + 1) ok++ })
    const point: 0 | 1 = ok >= 3 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-2/intermedio/ej3")
  }

  return (
    <ExerciseShell
      label="| 5.2 Identificación de necesidades y respuestas tecnológicas · Nivel Intermedio"
      index={2} total={3}
      title="Configurar avisos de un medicamento"
      instruction={'Ordenar los pasos (del paso 1 al paso 4).\n\nSituación: debe configurar avisos automáticos de un medicamento (08:00, 14:00 y 21:00), visibles y sonoros. Ordene las cuatro acciones necesarias con las flechas (1 = primera, 4 = última).'}
      onNext={handleNext} nextDisabled={!hasMoved}
    >
      <ol className="space-y-2">
        {order.map((id, idx) => (
          <li key={id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white">
            <span className="w-7 h-7 rounded-full bg-[#286575] text-white flex items-center justify-center text-sm font-semibold shrink-0">{idx + 1}</span>
            <span className="text-sm text-gray-700 flex-1">{byId[id].text}</span>
            <div className="flex flex-col">
              <button type="button" onClick={() => move(idx, -1)} className="p-1 hover:bg-gray-100 rounded"><ChevronUp className="w-4 h-4 text-gray-500" /></button>
              <button type="button" onClick={() => move(idx, 1)} className="p-1 hover:bg-gray-100 rounded"><ChevronDown className="w-4 h-4 text-gray-500" /></button>
            </div>
          </li>
        ))}
      </ol>
    </ExerciseShell>
  )
}
