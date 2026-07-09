"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import OrderingList from "@/components/OrderingList"
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
  const [order, setOrder] = useState<number[]>(INITIAL)
  const [hasMoved, setHasMoved] = useState(false)

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
      instruction={'Recibe un mensaje de texto que dice que se hizo una compra por $189.990 con su tarjeta terminada en **4532 y le pide ingresar a un enlace. Usted no ha realizado ninguna compra por ese monto.\n\nArrastre las acciones para ordenarlas por prioridad (1 = primera, 5 = última).'}
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
