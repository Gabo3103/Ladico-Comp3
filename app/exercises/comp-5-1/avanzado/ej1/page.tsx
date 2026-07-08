"use client"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Settings, ChevronLeft, HardDrive, Trash2, Image as ImageIcon, MessageCircle, Gamepad2, Film, Wifi, Signal, BatteryFull, X } from "lucide-react"
import ExerciseShell from "@/components/ExerciseShell"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.1"
const PREFIX = "session:5.1:Avanzado"
const NEED_GB = 5
const CAP = 32

type AppId = "juego" | "videos" | "whatsapp" | "fotos" | "camara"
type App = { id: AppId; name: string; size: number; use: string; system?: boolean; keep?: boolean; icon: any }
const APPS: App[] = [
  { id: "juego", name: "Juego 3D Pro", size: 4.2, use: "hace 3 meses", icon: Gamepad2 },
  { id: "videos", name: "Videos guardados", size: 3.1, use: "hace 2 meses", icon: Film },
  { id: "whatsapp", name: "WhatsApp", size: 1.8, use: "hoy", keep: true, icon: MessageCircle },
  { id: "fotos", name: "Fotos del viaje", size: 0.9, use: "ayer", keep: true, icon: ImageIcon },
  { id: "camara", name: "Cámara", size: 0.12, use: "hoy", system: true, keep: true, icon: Camera },
]
const PHOTOS = ["from-amber-300 to-rose-300", "from-sky-300 to-indigo-300", "from-emerald-300 to-teal-300", "from-fuchsia-300 to-purple-300", "from-orange-300 to-red-300", "from-lime-300 to-green-300"]
type Screen = "home" | "camera" | "settings" | "storage" | "fotos" | "whatsapp" | "app"

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [screen, setScreen] = useState<Screen>("home")
  const [openApp, setOpenApp] = useState<AppId | null>(null)
  const [removed, setRemoved] = useState<Set<AppId>>(new Set())

  const other = 4.9
  const used = useMemo(() => other + APPS.filter(a => !removed.has(a.id)).reduce((s, a) => s + a.size, 0), [removed])
  const freed = useMemo(() => APPS.filter(a => removed.has(a.id)).reduce((s, a) => s + a.size, 0), [removed])
  const cameraOk = freed >= NEED_GB
  const removedWrong = APPS.some(a => a.keep && removed.has(a.id))
  const uninstall = (id: AppId) => setRemoved(prev => new Set(prev).add(id))

  const handleNext = async () => {
    const point: 0 | 1 = cameraOk && !removedWrong ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 1, point)
    await mark(0, point === 1)
    router.push("/exercises/comp-5-1/avanzado/ej2")
  }

  const homeApps = APPS.filter(a => !removed.has(a.id))
  const Bar = ({ t, back }: { t: string; back?: () => void }) => (
    <div className="flex items-center gap-2 bg-[#286575] text-white px-4 py-3 text-base font-medium">{back && <button onClick={back}><ChevronLeft className="w-6 h-6" /></button>}{t}</div>
  )

  return (
    <ExerciseShell
      label="| 5.1 Identificar y resolver problemas técnicos · Nivel Avanzado"
      index={1} total={3}
      title="Liberar almacenamiento para usar la cámara"
      instruction={'Caso práctico con entorno interactivo.\n\nSituación: Un familiar le pide tomarle una fotografía para un trámite urgente. Al abrir la cámara aparece un problema. Use el teléfono como lo haría normalmente, resuélvalo y tome la foto. Cuando termine, presione Siguiente.'}
      onNext={handleNext}
      nextDisabled={!cameraOk || removedWrong}
    >
      <div className="mx-auto w-full max-w-[360px] rounded-[2.6rem] border-[10px] border-gray-900 bg-black overflow-hidden shadow-2xl">
        <div className="bg-gray-900 text-white flex items-center justify-between px-6 py-1.5 text-xs">
          <span>9:41</span>
          <span className="flex items-center gap-1"><Signal className="w-3.5 h-3.5" /><Wifi className="w-3.5 h-3.5" /><BatteryFull className="w-4 h-4" /></span>
        </div>
        <div className="h-[480px] overflow-y-auto bg-gradient-to-b from-[#dfeaf0] to-[#eef3f6]">
          {screen === "home" && (
            <div className="p-6">
              <div className="grid grid-cols-4 gap-5 mt-2">
                <HomeIcon label="Cámara" icon={Camera} onClick={() => setScreen("camera")} />
                <HomeIcon label="Ajustes" icon={Settings} onClick={() => setScreen("settings")} />
                <HomeIcon label="Fotos" icon={ImageIcon} onClick={() => setScreen("fotos")} />
                {homeApps.filter(a => !a.system).map(a => (
                  <HomeIcon key={a.id} label={a.name.split(" ")[0]} icon={a.icon}
                    onClick={() => a.id === "whatsapp" ? setScreen("whatsapp") : (setOpenApp(a.id), setScreen("app"))} />
                ))}
              </div>
            </div>
          )}
          {screen === "camera" && (
            <div>
              <Bar t="Cámara" back={() => setScreen("home")} />
              <div className="flex flex-col items-center justify-center h-[432px] p-6 text-center bg-black text-white">
                {cameraOk ? (<><Camera className="w-16 h-16 mb-4 text-white" /><p className="text-base">Foto tomada.</p></>) : (
                  <><div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4"><X className="w-8 h-8 text-red-400" /></div>
                    <p className="text-base">No se puede iniciar la cámara.</p><p className="text-sm text-white/70 mt-1">Espacio de almacenamiento insuficiente.</p></>)}
              </div>
            </div>
          )}
          {screen === "settings" && (
            <div>
              <Bar t="Ajustes" back={() => setScreen("home")} />
              {["Conexiones", "Pantalla", "Sonido y vibración", "Batería"].map(s => (
                <div key={s} className="px-4 py-4 border-b bg-white text-base text-gray-700">{s}</div>
              ))}
              <button onClick={() => setScreen("storage")} className="w-full flex items-center gap-3 px-4 py-4 border-b bg-white hover:bg-gray-50 text-base text-gray-800">
                <HardDrive className="w-5 h-5 text-[#286575]" /> Almacenamiento
              </button>
              {["Aplicaciones", "Seguridad"].map(s => (<div key={s} className="px-4 py-4 border-b bg-white text-base text-gray-700">{s}</div>))}
            </div>
          )}
          {screen === "storage" && (
            <div>
              <Bar t="Almacenamiento" back={() => setScreen("settings")} />
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Usado {used.toFixed(1)} GB de {CAP} GB</div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4"><div className="h-full bg-[#286575]" style={{ width: `${(used / CAP) * 100}%` }} /></div>
                <ul className="space-y-2">
                  {APPS.filter(a => !removed.has(a.id)).map(a => (
                    <li key={a.id} className="flex items-center gap-3 bg-white rounded-xl border p-3 text-sm">
                      <a.icon className="w-6 h-6 text-gray-500" />
                      <div className="flex-1"><div className="font-medium text-gray-800">{a.name}</div><div className="text-gray-500 text-xs">{a.size} GB · último uso: {a.use}</div></div>
                      {!a.system ? <button onClick={() => uninstall(a.id)} className="flex items-center gap-1 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 text-sm"><Trash2 className="w-4 h-4" /> Desinstalar</button> : <span className="text-gray-400 text-xs">Sistema</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {screen === "fotos" && (
            <div>
              <Bar t="Fotos" back={() => setScreen("home")} />
              <div className="p-2 grid grid-cols-3 gap-2">{PHOTOS.map((g, i) => (<div key={i} className={`aspect-square rounded-lg bg-gradient-to-br ${g}`} />))}</div>
            </div>
          )}
          {screen === "whatsapp" && (
            <div>
              <Bar t="WhatsApp" back={() => setScreen("home")} />
              {[["Familia", "Nos vemos el domingo"], ["Trabajo", "Envié el informe"], ["Hermana", "Te llamo luego"]].map(([n, m], i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b bg-white"><div className="w-10 h-10 rounded-full bg-[#286575]/20 flex items-center justify-center text-[#286575]">{(n as string)[0]}</div><div className="text-sm"><div className="font-medium text-gray-800">{n}</div><div className="text-gray-500 text-xs">{m}</div></div></div>
              ))}
            </div>
          )}
          {screen === "app" && openApp && (
            <div>
              <Bar t={APPS.find(a => a.id === openApp)?.name ?? ""} back={() => setScreen("home")} />
              <div className="flex flex-col items-center justify-center h-[432px] text-gray-400 text-sm">Cargando…</div>
            </div>
          )}
        </div>
      </div>
    </ExerciseShell>
  )
}

function HomeIcon({ label, icon: Icon, onClick }: { label: string; icon: any; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 text-gray-700">
      <span className="w-16 h-16 rounded-[1.1rem] bg-white border shadow-sm flex items-center justify-center text-[#286575]"><Icon className="w-8 h-8" /></span>
      <span className="text-[11px] text-center leading-tight">{label}</span>
    </button>
  )
}
