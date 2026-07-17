"use client"
import { useMemo, useState } from "react"
import { shuffle } from "@/lib/shuffle"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, ArrowRight } from "lucide-react"
import ExerciseShell from "@/components/ExerciseShell"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"
import PhoneSimulation from "./PhoneSimulation"

const COMPETENCE = "5.1"
const PREFIX = "session:5.1:Avanzado"
const directLabel = (label: string) =>
  label
    .replace(/^Pedirle a la hermana que /, "Que la hermana ")
    .replace(/^Pedirle que /, "Que ")

type Opt = { id: string; label: string; correct: boolean; result: string }
type Step = { title: string; options: Opt[] }
const STEPS: Step[] = [
  {
    title: "Paso 1 — Entienda primero qué está fallando",
    options: [
      { id: "1a", label: "Pedirle que abra el navegador e intente entrar a una página web.", correct: true, result: "El navegador tampoco carga: aparece \"Sin conexión\". El problema no es solo WhatsApp — el teléfono no tiene Internet." },
      { id: "1b", label: "Pedirle que desinstale WhatsApp y lo vuelva a instalar.", correct: false, result: "Se pierden las conversaciones y las fotos siguen sin descargarse." },
      { id: "1c", label: "Pedirle que apague el celular y lo vuelva a encender.", correct: false, result: "El celular se reinicia, pero al abrir WhatsApp el problema continúa." },
      { id: "1d", label: "Pedirle que borre fotos para liberar espacio.", correct: false, result: "Se eliminan algunas fotos. WhatsApp mantiene las fotografías pendientes de descarga." },
    ],
  },
  {
    title: "Paso 2 — Investigue la causa de la falta de Internet",
    options: [
      { id: "2a", label: "Pedirle que entre a Ajustes › WiFi y revise a qué red está conectada.", correct: true, result: "En Ajustes › WiFi aparece \"MiRedCasa: Conectada\", pero con un signo de exclamación: conectada sin acceso a Internet." },
      { id: "2b", label: "Pedirle que llame a la compañía de teléfono para reclamar.", correct: false, result: "La compañía informa que el servicio está operativo." },
      { id: "2c", label: "Pedirle que suba el volumen y reintente abrir la foto.", correct: false, result: "El volumen del teléfono queda más alto. La fotografía permanece pendiente de descarga." },
      { id: "2d", label: "Pedirle que active los datos móviles y desactive el WiFi.", correct: false, result: "El teléfono cambia de conexión. La madre no sabe si le queda saldo de datos." },
    ],
  },
  {
    title: "Paso 3 — Indique una acción para restablecer la conexión",
    options: [
      { id: "3a", label: "Pedirle que apague el WiFi, espere unos segundos y lo vuelva a encender.", correct: true, result: "La madre reconecta el WiFi. El signo de exclamación desaparece: ahora hay Internet." },
      { id: "3b", label: "Pedirle que cambie la contraseña de su red WiFi.", correct: false, result: "El celular pide una contraseña nueva que la madre no tiene." },
      { id: "3c", label: "Pedirle que restablezca el teléfono a la configuración de fábrica.", correct: false, result: "El teléfono muestra una advertencia de borrado de datos antes de continuar." },
      { id: "3d", label: "Pedirle que se conecte al WiFi del vecino.", correct: false, result: "La red del vecino pide una contraseña desconocida." },
    ],
  },
  {
    title: "Paso 4 — Compruebe que el problema quedó resuelto",
    options: [
      { id: "4a", label: "Pedirle que abra WhatsApp y verifique si ve las fotos y puede enviar un audio.", correct: true, result: "Las fotos se descargan y la madre logra enviar un audio." },
      { id: "4b", label: "Pedirle que reinicie el celular para \"guardar\" el cambio.", correct: false, result: "El celular se reinicia." },
      { id: "4c", label: "Pedirle a la hermana que reenvíe las fotos.", correct: false, result: "La hermana reenvía las fotografías." },
      { id: "4d", label: "Dar por resuelto el problema sin comprobarlo.", correct: false, result: "La conversación queda sin una prueba de descarga o envío." },
    ],
  },
]

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [step, setStep] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [last, setLast] = useState<string>("")
  const [lastChoice, setLastChoice] = useState("")
  const solved = step >= STEPS.length

  const choose = (o: Opt) => {
    if (solved) return
    if (o.correct) setCorrect(c => c + 1)
    setLast(o.result)
    setLastChoice(o.id)
    setStep(s => s + 1)
  }

  const handleNext = async () => {
    const point: 0 | 1 = correct >= 3 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-1/avanzado/ej3")
  }

  // Opciones mezcladas por paso (conserva o.correct para el puntaje).
  const shuffledSteps = useMemo(() => STEPS.map(s => ({ ...s, options: shuffle(s.options) })), [])
  const cur = shuffledSteps[Math.min(step, STEPS.length - 1)]
  const finalOk = correct >= 3

  return (
    <ExerciseShell
      selectionType="Una opción por paso"
      label="| 5.1 Identificar y resolver problemas técnicos · Nivel Avanzado"
      index={2} total={3}
      title="Guiar paso a paso a otra persona"
      instruction={'Su madre le muestra su teléfono. En WhatsApp puede ver mensajes de texto recibidos anteriormente, pero las fotografías y los audios quedan pendientes de descarga. El teléfono tiene espacio de almacenamiento suficiente. Guíela con una instrucción en cada paso. Su madre ejecutará la acción que usted elija y la pantalla mostrará el resultado; luego la simulación avanzará al siguiente paso. Elija con cuidado: en cada paso solo puede dar una instrucción.'}
      onNext={handleNext}
      onCheck={() => solved && correct >= 3}
      checkDisabled={false}
      nextDisabled={!solved}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-stretch">
        <PhoneSimulation choiceId={lastChoice} result={last} />

        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 flex flex-col">
          {!solved ? (<>
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-semibold text-gray-800">{cur.title}</p>
              <span className="text-xs text-gray-400 shrink-0">Paso {step + 1} de {STEPS.length}</span>
            </div>
            <div className="flex gap-1 mb-4">
              {STEPS.map((_, i) => (<span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-[#286575]" : i === step ? "bg-[#286575]/50" : "bg-gray-200"}`} />))}
            </div>
            <p className="mb-3 text-sm font-medium text-gray-600">¿Qué le indicaría a su madre?</p>
            <div className="space-y-3">
              {cur.options.map(o => (
                <button key={o.id} onClick={() => choose(o)} className="w-full text-left p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#286575]/40 transition text-sm flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-1">
                  <ChevronRight className="w-4 h-4 text-[#286575] shrink-0" /><span className="text-gray-700">{directLabel(o.label)}</span>
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
    </ExerciseShell>
  )
}
