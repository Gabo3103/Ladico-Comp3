"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronUp, ChevronDown } from "lucide-react"
import ExerciseShell from "@/components/ExerciseShell"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.1"
const PREFIX = "session:5.1:Intermedio"

// id = posición correcta (1..5)
const STEPS = [
  { id: 1, text: "No hacer clic en el enlace incluido en el mensaje." },
  { id: 2, text: "Verificar en la aplicación oficial de su banco si aparece registrada alguna transacción por ese monto." },
  { id: 3, text: "Comunicarse con su banco a través del número oficial que figura en su tarjeta o en la aplicación." },
  { id: 4, text: "Solicitar el bloqueo inmediato de la tarjeta si se confirma que la operación es fraudulenta." },
  { id: 5, text: "Cambiar las contraseñas de acceso a su banca en línea y activar las notificaciones de seguridad." },
]
// orden inicial mezclado
const INITIAL = [3, 1, 5, 2, 4]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const byId = Object.fromEntries(STEPS.map((s) => [s.id, s]))
  const [order, setOrder] = useState<number[]>(INITIAL)

  const move = (idx: number, dir: -1 | 1) => {
    setOrder((prev) => {
      const n = [...prev]; const j = idx + dir
      if (j < 0 || j >= n.length) return prev
      ;[n[idx], n[j]] = [n[j], n[idx]]; return n
    })
  }

  const handleNext = async () => {
    let ok = 0
    order.forEach((id, pos) => { if (id === pos + 1) ok++ })
    const point: 0 | 1 = ok >= 3 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-1/intermedio/ej3")
  }

  return (
    <ExerciseShell
      label="| 5.1 Identificar y resolver problemas técnicos · Nivel Intermedio"
      index={2} total={3}
      title="Ordenar la respuesta ante un aviso de cargo sospechoso"
      instruction={'Ordene por prioridad (del paso 1 al paso 5).\n\nSituación: Recibe un mensaje de texto que dice que se hizo una compra por $189.990 con su tarjeta terminada en **4532 y le pide ingresar a un enlace. Usted no ha realizado ninguna compra por ese monto.\n\nUse las flechas para ordenar las acciones (1 = primera, 5 = última).'}
      onNext={handleNext}
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
