import type { ReactNode } from "react"
import {
  AlertTriangle,
  Check,
  Download,
  ImageOff,
  LockKeyhole,
  Phone,
  Power,
  RotateCw,
  Settings,
  Signal,
  Smartphone,
  UsersRound,
  Volume2,
  Wifi,
  WifiOff,
} from "lucide-react"

type Props = {
  choiceId: string
  result: string
}

const ScreenHeader = ({ title, subtitle, icon }: { title: string; subtitle?: string; icon: ReactNode }) => (
  <div className="flex items-center gap-3 bg-[#075E54] px-4 py-2.5 text-white">
    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-[#d7eee9] text-[#075E54]">{icon}</div>
    <div>
      <p className="text-base font-semibold leading-tight">{title}</p>
      {subtitle && <p className="text-[11px] text-white/75">{subtitle}</p>}
    </div>
  </div>
)

const ResultFooter = ({ result }: { result: string }) => (
  <div className="min-h-[92px] border-t bg-white px-4 py-3 text-sm">
    <p className="mb-1 text-xs font-medium text-gray-500">Resultado de la indicación:</p>
    <p className="text-gray-700">{result}</p>
  </div>
)

const InitialChat = () => (
  <>
    <ScreenHeader title="Grupo familiar" subtitle="3 participantes" icon={<UsersRound className="h-6 w-6" />} />
    <div className="flex-1 space-y-3 bg-[#e6ddd4] p-4">
      <div className="max-w-[88%] rounded-lg rounded-tl-sm bg-white p-3 text-sm shadow-sm">
        <p className="mb-2 text-xs font-medium text-[#075E54]">Carolina</p>
        <div className="flex items-center gap-2 font-medium text-red-500"><ImageOff className="h-5 w-5" /> No se pudo descargar la foto</div>
        <p className="mt-1 pl-7 text-xs text-gray-500">Toque para volver a intentarlo</p>
      </div>
      <div className="max-w-[88%] rounded-lg rounded-tl-sm bg-white p-3 text-sm shadow-sm">
        <p className="mb-2 text-xs font-medium text-[#075E54]">Carolina</p>
        <div className="flex items-center gap-2 text-gray-600"><Download className="h-5 w-5" /> Audio pendiente de descarga</div>
      </div>
    </div>
    <div className="min-h-[92px] border-t bg-white px-4 py-3 text-sm text-gray-500">Su madre le muestra esta pantalla y espera su primera indicación.</div>
  </>
)

const SettingsScreen = ({ title, children }: { title: string; children: ReactNode }) => (
  <>
    <div className="flex items-center gap-3 border-b bg-white px-4 py-4 text-gray-800"><Settings className="h-5 w-5 text-[#286575]" /><p className="font-semibold">{title}</p></div>
    <div className="flex-1 bg-gray-50 p-4">{children}</div>
  </>
)

export default function PhoneSimulation({ choiceId, result }: Props) {
  const content = (() => {
    if (!choiceId) return <InitialChat />

    if (choiceId === "1a") return <><ScreenHeader title="Navegador" icon={<Smartphone className="h-6 w-6" />} /><div className="flex-1 bg-white p-4"><div className="rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-500">www.ejemplo.cl</div><div className="flex h-64 flex-col items-center justify-center text-center"><WifiOff className="mb-3 h-12 w-12 text-gray-400" /><p className="font-semibold text-gray-700">Sin conexión a Internet</p><p className="mt-1 text-xs text-gray-500">Revise la conexión Wi‑Fi o los datos móviles.</p></div></div><ResultFooter result={result} /></>
    if (choiceId === "1b") return <><SettingsScreen title="Información de WhatsApp"><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="font-semibold">WhatsApp</p><p className="mt-1 text-xs text-gray-500">Mensajería y llamadas</p><button className="mt-5 w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600">Desinstalar aplicación</button><p className="mt-3 text-xs text-gray-500">Esta acción puede eliminar información almacenada.</p></div></SettingsScreen><ResultFooter result={result} /></>
    if (choiceId === "1c" || choiceId === "4b") return <><div className="flex flex-1 flex-col items-center justify-center bg-gray-950 text-white"><Power className="mb-4 h-14 w-14" /><p className="font-semibold">Reiniciando teléfono…</p><RotateCw className="mt-5 h-6 w-6 animate-spin text-gray-400" /></div><ResultFooter result={result} /></>
    if (choiceId === "1d") return <><SettingsScreen title="Almacenamiento"><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm font-medium">Espacio utilizado</p><div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200"><div className="h-full w-3/4 bg-[#286575]" /></div><div className="mt-5 space-y-3 text-sm"><p className="flex justify-between"><span>Fotos y videos</span><b>18 GB</b></p><p className="flex justify-between"><span>Aplicaciones</span><b>9 GB</b></p></div></div></SettingsScreen><ResultFooter result={result} /></>
    if (choiceId === "2a" || choiceId === "3a") return <><SettingsScreen title="Wi‑Fi"><div className="rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Wifi className="h-6 w-6 text-[#286575]" /><div><p className="font-medium">MiRedCasa</p><p className={`text-xs ${choiceId === "3a" ? "text-emerald-600" : "text-amber-600"}`}>{choiceId === "3a" ? "Conectada, con Internet" : "Conectada, sin Internet"}</p></div></div>{choiceId === "3a" ? <Check className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />}</div></div></SettingsScreen><ResultFooter result={result} /></>
    if (choiceId === "2b") return <><div className="flex flex-1 flex-col items-center justify-center bg-[#173b43] text-white"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15"><Phone className="h-10 w-10" /></div><p className="mt-5 text-lg font-semibold">Servicio telefónico</p><p className="mt-1 text-sm text-white/70">Llamada en curso · 00:18</p></div><ResultFooter result={result} /></>
    if (choiceId === "2c") return <><ScreenHeader title="Grupo familiar" subtitle="3 participantes" icon={<UsersRound className="h-6 w-6" />} /><div className="relative flex flex-1 items-center justify-center bg-[#e6ddd4]"><div className="flex items-center gap-3 rounded-2xl bg-gray-900/85 px-5 py-4 text-white shadow-xl"><Volume2 className="h-6 w-6" /><div className="h-2 w-36 rounded-full bg-white/25"><div className="h-full w-2/3 rounded-full bg-white" /></div></div></div><ResultFooter result={result} /></>
    if (choiceId === "2d") return <><SettingsScreen title="Conexiones"><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-gray-200 p-4 text-center"><WifiOff className="mx-auto mb-2 h-7 w-7" /><p className="text-xs font-medium">Wi‑Fi desactivado</p></div><div className="rounded-2xl bg-[#286575] p-4 text-center text-white"><Signal className="mx-auto mb-2 h-7 w-7" /><p className="text-xs font-medium">Datos móviles</p></div></div></SettingsScreen><ResultFooter result={result} /></>
    if (choiceId === "3b" || choiceId === "3d") return <><SettingsScreen title="Conectarse a una red"><div className="rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><LockKeyhole className="h-6 w-6 text-[#286575]" /><div><p className="font-medium">{choiceId === "3d" ? "WiFi_Vecino" : "MiRedCasa"}</p><p className="text-xs text-gray-500">Ingrese la contraseña de la red</p></div></div><div className="mt-5 rounded-xl border px-3 py-3 text-sm text-gray-400">Contraseña</div><button className="mt-3 w-full rounded-xl bg-gray-200 py-3 text-sm text-gray-500">Conectar</button></div></SettingsScreen><ResultFooter result={result} /></>
    if (choiceId === "3c") return <><SettingsScreen title="Restablecer teléfono"><div className="rounded-2xl border border-red-200 bg-red-50 p-4"><AlertTriangle className="mb-3 h-8 w-8 text-red-600" /><p className="font-semibold text-red-700">Borrar todos los datos</p><p className="mt-2 text-xs text-red-700/80">Se eliminarán fotos, cuentas, aplicaciones y configuraciones.</p><button className="mt-5 w-full rounded-xl bg-red-600 py-3 text-sm font-medium text-white">Restablecer</button></div></SettingsScreen><ResultFooter result={result} /></>
    if (choiceId === "4a") return <><ScreenHeader title="Grupo familiar" subtitle="3 participantes" icon={<UsersRound className="h-6 w-6" />} /><div className="flex-1 space-y-3 bg-[#e6ddd4] p-4"><div className="max-w-[88%] rounded-lg bg-white p-2 text-sm shadow-sm"><div className="mb-2 flex h-28 items-center justify-center rounded bg-[#286575]/15 text-[#286575]">Foto descargada</div><div className="flex items-center gap-2 text-emerald-700"><Check className="h-4 w-4" /> Archivo disponible</div></div><div className="max-w-[88%] rounded-lg bg-white px-3 py-2 text-sm shadow-sm">El audio también se reproduce correctamente.</div></div><ResultFooter result={result} /></>
    if (choiceId === "4c") return <><ScreenHeader title="Grupo familiar" subtitle="3 participantes" icon={<UsersRound className="h-6 w-6" />} /><div className="flex-1 bg-[#e6ddd4] p-4"><div className="rounded-lg bg-white p-3 text-sm shadow-sm"><p className="mb-2 text-xs font-medium text-[#075E54]">Carolina</p><div className="flex items-center gap-2 text-red-500"><ImageOff className="h-5 w-5" /> Archivo reenviado: no se pudo descargar</div></div></div><ResultFooter result={result} /></>
    if (choiceId === "4d") return <><ScreenHeader title="Grupo familiar" subtitle="3 participantes" icon={<UsersRound className="h-6 w-6" />} /><div className="flex flex-1 flex-col items-center justify-center bg-[#e6ddd4] px-6 text-center"><AlertTriangle className="mb-3 h-10 w-10 text-amber-600" /><p className="font-semibold text-gray-700">El problema continúa sin comprobarse</p><p className="mt-2 text-xs text-gray-500">Los archivos todavía aparecen pendientes de descarga.</p></div><ResultFooter result={result} /></>
    return <InitialChat />
  })()

  return <div className="mx-auto flex min-h-[520px] w-full flex-col overflow-hidden rounded-[2.6rem] border-[10px] border-gray-900 bg-white shadow-2xl lg:mx-0"><div className="h-5 bg-gray-800" />{content}</div>
}
