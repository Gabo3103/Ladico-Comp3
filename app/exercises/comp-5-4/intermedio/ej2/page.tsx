"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"
import { CalendarDays, RefreshCw, ShieldCheck } from "lucide-react"

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

function UpdateNoticePreview() {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        <div className="bg-gray-100 border-b px-3 py-2 flex items-center gap-2">
          <span className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" /></span>
          <span className="flex-1 rounded-full bg-white border px-3 py-1 text-[11px] text-gray-500">servicio-digital.cl/actualizacion</span>
        </div>
        <div className="p-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-xl bg-white text-[#286575] flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Aviso de actualización del servicio</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Desde el próximo mes, el ingreso a la cuenta tendrá una etapa adicional.
                  Revise sus datos de recuperación y prepare una opción alternativa de confirmación.
                  El cambio será gradual.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-700">
                  <span className="rounded-full bg-white border px-2.5 py-1 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-[#286575]" /> Próximo mes</span>
                  <span className="rounded-full bg-white border px-2.5 py-1 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#286575]" /> Verificación nueva</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">Imagen de referencia: aviso oficial de cambio de acceso.</p>
    </div>
  )
}

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
      instruction={'Elegir una opción en cada etapa (plan paso a paso).\n\nSituación: Usted utiliza este servicio digital con frecuencia para realizar trámites importantes. El sistema anuncia que el proceso de ingreso cambiará el próximo mes y que será necesario utilizar un nuevo método de verificación. Desea prepararse con anticipación para seguir utilizando el servicio sin dificultades. Ordene las siguientes acciones desde la primera hasta la última.'}
      onNext={handleNext} nextDisabled={sel.some(s => s === null)}
    >
      <UpdateNoticePreview />
      <p className="text-xs text-gray-500 mb-3" aria-live="polite">{sel.filter(s => s !== null).length} de {ETAPAS.length} pasos respondidos</p>
      <div className="space-y-5">
        {ETAPAS.map((e, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-[13px] font-semibold text-gray-800 mb-2.5">{e.fin}</p>
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
