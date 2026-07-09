"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import OrderingList from "@/components/OrderingList"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.2"
const PREFIX = "session:5.2:Intermedio"

// id = posición correcta (1..5)
const STEPS = [
  { id: 1, text: "Confirmar el nombre del medicamento y los horarios indicados: 08:00, 14:00 y 21:00." },
  { id: 2, text: "Abrir una aplicación de recordatorios o alarmas que permita avisos repetidos." },
  { id: 3, text: "Configurar avisos diarios independientes por horario, con nombre y alerta." },
  { id: 4, text: "Verificar que los tres avisos quedaron registrados." },
  { id: 5, text: "Comprobar que cada aviso suene y se vea con el celular bloqueado." },
]
const INITIAL = [3, 1, 5, 2, 4]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [order, setOrder] = useState<number[]>(INITIAL)
  const [hasMoved, setHasMoved] = useState(false)

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
      instruction={'Debe configurar avisos automáticos de un medicamento (08:00, 14:00 y 21:00), visibles y sonoros. Arrastre las cinco acciones para ordenarlas (1 = primera, 5 = última).'}
      onNext={handleNext}
      onCheck={() => order.reduce((acc, id, pos) => acc + (id === pos + 1 ? 1 : 0), 0) >= 3}
      checkDisabled={false}
      nextDisabled={!hasMoved}
    >
      <OrderingList
        items={STEPS}
        order={order}
        onOrderChange={setOrder}
        onInteraction={() => setHasMoved(true)}
      />
    </ExerciseShell>
  )
}
