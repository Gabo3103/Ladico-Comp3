"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, ImageOff, Clock, Check, ChevronRight, ArrowRight } from "lucide-react"
import FullScreenShell from "@/components/FullScreenShell"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.1"
const PREFIX = "session:5.1:Avanzado"

type Opt = { id: string; label: string; correct: boolean; result: string }
type Step = { title: string; options: Opt[] }
const STEPS: Step[] = [
  {
    title: "Paso 1 — Entienda primero qué está fallando",
    options: [
      { id: "1a", label: "Pedirle que abra el navegador e intente entrar a una página web.", correct: true, result: "El navegador tampoco carga: aparece \"Sin conexión\". El problema no es solo WhatsApp — el teléfono no tiene Internet." },
      { id: "1b", label: "Pedirle que desinstale WhatsApp y lo vuelva a instalar.", correct: false, result: "Se pierden las conversaciones y las fotos siguen sin descargarse." },
      { id: "1c", label: "Pedirle que apague el celular y lo vuelva a encender.", correct: false, result: "El celular se reinicia, pero al abrir WhatsApp el problema continúa." },
      { id: "1d", label: "Pedirle que borre fotos para liberar espacio.", correct: false, result: "Se eliminan algunas fotos, pero eso no cambia nada en WhatsApp." },
    ],
  },
  {
    title: "Paso 2 — Investigue la causa de la falta de Internet",
    options: [
      { id: "2a", label: "Pedirle que entre a Ajustes › WiFi y revise a qué red está conectada.", correct: true, result: "En Ajustes › WiFi aparece \"MiRedCasa: Conectada\", pero con un signo de exclamación: conectada sin acceso a Internet." },
      { id: "2b", label: "Pedirle que llame a la compañía de teléfono para reclamar.", correct: false, result: "La compañía informa que el servicio está operativo. No se avanza en el diagnóstico." },
      { id: "2c", label: "Pedirle que suba el volumen y reintente abrir la foto.", correct: false, result: "El volumen no tiene relación con la descarga. La foto sigue sin abrirse." },
      { id: "2d", label: "Pedirle que active los datos móviles y desactive el WiFi.", correct: false, result: "Se cambia la conexión sin revisar el WiFi; la madre no sabe si le queda saldo de datos." },
    ],
  },
  {
    title: "Paso 3 — Indique una acción para restablecer la conexión",
    options: [
      { id: "3a", label: "Pedirle que apague el WiFi, espere unos segundos y lo vuelva a encender.", correct: true, result: "La madre reconecta el WiFi. El signo de exclamación desaparece: ahora hay Internet." },
      { id: "3b", label: "Pedirle que cambie la contraseña de su red WiFi.", correct: false, result: "El celular pide una contraseña nueva que la madre no tiene. Queda igual." },
      { id: "3c", label: "Pedirle que restablezca el teléfono a la configuración de fábrica.", correct: false, result: "Es una medida extrema: borraría todo el teléfono para un problema de conexión." },
      { id: "3d", label: "Pedirle que se conecte al WiFi del vecino.", correct: false, result: "La red del vecino pide una contraseña desconocida. No resuelve." },
    ],
  },
  {
    title: "Paso 4 — Compruebe que el problema quedó resuelto",
    options: [
      { id: "4a", label: "Pedirle que abra WhatsApp y verifique si ve las fotos y puede enviar un audio.", correct: true, result: "Las fotos se descargan y la madre logra enviar un audio. ¡Problema resuelto!" },
      { id: "4b", label: "Pedirle que reinicie el celular para \"guardar\" el cambio.", correct: false, result: "El celular se reinicia sin necesidad; no comprueba si el problema original se resolvió." },
      { id: "4c", label: "Pedirle a la hermana que reenvíe las fotos.", correct: false, result: "La hermana reenvía, pero no se verifica el teléfono de la madre." },
      { id: "4d", label: "Dar por resuelto el problema sin comprobarlo.", correct: false, result: "El problema podría seguir; no hay verificación." },
    ],
  },
]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [step, setStep] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [last, setLast] = useState<string>("")
  const solved = step >= STEPS.length

  const choose = (o: Opt) => {
    if (solved) return
    if (o.correct) setCorrect(c => c + 1)
    setLast(o.result)
    setStep(s => s + 1)
  }

  const handleNext = async () => {
    const point: 0 | 1 = correct >= 3 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-1/avanzado/ej3/pantalla")
  }

  const cur = STEPS[Math.min(step, STEPS.length - 1)]
  const finalOk = correct >= 3

  return (
    <FullScreenShell
      label="| 5.1 Identificar y resolver problemas técnicos · Nivel Avanzado"
      index={2} total={3}
      title="Guiar paso a paso a otra persona"
      instruction={'Caso práctico con entorno interactivo.\n\nSituación: Su madre le dice que no puede ver las fotos que le mandan por WhatsApp ("no se pueden descargar") ni enviar audios, pero los mensajes de texto sí le llegan. Guíela dándole una instrucción en cada paso. La madre ejecuta lo que usted elige y el teléfono muestra el resultado; luego la simulación avanza al siguiente paso. Elige con cuidado: en cada paso solo puede dar una instrucción.'}
      onNext={handleNext}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-stretch">
        <div className="w-full mx-auto lg:mx-0 rounded-[2.6rem] border-[10px] border-gray-900 bg-white overflow-hidden shadow-2xl flex flex-col min-h-[520px]">
          <div className="bg-gray-800 h-5" />
          <div className="bg-[#075E54] text-white px-4 py-3 text-base flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Hermana</div>
          <div className="flex-1 bg-[#e6ddd4] p-4 space-y-3">
            <div className="bg-white rounded-lg px-3 py-2 text-sm w-fit">Hola ma 🙂</div>
            {solved && finalOk ? (<>
              <div className="bg-white rounded-lg p-2 text-sm"><div className="w-36 h-24 rounded bg-[#286575]/20 flex items-center justify-center text-[#286575] mb-1">📷 foto</div>Fotos del viaje</div>
              <div className="bg-[#dcf8c6] rounded-lg px-3 py-2 text-sm w-fit ml-auto flex items-center gap-1">Audio enviado <Check className="w-4 h-4 text-emerald-600" /></div>
            </>) : (<>
              <div className="bg-white rounded-lg p-2 text-sm flex items-center gap-1 text-red-500"><ImageOff className="w-5 h-5" /> No se pudo descargar</div>
              <div className="bg-[#dcf8c6] rounded-lg px-3 py-2 text-sm w-fit ml-auto flex items-center gap-1 text-gray-500">Audio <Clock className="w-4 h-4" /></div>
            </>)}
          </div>
          <div className="bg-white border-t px-4 py-3 min-h-[92px] text-sm">
            {last ? (
              <><p className="text-xs font-medium text-gray-500 mb-1">La madre hizo lo que le pidió:</p><p className="text-gray-700">{last}</p></>
            ) : (
              <p className="text-gray-400">El teléfono está en manos de su madre, esperando su primera instrucción.</p>
            )}
          </div>
        </div>

        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 flex flex-col">
          {!solved ? (<>
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-semibold text-gray-800">{cur.title}</p>
              <span className="text-xs text-gray-400 shrink-0">Paso {step + 1} de {STEPS.length}</span>
            </div>
            <div className="flex gap-1 mb-4">
              {STEPS.map((_, i) => (<span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-[#286575]" : i === step ? "bg-[#286575]/50" : "bg-gray-200"}`} />))}
            </div>
            <div className="space-y-3">
              {cur.options.map(o => (
                <button key={o.id} onClick={() => choose(o)} className="w-full text-left p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#286575]/40 transition text-sm flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-1">
                  <ChevronRight className="w-4 h-4 text-[#286575] shrink-0" /><span className="text-gray-700">{o.label}</span>
                </button>
              ))}
            </div>
          </>) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className={`rounded-full p-3 ${finalOk ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{finalOk ? <Check className="w-7 h-7" /> : <ArrowRight className="w-7 h-7" />}</div>
              <p className="text-base font-semibold text-gray-800">Guio a su madre en los 4 pasos.</p>
              <p className="text-sm text-gray-500 max-w-sm">Revise la última pantalla del teléfono a la izquierda y presione <b>Siguiente</b> para continuar.</p>
            </div>
          )}
        </div>
      </div>
    </FullScreenShell>
  )
}
