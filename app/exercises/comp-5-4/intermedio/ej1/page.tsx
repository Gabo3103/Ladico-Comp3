"use client"
import { useMemo, useState } from "react"
import { shuffledIndices } from "@/lib/shuffle"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.4"
const PREFIX = "session:5.4:Intermedio"

type Row = { caso: string; opts: string[]; correct: number }
const ROWS: Row[] = [
  { caso: "Completó una solicitud abierta desde un enlace recibido por mensaje. Luego comenzó a recibir correos y llamadas relacionados con datos que solo había ingresado allí.",
    opts: ["Cambiar la dirección de correo y bloquear las llamadas no deseadas cuando ocurran.", "Revisar las señales de confiabilidad de una página antes de ingresar datos.", "Usar navegación privada al abrir enlaces recibidos.", "Borrar el historial, las cookies y los datos del navegador."], correct: 1 },
  { caso: "Compartió un documento para revisión y luego encontró cambios en secciones que no esperaba modificar.",
    opts: ["Recuperar versiones anteriores tras cambios no esperados.", "Proteger los documentos con contraseña antes de enviarlos.", "Elegir entre permisos de lectura, comentario y edición al compartir.", "Enviar siempre una copia por correo antes de compartir el documento."], correct: 2 },
  { caso: "Usó una IA para resumir un texto; el resultado estaba bien redactado, pero dejó fuera condiciones relevantes.",
    opts: ["Solicitar varios resúmenes y elegir el que parezca más completo.", "Guardar las respuestas para revisarlas después.", "Dividir los textos largos antes de enviarlos.", "Formular instrucciones con criterios claros y revisar el resultado con la fuente."], correct: 3 },
  { caso: "Al enviar un archivo, había varias versiones con nombres parecidos; usó una versión anterior y debió repetir el envío.",
    opts: ["Ordenar los archivos por fecha antes de enviarlos.", "Marcar los archivos como favoritos.", "Guardar copias de seguridad de lo enviado.", "Usar nombres claros, carpetas, filtros y fechas para controlar las versiones."], correct: 3 },
  { caso: "Al instalar una aplicación, aceptó rápidamente varias solicitudes de acceso; luego notó que usaba información del dispositivo que no parecía necesaria.",
    opts: ["Revisar los permisos de las aplicaciones y decidir cuáles son necesarios según su función.", "Desinstalar las aplicaciones que ocupan mucho espacio.", "Cerrar las aplicaciones en segundo plano.", "Actualizar las aplicaciones desde la tienda oficial."], correct: 0 },
]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [sel, setSel] = useState<(number | null)[]>(Array(ROWS.length).fill(null))
  const pick = (r: number, o: number) => setSel(p => { const n = [...p]; n[r] = o; return n })
  const rowOrder = useMemo(() => shuffledIndices(ROWS.length), [])
  const optOrders = useMemo(() => ROWS.map(r => shuffledIndices(r.opts.length)), [])

  const handleNext = async () => {
    const ok = ROWS.reduce((a, r, i) => a + (sel[i] === r.correct ? 1 : 0), 0)
    const point: 0 | 1 = ok >= 3 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 1, point)
    await mark(0, point === 1)
    router.push("/exercises/comp-5-4/intermedio/ej2")
  }

  return (
    <ExerciseShell
      selectionType="Una opción por caso"
      label="| 5.4 Identificar y abordar necesidades de competencia digital · Nivel Intermedio"
      index={1} total={3}
      title="¿Qué necesita aprender para evitar el problema?"
      instruction={'En las últimas semanas cometió errores con herramientas digitales que le obligaron a repetir trabajo. Para cada caso, identifique el aprendizaje que necesita desarrollar para evitar que el mismo problema vuelva a ocurrir.'}
      onNext={handleNext}
      onCheck={() => ROWS.reduce((a, r, i) => a + (sel[i] === r.correct ? 1 : 0), 0) >= 3}
      checkDisabled={false}
      nextDisabled={sel.some(s => s === null)}
    >
      <p className="text-xs text-gray-500 mb-3" aria-live="polite">{sel.filter(s => s !== null).length} de {ROWS.length} casos respondidos</p>
      <div className="space-y-4">
        {rowOrder.map((i, pos) => {
          const r = ROWS[i]
          return (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-[15px] leading-relaxed text-gray-800 mb-2.5"><span className="text-sm font-semibold text-[#286575] mr-2">Caso {pos + 1}.</span>{r.caso}</p>
            <div className="grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label={`Caso ${pos + 1}`}>
              {optOrders[i].map((j, p2) => (
                <Choice key={j} variant="radio" letter={String.fromCharCode(65 + p2)} selected={sel[i] === j} onClick={() => pick(i, j)}>{r.opts[j]}</Choice>
              ))}
            </div>
          </div>
          )
        })}
      </div>
    </ExerciseShell>
  )
}
