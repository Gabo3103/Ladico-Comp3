"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Mic, Video, MessageSquare, Settings2, PhoneOff, Users, Check, X, Type, Languages, Smartphone, Image as ImageIcon, Volume2, Bell, Camera, Smile , Lock } from "lucide-react"
import FullScreenShell from "@/components/FullScreenShell"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"
import { shuffle } from "@/lib/shuffle"

const COMPETENCE = "5.2"
const PREFIX = "session:5.2:Avanzado"

type Opt = { id: string; label: string; hint: string; icon: any; pertinent: boolean }
type App = { key: string; kind: "reunion" | "mensajeria"; color: string; sub: string; menu: Opt[] }

// Cada app muestra SOLO las opciones que realmente ofrece. Las pertinentes para
// dificultad auditiva son las que deben activarse; las otras son reales pero no aplican.
const APPS: App[] = [
  { key: "Microsoft Teams", kind: "reunion", color: "#4b53bc", sub: "Reunión de trabajo", menu: [
    { id: "subtitulos", label: "Subtítulos en vivo", hint: "Texto de lo que se habla", icon: Type, pertinent: true },
    { id: "transcripcion", label: "Transcripción en vivo", hint: "Registro escrito de la reunión", icon: Languages, pertinent: true },
    { id: "chat", label: "Chat de la reunión", hint: "Mensajes escritos", icon: MessageSquare, pertinent: true },
    { id: "fondo", label: "Fondo virtual", hint: "Reemplaza el fondo de la cámara", icon: ImageIcon, pertinent: false },
    { id: "ruido", label: "Cancelación de ruido", hint: "Reduce ruidos del ambiente", icon: Volume2, pertinent: false },
  ] },
  { key: "Google Meet", kind: "reunion", color: "#00897b", sub: "Videollamada", menu: [
    { id: "subtitulos", label: "Subtítulos en vivo", hint: "Texto de lo que se habla", icon: Type, pertinent: true },
    { id: "transcripcion", label: "Transcripción", hint: "Registro escrito de la llamada", icon: Languages, pertinent: true },
    { id: "chat", label: "Chat", hint: "Mensajes escritos", icon: MessageSquare, pertinent: true },
    { id: "fondo", label: "Efectos de fondo", hint: "Cambia o difumina el fondo", icon: ImageIcon, pertinent: false },
    { id: "ruido", label: "Cancelación de ruido", hint: "Reduce ruidos del ambiente", icon: Volume2, pertinent: false },
  ] },
  { key: "Zoom", kind: "reunion", color: "#2d8cff", sub: "Reunión (el anfitrión habilita subtítulos)", menu: [
    { id: "subtitulos", label: "Subtítulos automáticos", hint: "Texto de lo que se habla", icon: Type, pertinent: true },
    { id: "transcripcion", label: "Transcripción en vivo", hint: "Registro escrito de la reunión", icon: Languages, pertinent: true },
    { id: "chat", label: "Chat", hint: "Mensajes escritos", icon: MessageSquare, pertinent: true },
    { id: "fondo", label: "Fondo virtual", hint: "Reemplaza el fondo de la cámara", icon: ImageIcon, pertinent: false },
    { id: "reacciones", label: "Reacciones", hint: "Emojis durante la llamada", icon: Smile, pertinent: false },
  ] },
  { key: "WhatsApp", kind: "mensajeria", color: "#25d366", sub: "Videollamada (sin subtítulos dentro de la app)", menu: [
    { id: "chat", label: "Abrir chat de texto", hint: "Escribir mensajes durante la llamada", icon: MessageSquare, pertinent: true },
    { id: "subsSistema", label: "Subtítulos del sistema del teléfono", hint: "Subtítulos del propio dispositivo, no de la app", icon: Smartphone, pertinent: true },
    { id: "camara", label: "Cambiar de cámara", hint: "Alterna cámara frontal y trasera", icon: Camera, pertinent: false },
    { id: "notif", label: "Notificaciones sonoras", hint: "Avisos con sonido", icon: Bell, pertinent: false },
  ] },
]

