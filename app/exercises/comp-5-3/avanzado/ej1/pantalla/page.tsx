"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Share2, DollarSign, Table, MessageCircle, Palette, Mail, Check, ChevronDown, X } from "lucide-react"
import FullScreenShell from "@/components/FullScreenShell"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.3"
const PREFIX = "session:5.3:Avanzado"

const DIMS = [
  { id: "difusion", label: "Difusión" },
  { id: "recaudacion", label: "Recaudación" },
  { id: "transparencia", label: "Transparencia" },
  { id: "comunicacion", label: "Comunicación" },
]
type Action = { id: string; label: string; dim: string; bad?: boolean }
type Tool = { id: string; name: string; icon: any; actions: Action[] }
const TOOLS: Tool[] = [
  { id: "redes", name: "Redes sociales", icon: Share2, actions: [
    { id: "conv", label: "Publicar una convocatoria general de la campaña, sin revelar datos médicos.", dim: "difusion" },
    { id: "detalle", label: "Publicar la historia clínica detallada para generar más empatía.", dim: "difusion", bad: true },
  ] },
  { id: "recauda", name: "Plataforma de recaudación", icon: DollarSign, actions: [
    { id: "crear", label: "Crear una campaña de recaudación en línea con meta y una descripción respetuosa.", dim: "recaudacion" },
  ] },
  { id: "planilla", name: "Planilla de cálculo", icon: Table, actions: [
    { id: "registro", label: "Llevar un registro compartido y transparente de lo recaudado.", dim: "transparencia" },
  ] },
  { id: "mensajeria", name: "Mensajería grupal", icon: MessageCircle, actions: [
    { id: "coord", label: "Coordinar al equipo y mantener informada a la beneficiaria.", dim: "comunicacion" },
  ] },
  { id: "diseno", name: "App de diseño", icon: Palette, actions: [
    { id: "afiche", label: "Diseñar un afiche atractivo para difundir la campaña.", dim: "difusion" },
  ] },
  { id: "correo", name: "Correo electrónico", icon: Mail, actions: [
    { id: "boletin", label: "Enviar un boletín a contactos externos para ampliar el alcance.", dim: "difusion" },
  ] },
]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [open, setOpen] = useState<string | null>(null)
  const [chosen, setChosen] = useState<Record<string, string>>({})

  const pick = (toolId: string, actionId: string) => setChosen(p => {
    const n = { ...p }
    if (n[toolId] === actionId) delete n[toolId]
    else n[toolId] = actionId
    return n
  })

  const actionOf = (t: Tool) => t.actions.find(a => a.id === chosen[t.id])
  const usedTools = TOOLS.filter(t => chosen[t.id])
  const coveredDims = new Set(usedTools.map(t => actionOf(t)!.dim))
  const violation = usedTools.some(t => actionOf(t)!.bad)

  const handleNext = async () => {
    const variety = usedTools.length >= 4 ? 1 : 0
    const ethics = violation ? 0 : 1
    const coverage = DIMS.every(d => coveredDims.has(d.id)) ? 1 : 0
    const point: 0 | 1 = variety + ethics + coverage >= 2 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 1, point)
    await mark(0, point === 1)
    router.push("/exercises/comp-5-3/avanzado/ej2/pantalla")
  }

  return (
    <FullScreenShell
      label="| 5.3 Uso creativo de las tecnologías digitales · Nivel Avanzado"
      index={1} total={3}
      title="Estrategia digital de una campaña solidaria"
      instruction={'Unos colegas quieren organizar una campaña para apoyar a una compañera con un tratamiento costoso. Ella consintió la campaña, pero pidió no publicar detalles de su diagnóstico. Use las herramientas del computador y ejecute al menos 4 acciones, cada una con una función distinta, cubriendo difusión, recaudación, transparencia y comunicación. Para cada herramienta, abra y elija una acción.'}
      onNext={handleNext}
    >
      {/* Barra de progreso de dimensiones */}
      <div className="max-w-3xl mx-auto mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-xs text-gray-500">Herramientas usadas: <b className="text-gray-800">{usedTools.length}</b></span>
        <span className="text-xs text-gray-400">|</span>
        {DIMS.map(d => (
          <span key={d.id} className={`text-xs flex items-center gap-1 ${coveredDims.has(d.id) ? "text-[#286575] font-medium" : "text-gray-400"}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${coveredDims.has(d.id) ? "bg-[#286575]" : "bg-gray-300"}`} />{d.label}
          </span>
        ))}
      </div>

      {/* Escritorio */}
      <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-3">
        {TOOLS.map(t => {
          const act = actionOf(t)
          const Icon = t.icon
          return (
            <button key={t.id} type="button" onClick={() => setOpen(t.id)}
              className={`w-full flex items-center gap-3 p-4 text-left rounded-2xl border bg-white transition hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#286575] ${act ? "border-[#286575] ring-1 ring-[#286575]/30" : "border-gray-200"}`}>
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act ? "bg-[#286575] text-white" : "bg-gray-100 text-[#286575]"}`}><Icon className="w-5 h-5" /></span>
              <span className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800 block">{t.name}</span>
                <span className="text-xs text-gray-400 block truncate">{act ? act.label : "Abrir para elegir una acción"}</span>
              </span>
              {act ? <Check className="w-5 h-5 text-[#286575] shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>
          )
        })}
      </div>

      {open && (() => {
        const t = TOOLS.find(x => x.id === open)!
        const Icon = t.icon
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(null)}>
            <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 text-gray-800 font-semibold"><span className="w-8 h-8 rounded-lg bg-[#e8f3f4] text-[#286575] flex items-center justify-center"><Icon className="w-4 h-4" /></span>{t.name}</span>
                <button onClick={() => setOpen(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-gray-400 mb-3">Elija una acción. Tóquela de nuevo para quitarla.</p>
              <div className="space-y-2">
                {t.actions.map(a => {
                  const sel = chosen[t.id] === a.id
                  return (
                    <button key={a.id} type="button" onClick={() => pick(t.id, a.id)}
                      className={`w-full text-left p-3 rounded-xl border text-sm transition flex items-start gap-2 ${sel ? "bg-[#e8f3f4] border-[#286575]" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
                      <span className={`mt-0.5 w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${sel ? "bg-[#286575] border-[#286575]" : "border-gray-300"}`}>{sel && <Check className="w-3 h-3 text-white" />}</span>
                      <span className="text-gray-700">{a.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}
    </FullScreenShell>
  )
}
