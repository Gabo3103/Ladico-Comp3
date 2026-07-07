"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.4"
const PREFIX = "session:5.4:Intermedio"

type Etapa = { fin: string; opts: string[]; correct: number }
const ETAPAS: Etapa[] = [
  { fin: "Paso 1 — Para enterarse de en qué consistirá el cambio:",
    opts: ["Buscar videos aleatorios en redes sociales.", "Leer el aviso y la guía oficial del servicio.", "Activar las notificaciones promocionales.", "Consultar únicamente la opinión de otros usuarios."], correct: 1 },
  { fin: "Paso 2 — Para identificar qué necesita aprender:",
    opts: ["Revisar qué nuevas funciones deberá utilizar y cuáles aún no conoce.", "Cerrar las sesiones abiertas en otros dispositivos.", "Revisar y actualizar el correo y el teléfono asociados a la cuenta.", "Cambiar el idioma de la aplicación."], correct: 0 },
  { fin: "Paso 3 — Para prepararse para utilizar el nuevo sistema:",
    opts: ["Crear una contraseña más larga y anotarla en un lugar visible.", "Entrar usando el navegador en modo privado.", "Seguir las instrucciones oficiales y practicar el nuevo método de acceso cuando esté disponible.", "Desactivar las notificaciones del servicio."], correct: 2 },
  { fin: "Paso 4 — Para comprobar que sabrá hacerlo cuando llegue el cambio:",
    opts: ["Esperar a que el cambio se aplique y resolver los problemas cuando aparezcan.", "Pedir a otra persona que entre por usted.", "Probar el nuevo ingreso en un entorno de demostración.", "Guardar una captura del aviso."], correct: 2 },
]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [sel, setSel] = useState<(number | null)[]>(Array(ETAPAS.length).fill(null))
  const pick = (r: number, o: number) => setSel(p => { const n = [...p]; n[r] = o; return n })

  const handleNext = async () => {
    const ok = ETAPAS.reduce((a, e, i) => a + (sel[i] === e.correct ? 1 : 0), 0)
    const point: 0 | 1 = ok >= 3 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-4/intermedio/ej3")
  }

  return (
    <ExerciseShell
      label="| 5.4 Identificar y abordar necesidades de competencia digital · Nivel Intermedio"
      index={2} total={3}
      title="Armar un plan ante un cambio de acceso"
      instruction={'Elegir una opción en cada etapa (plan paso a paso).\n\nSituación: usa con frecuencia un servicio digital para trámites importantes. El sistema anuncia que el próximo mes cambiará el proceso de ingreso y requerirá un nuevo método de verificación. Arme su plan: en cada paso se indica para qué sirve; elija la acción que lo cumple.'}
      onNext={handleNext} nextDisabled={sel.some(s => s === null)}
    >
      <p className="text-xs text-gray-500 mb-3" aria-live="polite">{sel.filter(s => s !== null).length} de {ETAPAS.length} pasos respondidos</p>
      <div className="space-y-5">
        {ETAPAS.map((e, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">{e.fin}</p>
            <div className="space-y-2" role="radiogroup" aria-label={e.fin}>
              {e.opts.map((o, j) => (
                <Choice key={j} variant="radio" letter={String.fromCharCode(65 + j)} selected={sel[i] === j} onClick={() => pick(i, j)}>{o}</Choice>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ExerciseShell>
  )
}
