"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.4"
const PREFIX = "session:5.4:Avanzado"
const OPTIONS = [
  "Aprender a usar, paso a paso, la aplicación para pagar y hacer los trámites por sí mismo.",
  "Aprender a reconocer si una pantalla de pago es segura antes de ingresar sus datos.",
  "Aprender a recuperar el acceso si olvida la contraseña, para no quedar bloqueado.",
  "Aprender a personalizar el fondo de pantalla y los tonos de notificación.",
  "Pedir a otra persona que haga los trámites por usted.",
]
const CORRECT = new Set([0, 1, 2])

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [sel, setSel] = useState<Set<number>>(new Set())
  const toggle = (i: number) => setSel(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const handleNext = async () => {
    let ok = 0, bad = 0
    sel.forEach(i => (CORRECT.has(i) ? ok++ : bad++))
    const point: 0 | 1 = ok >= 2 && bad === 0 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-4/avanzado/ej3")
  }

  return (
    <ExerciseShell
      label="| 5.4 Identificar y abordar necesidades de competencia digital · Nivel Avanzado"
      index={2} total={3}
      title="Reunir aprendizajes según un propósito"
      instruction={'Seleccionar más de una respuesta (la persona puede marcar más de una opción).\n\nSituación: usted define un propósito concreto: "quiero manejar yo mismo mis trámites y pagos desde el teléfono, sin depender de nadie". Según ese propósito, marque los aprendizajes que conviene reunir para lograrlo.'}
      onNext={handleNext} nextDisabled={sel.size === 0}
    >
      <div className="space-y-2" role="group" aria-label="Opciones de respuesta (puede marcar más de una)">
        {OPTIONS.map((o, i) => (
          <Choice key={i} variant="check" selected={sel.has(i)} onClick={() => toggle(i)}>{String.fromCharCode(65 + i)}) {o}</Choice>
        ))}
      </div>
    </ExerciseShell>
  )
}
