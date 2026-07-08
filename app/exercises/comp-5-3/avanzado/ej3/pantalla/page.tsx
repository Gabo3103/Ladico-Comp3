"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, Palette, Table, MessageCircle, Calendar, Share2, Check, ChevronDown, X } from "lucide-react"
import FullScreenShell from "@/components/FullScreenShell"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.3"
const PREFIX = "session:5.3:Avanzado"

const DIMS = [
  { id: "presencia", label: "Presencia digital" },
  { id: "visual", label: "Material visual" },
  { id: "gestion", label: "Gestión de pedidos" },
  { id: "comunicacion", label: "Comunicación" },
]
type Action = { id: string; label: string; dim: string; bad?: boolean }
type Tool = { id: string; name: string; icon: any; actions: Action[] }
const TOOLS: Tool[] = [
  { id: "ventas", name: "Tienda / venta en línea", icon: ShoppingBag, actions: [
    { id: "perfil", label: "Crear un perfil de negocio gratuito para mostrar los productos.", dim: "presencia" },
    { id: "app", label: "Encargar el desarrollo de una aplicación de venta a medida.", dim: "presencia", bad: true },
  ] },
  { id: "diseno", name: "App de diseño (tipo Canva)", icon: Palette, actions: [
    { id: "fotos", label: "Preparar fotos y descripciones atractivas de los productos.", dim: "visual" },
  ] },
  { id: "planilla", name: "Planilla de cálculo", icon: Table, actions: [
    { id: "inv", label: "Llevar el control de costos, inventario y pedidos.", dim: "gestion" },
  ] },
  { id: "mensajeria", name: "Mensajería (WhatsApp)", icon: MessageCircle, actions: [
    { id: "clientes", label: "Atender consultas y coordinar entregas con los clientes.", dim: "comunicacion" },
  ] },
  { id: "calendario", name: "Calendario / agenda", icon: Calendar, actions: [
    { id: "despacho", label: "Agendar y coordinar los días de despacho.", dim: "gestion" },
  ] },
  { id: "redes", name: "Redes sociales", icon: Share2, actions: [
    { id: "perfilRed", label: "Crear un perfil de negocio en una red social para mostrar los productos.", dim: "presencia" },
  ] },
]

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [open, setOpen] = useState<string | null>(null)
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const pick = (t: string, a: string) => setChosen(p => {
    const n = { ...p }
    if (n[t] === a) delete n[t]
    else n[t] = a
    return n
  })

  const actionOf = (t: Tool) => t.actions.find(a => a.id === chosen[t.id])
  const usedTools = TOOLS.filter(t => chosen[t.id])
  const coveredDims = new Set(usedTools.map(t => actionOf(t)!.dim))
  const notSustainable = usedTools.some(t => actionOf(t)!.bad)

  const handleNext = async () => {
    const variety = usedTools.length >= 4 ? 1 : 0
    const sustain = notSustainable ? 0 : 1
    const coverage = DIMS.every(d => coveredDims.has(d.id)) ? 1 : 0
    const point: 0 | 1 = variety + sustain + coverage >= 2 ? 1 : 0
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
    router.push(`/test/comp-5-3-advanced/results?${qs.toString()}`)
  }

  return (
    <FullScreenShell
      label="| 5.3 Uso creativo de las tecnologías digitales · Nivel Avanzado"
      index={3} total={3}
      title="Estrategia digital para vender en línea"
      instruction={'Su vecina es artesana del cuero y solo vende en ferias los fines de semana. Quiere empezar a vender por Internet, invirtiendo lo mínimo y con una solución que pueda mantener sola. Use las herramientas del computador y ejecute al menos 4 acciones, cada una con una función distinta, cubriendo presencia digital, material visual, gestión de pedidos y comunicación. Para cada herramienta, abra y elija una acción.'}
      onNext={handleNext} nextLabel="Finalizar"
    >
      <div className="max-w-3xl mx-auto mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-xs text-gray-500">Herramientas usadas: <b className="text-gray-800">{usedTools.length}</b></span>
        <span className="text-xs text-gray-400">|</span>
        {DIMS.map(d => (
          <span key={d.id} className={`text-xs flex items-center gap-1 ${coveredDims.has(d.id) ? "text-[#286575] font-medium" : "text-gray-400"}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${coveredDims.has(d.id) ? "bg-[#286575]" : "bg-gray-300"}`} />{d.label}
          </span>
        ))}
      </div>

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
