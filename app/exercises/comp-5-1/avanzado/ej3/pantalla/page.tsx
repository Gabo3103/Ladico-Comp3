"use client"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Smartphone, Tv, Router as RouterIcon, Settings, Wifi, WifiOff, Check, ChevronLeft, Cast, Image as ImageIcon, MessageCircle, Bluetooth, Plane, Signal, ChevronRight, Sun, Volume2, BatteryCharging, HardDrive, Grid3x3 } from "lucide-react"
import FullScreenShell from "@/components/FullScreenShell"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"
import { shuffle } from "@/lib/shuffle"

const COMPETENCE = "5.1"
const PREFIX = "session:5.1:Avanzado"
type PScreen = "home" | "ajustes" | "conexiones" | "wifi" | "cast" | "fotos" | "mensajes" | "pantalla" | "sonido" | "bateria" | "almacen" | "apps"
const NETS = ["MiRedCasa", "MiRedCasa_5G", "Vecino_2.4G"]
const PHOTOS = ["from-amber-300 to-rose-300", "from-sky-300 to-indigo-300", "from-emerald-300 to-teal-300", "from-fuchsia-300 to-purple-300", "from-orange-300 to-red-300", "from-lime-300 to-green-300"]

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [ps, setPs] = useState<PScreen>("home")
  const [wifiOn, setWifiOn] = useState(false)
  const [data, setData] = useState(true)
  const [bt, setBt] = useState(false)
  const [air, setAir] = useState(false)
  const [dark, setDark] = useState(false)
  const [net, setNet] = useState<string | null>(null)
  const [transmitted, setTransmitted] = useState(false)

  const toggleWifi = () => setWifiOn(v => { if (v) { setNet(null); setTransmitted(false) } return !v })
  const connect = (n: string) => { setNet(n); if (n !== "MiRedCasa") setTransmitted(false) }
  // Orden de redes WiFi aleatorizado (selección por nombre).
  const netsView = useMemo(() => shuffle(NETS), [])
  const doCast = () => { if (net === "MiRedCasa") setTransmitted(true) }

  const handleNext = async () => {
    const point: 0 | 1 = transmitted ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 3, point); await mark(2, point === 1)
    const prog = getProgress(COMPETENCE, "avanzado")
    const qs = new URLSearchParams({ score: String(Math.round((levelPoints(prog) / 3) * 100)), passed: String(isLevelPassed(prog)), correct: String(levelPoints(prog)), total: "3", competence: COMPETENCE, level: "avanzado", q1: String(getPoint(prog, 1)), q2: String(getPoint(prog, 2)), q3: String(getPoint(prog, 3)), sid: sessionId ?? "" })
    router.push(`/test/comp-5-1-advanced/results?${qs.toString()}`)
  }

  const Bar = ({ t, back }: { t: string; back?: () => void }) => (<div className="flex items-center gap-2 bg-[#286575] text-white px-3 py-2 text-sm font-medium">{back && <button onClick={back}><ChevronLeft className="w-5 h-5" /></button>}{t}</div>)
  const Toggle = ({ on, set }: { on: boolean; set: () => void }) => (<button onClick={set} className={`w-11 h-6 rounded-full relative transition ${on ? "bg-[#286575]" : "bg-gray-300"}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${on ? "right-0.5" : "left-0.5"}`} /></button>)
  const SetRow = ({ icon: Icon, label, right, onClick }: any) => (<button onClick={onClick} className="w-full flex items-center justify-between px-3 py-3 border-b bg-white hover:bg-gray-50 text-sm"><span className="flex items-center gap-2"><Icon className="w-5 h-5 text-[#286575]" />{label}</span><span className="flex items-center gap-1 text-xs text-gray-400">{right}<ChevronRight className="w-4 h-4" /></span></button>)
  const ToggleRow = ({ icon: Icon, label, on, set }: any) => (<div className="flex items-center justify-between px-3 py-3 border-b bg-white text-sm"><span className="flex items-center gap-2"><Icon className={`w-5 h-5 ${on ? "text-[#286575]" : "text-gray-400"}`} />{label}</span><Toggle on={on} set={set} /></div>)

  const InfoCard = ({ title, screen, note }: { title: string; screen: React.ReactNode; note: string }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-3">
      <div className="rounded-xl overflow-hidden mb-2">{screen}</div>
      <div className="text-sm font-semibold text-gray-800">{title}</div>
      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{note}</p>
    </div>
  )

  return (
    <FullScreenShell
      label="| 5.1 Identificar y resolver problemas técnicos · Nivel Avanzado"
      index={3} total={3}
      title="Transmitir fotos a la Smart TV"
      instruction={'Quiere mostrar las fotos del viaje en la Smart TV, pero al abrir "Transmitir pantalla" en su celular aparece "No se encontraron televisores". La TV está encendida y lista para recibir. Revise en la tarjeta de la TV y del router a qué red WiFi están conectados; luego ajuste su celular para dejarlo en esa misma red y, cuando estén conectados, transmita las fotos a la TV.'}
      onNext={handleNext}
      onCheck={() => transmitted}
      checkDisabled={false}
      nextDisabled={!transmitted}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-4">
        <InfoCard title="Smart TV"
          screen={<div className={`h-28 bg-gray-900 border-4 flex flex-col items-center justify-center text-white/80 text-center px-3 ${transmitted ? "border-emerald-500" : "border-gray-800"}`}><Tv className="w-9 h-9" /><span className="text-[10px] mt-1 text-white/70">{transmitted ? "Conectado a su teléfono · transmitiendo fotos" : "No se encontraron dispositivos disponibles para transmitir"}</span><span className="text-[10px] mt-1 text-white/40">Red: MiRedCasa</span></div>}
          note='Encendida. Conectada a la red "MiRedCasa". Pantalla compartida activa: esperando un dispositivo en la misma red.' />
        <InfoCard title="Router WiFi"
          screen={<div className="h-28 bg-gray-100 border flex flex-col items-center justify-center text-[#286575]"><RouterIcon className="w-9 h-9" /><span className="text-[10px] mt-1 text-gray-500">2 redes activas</span></div>}
          note='Encendido. Emite "MiRedCasa" y "MiRedCasa_5G". Funcionando con normalidad.' />
        </div>

        <div className="flex justify-center lg:justify-end">
        <div className="mx-auto w-full max-w-[300px] rounded-[1.8rem] border-8 border-gray-800 bg-white overflow-hidden shadow-xl">
          <div className="bg-gray-800 h-4" />
          <div className="h-[420px] overflow-y-auto bg-[#eef3f6]">
            {ps === "home" && (<div className="p-5"><div className="text-xs text-gray-500 mb-4 text-center">Su celular · Pantalla de inicio</div><div className="grid grid-cols-3 gap-4">{[["Ajustes", Settings, () => setPs("ajustes")], ["Transmitir", Cast, () => setPs("cast")], ["Fotos", ImageIcon, () => setPs("fotos")], ["Mensajes", MessageCircle, () => setPs("mensajes")]].map(([l, I, f]: any, i) => (<button key={i} onClick={f} className="flex flex-col items-center gap-1 text-gray-700"><span className="w-14 h-14 rounded-2xl bg-white border shadow-sm flex items-center justify-center text-[#286575]"><I className="w-7 h-7" /></span><span className="text-[10px]">{l}</span></button>))}</div></div>)}
            {ps === "ajustes" && (<div><Bar t="Ajustes" back={() => setPs("home")} /><SetRow icon={Wifi} label="Conexiones" onClick={() => setPs("conexiones")} /><SetRow icon={Sun} label="Pantalla" onClick={() => setPs("pantalla")} /><SetRow icon={Volume2} label="Sonido y vibración" onClick={() => setPs("sonido")} /><SetRow icon={BatteryCharging} label="Batería" onClick={() => setPs("bateria")} /><SetRow icon={HardDrive} label="Almacenamiento" onClick={() => setPs("almacen")} /><SetRow icon={Grid3x3} label="Aplicaciones" onClick={() => setPs("apps")} /></div>)}
            {ps === "conexiones" && (<div><Bar t="Conexiones" back={() => setPs("ajustes")} /><SetRow icon={wifiOn ? Wifi : WifiOff} label="WiFi" right={wifiOn ? (net ?? "Activado") : "Desactivado"} onClick={() => setPs("wifi")} /><ToggleRow icon={Signal} label="Datos móviles" on={data} set={() => setData(v => !v)} /><ToggleRow icon={Bluetooth} label="Bluetooth" on={bt} set={() => setBt(v => !v)} /><ToggleRow icon={Plane} label="Modo avión" on={air} set={() => setAir(v => !v)} /></div>)}
            {ps === "wifi" && (<div><Bar t="WiFi" back={() => setPs("conexiones")} /><div className="p-3"><div className="flex items-center justify-between bg-white rounded-xl border p-3 mb-3"><span className="text-sm text-gray-700">WiFi</span><Toggle on={wifiOn} set={toggleWifi} /></div>{!wifiOn ? <p className="text-xs text-gray-500">WiFi desactivado · No conectado.</p> : (<ul className="space-y-2">{netsView.map(n => (<li key={n}><button onClick={() => connect(n)} className={`w-full flex items-center justify-between rounded-xl border p-2.5 text-sm ${net === n ? "border-[#286575] bg-[#e8f3f4]" : "bg-white hover:bg-gray-50"}`}><span className="flex items-center gap-2"><Wifi className="w-4 h-4 text-[#286575]" />{n}</span>{net === n && <Check className="w-4 h-4 text-emerald-600" />}</button></li>))}</ul>)}</div></div>)}
            {ps === "cast" && (<div><Bar t="Transmitir pantalla" back={() => setPs("home")} /><div className="p-4 text-center">{net === "MiRedCasa" ? (transmitted ? <p className="text-sm text-emerald-700">Transmitiendo a "Smart TV (sala)" ✓</p> : <button onClick={doCast} className="w-full rounded-xl border border-[#286575] bg-white hover:bg-[#e8f3f4] p-3 text-sm flex items-center justify-center gap-2"><Tv className="w-4 h-4 text-[#286575]" /> Smart TV (sala)</button>) : (<><p className="text-sm text-gray-500 mb-3">Buscando dispositivos… No se encontraron televisores.</p><button className="text-xs text-[#286575] underline">Buscar de nuevo</button></>)}</div></div>)}
            {ps === "fotos" && (<div><Bar t="Fotos" back={() => setPs("home")} /><div className="p-2 grid grid-cols-3 gap-2">{PHOTOS.map((g, i) => (<div key={i} className={`aspect-square rounded-lg bg-gradient-to-br ${g}`} />))}</div></div>)}
            {ps === "mensajes" && (<div><Bar t="Mensajes" back={() => setPs("home")} />{[["Familia", "Nos vemos el domingo"], ["Banco", "Su clave temporal es 4821"], ["Farmacia", "Su pedido está listo"]].map(([n, m], i) => (<div key={i} className="flex items-center gap-2 px-3 py-2.5 border-b bg-white"><div className="w-8 h-8 rounded-full bg-[#286575]/20 flex items-center justify-center text-[#286575] text-xs">{(n as string)[0]}</div><div className="text-xs"><div className="font-medium text-gray-800">{n}</div><div className="text-gray-500">{m}</div></div></div>))}</div>)}
            {ps === "pantalla" && (<div><Bar t="Pantalla" back={() => setPs("ajustes")} /><div className="p-4 space-y-4"><div><div className="text-xs text-gray-600 mb-1 flex items-center gap-1"><Sun className="w-4 h-4" /> Brillo</div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full w-2/3 bg-[#286575] rounded-full" /></div></div><div className="flex items-center justify-between text-sm"><span>Tema oscuro</span><Toggle on={dark} set={() => setDark(v => !v)} /></div></div></div>)}
            {ps === "sonido" && (<div><Bar t="Sonido y vibración" back={() => setPs("ajustes")} /><div className="p-4 space-y-3 text-sm">{["Tono de llamada", "Notificaciones", "Multimedia"].map((s, i) => (<div key={i}><div className="text-xs text-gray-600 mb-1">{s}</div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-[#286575] rounded-full" style={{ width: `${60 - i * 15}%` }} /></div></div>))}</div></div>)}
            {ps === "bateria" && (<div><Bar t="Batería" back={() => setPs("ajustes")} /><div className="p-4 text-center"><div className="text-3xl font-bold text-[#286575]">78%</div><p className="text-xs text-gray-500 mb-3">Quedan ~9 h de uso</p><ul className="text-left text-xs text-gray-600 space-y-1"><li>Pantalla — 34%</li><li>WhatsApp — 18%</li><li>Fotos — 9%</li></ul></div></div>)}
            {ps === "almacen" && (<div><Bar t="Almacenamiento" back={() => setPs("ajustes")} /><div className="p-4"><div className="text-xs text-gray-600 mb-1">Usado 6,4 GB de 32 GB</div><div className="h-2 bg-gray-200 rounded-full mb-3"><div className="h-full w-1/5 bg-[#286575] rounded-full" /></div><ul className="text-xs text-gray-600 space-y-1"><li>Fotos — 2,1 GB</li><li>WhatsApp — 1,3 GB</li><li>Aplicaciones — 1,6 GB</li></ul></div></div>)}
            {ps === "apps" && (<div><Bar t="Aplicaciones" back={() => setPs("ajustes")} />{["WhatsApp", "Chrome", "Fotos", "Cámara", "Mensajes", "Reloj"].map((a, i) => (<div key={i} className="px-3 py-2.5 border-b bg-white text-sm text-gray-700">{a}</div>))}</div>)}
          </div>
        </div>
        </div>
      </div>
    </FullScreenShell>
  )
}
