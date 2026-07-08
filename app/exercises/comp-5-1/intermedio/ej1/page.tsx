"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.1"
const PREFIX = "session:5.1:Intermedio"
const OPTIONS = [
  "Abrir una página web en el navegador para verificar si el dispositivo tiene conexión a Internet.",
  "Acceder a su correo electrónico desde el navegador web (versión webmail).",
  "Buscar en Internet el mensaje de error exacto junto con el nombre de la aplicación.",
  "Cambiar la frecuencia de sincronización del correo en los ajustes de la cuenta.",
  "Eliminar correos antiguos del buzón.",
  "Reiniciar el dispositivo.",
]
const CORRECT = new Set([0, 1, 2, 5])

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [sel, setSel] = useState<Set<number>>(new Set())

  const toggle = (i: number) =>
    setSel((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const handleNext = async () => {
    let ok = 0, bad = 0
    sel.forEach((i) => (CORRECT.has(i) ? ok++ : bad++))
    const point: 0 | 1 = ok >= 3 && bad === 0 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 1, point)
    await mark(0, point === 1)
    router.push("/exercises/comp-5-1/intermedio/ej2")
  }

  return (
    <ExerciseShell
      label="| 5.1 Identificar y resolver problemas técnicos · Nivel Intermedio"
      index={1} total={3}
      title="Resolver un problema de conexión de correo"
      instruction={'Selección múltiple (seleccione todas las estrategias adecuadas).\n\nSituación: Su aplicación de correo electrónico muestra el mensaje "Error de conexión con el servidor" desde hace 20 minutos. Usted espera una respuesta laboral urgente y necesita acceder a su bandeja de entrada lo antes posible.\n\nSeleccione TODAS las estrategias de resolución que considere adecuadas para este problema.'}
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
