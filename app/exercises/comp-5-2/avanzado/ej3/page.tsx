"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import ExerciseShell from "@/components/ExerciseShell"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.2"
const PREFIX = "session:5.2:Avanzado"

const OPTS: { id: string; label: string; hint: string; support: boolean }[] = [
  { id: "guia", label: "Guía paso a paso", hint: "Explica cada etapa de la solicitud", support: true },
  { id: "autocompletar", label: "Autocompletar datos sin pedir confirmación", hint: "Rellena campos automáticamente sin avisar", support: false },
  { id: "autosave", label: "Guardado automático del avance", hint: "Conserva lo escrito si algo falla", support: true },
  { id: "notifPromo", label: "Notificaciones promocionales", hint: "Avisos de ofertas durante el trámite", support: false },
  { id: "avisos", label: "Avisos de campos faltantes antes de enviar", hint: "Advierte si falta información", support: true },
  { id: "cerrarPestana", label: "Cerrar la solicitud al cambiar de pestaña", hint: "Descarta el avance si sale de la página", support: false },
  { id: "resumen", label: "Resumen previo antes de confirmar", hint: "Muestra todo antes del envío final", support: true },
  { id: "copiaExterna", label: "Enviar una copia a un contacto externo", hint: "Comparte los datos con un tercero", support: false },
  { id: "sesion30", label: "Mantener la sesión activa 30 minutos", hint: "Da tiempo suficiente para completar", support: true },
  { id: "comprobante", label: "Comprobante por correo al finalizar", hint: "Envía respaldo de lo realizado", support: true },
]
const DEFAULT_ON = new Set(["autocompletar", "notifPromo"])

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [on, setOn] = useState<Set<string>>(new Set(DEFAULT_ON))
  const toggle = (id: string) => setOn(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleNext = async () => {
    const supportsOn = OPTS.filter(o => o.support && on.has(o.id)).length
    const riskyOn = OPTS.filter(o => !o.support && on.has(o.id)).length
    const point: 0 | 1 = riskyOn === 0 && supportsOn >= 5 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 3, point)
    await mark(2, point === 1)
    const prog = getProgress(COMPETENCE, "avanzado")
    const qs = new URLSearchParams({
      score: String(Math.round((levelPoints(prog) / 3) * 100)),
      passed: String(isLevelPassed(prog)), correct: String(levelPoints(prog)), total: "3",
      competence: COMPETENCE, level: "avanzado",
      q1: String(getPoint(prog, 1)), q2: String(getPoint(prog, 2)), q3: String(getPoint(prog, 3)),
      sid: sessionId ?? "",
    })
    router.push(`/test/comp-5-2-advanced/results?${qs.toString()}`)
  }

  return (
    <ExerciseShell
      label="| 5.2 Identificación de necesidades y respuestas tecnológicas · Nivel Avanzado"
      index={3} total={3}
      title="Ajustar el panel de apoyo de una solicitud en línea"
      instruction={'Configurar el panel (activar o desactivar cada opción).\n\nSituación: una persona con poca experiencia debe completar una solicitud de varios pasos y teme perder su avance. Ajuste el panel: active los apoyos que la protegen y desactive las opciones riesgosas. Algunas opciones ya vienen activadas.'}
      onNext={handleNext} nextLabel="Finalizar"
    >
      <div className="max-w-2xl mx-auto rounded-2xl border-2 border-gray-300 bg-white overflow-hidden shadow-lg">
        <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-2">
          <span className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" /></span>
          <div className="flex-1 mx-2 bg-white rounded-full border px-3 py-0.5 flex items-center gap-1.5 text-[11px] text-gray-500"><Lock className="w-3 h-3 text-gray-400" /> tramites.gob/solicitud/ajustes</div>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-b text-sm font-semibold text-gray-700">Ajustes de apoyo de la solicitud</div>
        <div className="divide-y">
          {OPTS.map(o => {
            const active = on.has(o.id)
            return (
              <div key={o.id} className="flex items-center justify-between px-5 py-3 gap-3">
                <span className="min-w-0">
                  <span className="text-sm text-gray-800">{o.label}</span>
                  <span className="block text-xs text-gray-400">{o.hint}</span>
                </span>
                <button type="button" onClick={() => toggle(o.id)} className={`w-11 h-6 rounded-full relative transition shrink-0 ${active ? "bg-[#286575]" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${active ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </ExerciseShell>
  )
}