const TILES = [
  { name: "Dra. Rojas", bg: "from-indigo-400 to-indigo-600" },
  { name: "Carlos", bg: "from-teal-400 to-teal-600" },
  { name: "Tú", bg: "from-amber-400 to-orange-500" },
]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [app, setApp] = useState<App | null>(null)
  const [on, setOn] = useState<Set<string>>(new Set())
  const [menu, setMenu] = useState(false)

  useEffect(() => { setApp(APPS[Math.floor(Math.random() * APPS.length)]) }, [])
  const toggle = (id: string) => setOn(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  // Orden del menú de apoyos aleatorizado (selección por id, no afecta el puntaje).
  const menuView = useMemo(() => (app ? shuffle(app.menu) : []), [app])

  const handleNext = async () => {
    let point: 0 | 1 = 0
    if (app) {
      const pertinent = app.menu.filter(o => o.pertinent).map(o => o.id)
      const good = pertinent.filter(id => on.has(id)).length
      const bad = app.menu.filter(o => !o.pertinent && on.has(o.id)).length
      point = good === pertinent.length && bad === 0 ? 1 : 0
    }
    setPoint(COMPETENCE, "avanzado", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-2/avanzado/ej3/pantalla")
  }

  if (!app) return null
  const captionsOn = on.has("subtitulos") || on.has("subsSistema")

  return (
    <FullScreenShell
      selectionType="Active los apoyos"
      label="| 5.2 Identificación de necesidades y respuestas tecnológicas · Nivel Avanzado"
      index={2} total={3}
      title="Apoyar a una persona con dificultad auditiva en una videollamada"
      instruction={'Acompaña a una persona con dificultad auditiva en la videollamada que se muestra. Abra el menú de accesibilidad (botón Apoyos) y active los apoyos que esta app ofrece para que pueda seguir la conversación. Cada app ofrece cosas distintas: active solo lo pertinente y deje lo que no ayuda a escuchar.'}
      onNext={handleNext}
      onCheck={() => {
        const pertinent = app.menu.filter(o => o.pertinent).map(o => o.id)
        const good = pertinent.filter(id => on.has(id)).length
        const bad = app.menu.filter(o => !o.pertinent && on.has(o.id)).length
        return good === pertinent.length && bad === 0
      }}
      checkDisabled={false}
    >
      <div className="max-w-2xl mx-auto">
        {/* Barra de la app (según el estilo real de cada app) */}
        {app.kind === "mensajeria" ? (
          <div className="rounded-t-2xl px-4 py-2.5 bg-gray-900 text-white flex items-center justify-between">
            <span className="text-sm font-medium">{app.key}</span>
            <span className="text-[11px] text-white/70 flex items-center gap-1"><Lock className="w-3 h-3" /> Cifrado de extremo a extremo</span>
          </div>
        ) : (
          <div className="rounded-t-2xl px-4 py-2.5 text-white flex items-center justify-between" style={{ backgroundColor: app.color }}>
            <span className="font-semibold text-sm">{app.key}</span>
            <span className="text-xs text-white/85 flex items-center gap-3"><span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 3</span><span>{app.sub}</span></span>
          </div>
        )}

        {/* Área de videollamada */}
        <div className="relative bg-gray-900 h-[360px] overflow-hidden">
          <div className="grid grid-cols-3 gap-1 p-1 h-full">
            {TILES.map((t, i) => (
              <div key={i} className={`relative rounded-lg bg-gradient-to-br ${t.bg} flex items-center justify-center`}>
                <span className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center text-white text-lg font-semibold">{t.name[0]}</span>
                <span className="absolute bottom-1.5 left-1.5 text-[11px] text-white bg-black/40 rounded px-1.5 py-0.5">{t.name}</span>
              </div>
            ))}
          </div>

          {/* Overlay de subtítulos (realista, no indica acierto) */}
          {captionsOn && (
            <div className="absolute bottom-3 inset-x-3 bg-black/70 text-white text-sm rounded-lg px-3 py-2 text-center">
              Dra. Rojas: …entonces revisamos los resultados la próxima semana…
            </div>
          )}

          {/* Menú de accesibilidad */}
          {menu && (
            <div className="absolute inset-x-2 bottom-2 top-2 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ backgroundColor: app.color, color: "white" }}>
                <span className="text-sm font-semibold">Accesibilidad y apoyos</span>
                <button onClick={() => setMenu(false)}><X className="w-4 h-4" /></button>
              </div>
              <div className="divide-y overflow-y-auto">
                {menuView.map(o => {
                  const active = on.has(o.id)
                  const Icon = o.icon
                  return (
                    <button key={o.id} type="button" onClick={() => toggle(o.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50">
                      <Icon className="w-5 h-5 text-gray-500 shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="text-sm text-gray-800 flex items-center gap-1">{active && <Check className="w-3.5 h-3.5 text-[#286575]" />}{o.label}</span>
                        <span className="block text-xs text-gray-400">{o.hint}</span>
                      </span>
                      <span className={`w-10 h-5.5 rounded-full relative transition shrink-0 ${active ? "bg-[#286575]" : "bg-gray-300"}`} style={{ height: "22px", width: "40px" }}>
                        <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition ${active ? "right-0.5" : "left-0.5"}`} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Barra de controles */}
        <div className="rounded-b-2xl bg-gray-800 px-4 py-3 flex items-center justify-center gap-3">
          <span className="w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center"><Mic className="w-5 h-5" /></span>
          <span className="w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center"><Video className="w-5 h-5" /></span>
          <button onClick={() => setMenu(m => !m)}
            className={`h-10 px-4 rounded-full flex items-center gap-2 text-sm font-medium transition ${menu ? "bg-[#286575] text-white" : "bg-white/15 text-white hover:bg-white/25"}`}>
            <Settings2 className="w-5 h-5" /> Apoyos
          </button>
          <span className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center"><PhoneOff className="w-5 h-5" /></span>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">Apoyos activados: {on.size} · Abra “Apoyos” para configurar</p>
    </FullScreenShell>
  )
}
