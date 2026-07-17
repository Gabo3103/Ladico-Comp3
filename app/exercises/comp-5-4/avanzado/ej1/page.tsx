"use client"
import { useMemo, useState } from "react"
import { shuffledIndices } from "@/lib/shuffle"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import MultipleSelectionGrid from "@/components/MultipleSelectionGrid"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.4"
const PREFIX = "session:5.4:Avanzado"
const OPTIONS = [
  "Enseñarle a configurar él mismo los límites de tiempo y el bienestar digital del teléfono.",
  "Enseñarle a reconocer contenidos y riesgos, y a ajustar su propia configuración de privacidad.",
  "Acordar juntos reglas de uso y revisarlas periódicamente con él.",
  "Dejar el teléfono ya configurado por usted para que no deba preocuparse de los ajustes.",
  "Instalar una aplicación de control para revisar y limitar su actividad desde su teléfono.",
]
const CORRECT = new Set([0, 1, 2])

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const order = useMemo(() => shuffledIndices(OPTIONS.length), [])
  const [sel, setSel] = useState<Set<number>>(new Set())
  const toggle = (i: number) => setSel(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const handleNext = async () => {
    let ok = 0, bad = 0
    sel.forEach(i => (CORRECT.has(i) ? ok++ : bad++))
    const point: 0 | 1 = ok >= 2 && bad === 0 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 1, point)
    await mark(0, point === 1)
    router.push("/exercises/comp-5-4/avanzado/ej2")
  }

  return (
    <ExerciseShell
      selectionType="Selección múltiple"
      label="| 5.4 Identificar y abordar necesidades de competencia digital · Nivel Avanzado"
      index={1} total={3}
      title="Apoyar la autonomía digital de un adolescente"
      instruction={'Usted acompaña a un adolescente para que aprenda a manejar de forma autónoma y segura su tiempo de pantalla y su privacidad en el teléfono. Marque la o las opciones que conviene enseñarle y acordar con él para que logre esa autonomía.'}
      onNext={handleNext}
      onCheck={() => {
        let ok = 0, bad = 0
        sel.forEach(i => (CORRECT.has(i) ? ok++ : bad++))
        return ok >= 2 && bad === 0
      }}
      checkDisabled={false}
      nextDisabled={sel.size === 0}
    >
      <MultipleSelectionGrid options={OPTIONS} selected={sel} onToggle={toggle} order={order} />
    </ExerciseShell>
  )
}
