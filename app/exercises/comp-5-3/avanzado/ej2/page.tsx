"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Monitor, ChevronRight, Check, Globe, Mail, Folder, Lock, Plus, FileText } from "lucide-react"
import ExerciseShell from "@/components/ExerciseShell"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.3"
const PREFIX = "session:5.3:Avanzado"

type ScreenState = "desktop" | "forms" | "formQ" | "responses" | "summary" | { title: string; text: string }
type Opt = { id: string; label: string; correct: boolean; screen: ScreenState }
type Step = { title: string; options: Opt[] }

const STEPS: Step[] = [
  {
    title: "Paso 1 — Entienda primero qué está fallando",
    options: [
      { id: "1a", label: "\"Abra el navegador y busque Google Forms o una herramienta de formularios gratuita.\"", correct: true, screen: "forms" },
      { id: "1b", label: "\"Abra un documento de Word y escriba las preguntas para imprimirlas.\"", correct: false, screen: { title: "Documento de Word", text: "Las preguntas quedan escritas para imprimir en papel; será lento contar 120 respuestas." } },
      { id: "1c", label: "\"Envíe un correo a cada vecino preguntándole individualmente su opinión.\"", correct: false, screen: { title: "Correo electrónico", text: "Redactando un correo para cada vecino, uno por uno." } },
      { id: "1d", label: "\"Descargue un programa de encuestas de pago.\"", correct: false, screen: { title: "Programa de pago", text: "Pide una suscripción para continuar; no es necesario." } },
    ],
  },
  {
    title: "Paso 2 — ¿Cómo armar el formulario?",
    options: [
      { id: "2a", label: "\"Escriba un título descriptivo y agregue las preguntas con opciones de respuesta claras.\"", correct: true, screen: "formQ" },
      { id: "2b", label: "\"Deje el formulario sin título y agregue solo una pregunta abierta.\"", correct: false, screen: { title: "Formulario sin título", text: "Una sola pregunta abierta, sin estructura; difícil de analizar." } },
      { id: "2c", label: "\"Copie las preguntas de otra encuesta de Internet sin adaptarlas.\"", correct: false, screen: { title: "Preguntas copiadas", text: "Preguntas de otra encuesta que no se ajustan al tema de las cámaras." } },
      { id: "2d", label: "\"Agregue la mayor cantidad de preguntas posible para obtener más información.\"", correct: false, screen: { title: "Formulario muy largo", text: "Demasiadas preguntas; los vecinos podrían no terminarlo." } },
    ],
  },
  {
    title: "Paso 3 — ¿Cómo recoger las respuestas?",
    options: [
      { id: "3a", label: "\"Configure las respuestas como anónimas y comparta el enlace por el grupo de WhatsApp del edificio y por correo.\"", correct: true, screen: "responses" },
      { id: "3b", label: "\"Pida que cada vecino firme con nombre completo y RUT para validar las respuestas.\"", correct: false, screen: { title: "Datos personales solicitados", text: "Pide nombre y RUT; muchos vecinos preferirán no responder." } },
      { id: "3c", label: "\"Imprima el formulario y distribúyalo en papel por debajo de las puertas.\"", correct: false, screen: { title: "Formulario impreso", text: "Vuelve al papel, justo lo que la herramienta digital evitaba." } },
      { id: "3d", label: "\"Publique el enlace en sus redes sociales personales para que más personas opinen.\"", correct: false, screen: { title: "Publicado en redes personales", text: "Personas ajenas al edificio podrían responder y distorsionar el resultado." } },
    ],
  },
  {
    title: "Paso 4 — ¿Qué hacer con los resultados?",
    options: [
      { id: "4a", label: "\"Revise los resultados en el panel de respuestas y prepare un resumen para la próxima reunión de vecinos.\"", correct: true, screen: "summary" },
      { id: "4b", label: "\"Cierre el formulario inmediatamente sin revisar los resultados.\"", correct: false, screen: { title: "Formulario cerrado", text: "Se cerró sin revisar; se desperdicia la información recogida." } },
      { id: "4c", label: "\"Tome una decisión basándose solo en las primeras 10 respuestas.\"", correct: false, screen: { title: "Solo 10 respuestas", text: "Diez respuestas no representan a los 120 residentes." } },
      { id: "4d", label: "\"Reenvíe el formulario todos los días hasta que respondan los 120 vecinos.\"", correct: false, screen: { title: "Reenvío diario", text: "El reenvío diario molesta a los vecinos y no es necesario." } },
    ],
  },
]

function BrowserBar({ url }: { url: string }) {
  return (
    <div className="bg-gray-100 border-b px-3 py-1.5 flex items-center gap-2">
      <span className="flex gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="w-2 h-2 rounded-full bg-yellow-400" /><span className="w-2 h-2 rounded-full bg-green-400" /></span>
      <div className="flex-1 mx-2 bg-white rounded-full border px-2.5 py-0.5 flex items-center gap-1.5 text-[11px] text-gray-500"><Lock className="w-2.5 h-2.5" /> {url}</div>
    </div>
  )
}
function BarChartRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-gray-600">{label}</span>
      <div className="flex-1 h-4 bg-gray-100 rounded"><div className="h-full rounded" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} /></div>
      <span className="w-6 text-right text-gray-500">{value}</span>
    </div>
  )
}

// La pantalla refleja la consecuencia de la ÚLTIMA instrucción elegida.
function Screen({ s }: { s: ScreenState }) {
  if (s === "desktop") {
    return (
      <div className="h-full bg-[#dbe7ef] p-5 flex flex-wrap gap-5 content-start">
        {[["Navegador", Globe], ["Correo", Mail], ["Carpetas", Folder]].map(([l, I]: any, i) => (
          <div key={i} className="flex flex-col items-center gap-1 w-16">
            <span className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#286575]"><I className="w-6 h-6" /></span>
            <span className="text-[11px] text-gray-700">{l}</span>
          </div>
        ))}
      </div>
    )
  }
  if (s === "forms") {
    return (
      <div className="h-full bg-gray-100 flex flex-col">
        <BrowserBar url="forms.app/nuevo" />
        <div className="p-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-gray-300 border-b pb-2 mb-3 text-lg">Formulario sin título</div>
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400 text-sm">Sin preguntas todavía</div>
            <div className="mt-3 inline-flex items-center gap-1 text-sm text-[#286575]"><Plus className="w-4 h-4" /> Agregar pregunta</div>
          </div>
        </div>
      </div>
    )
  }
  if (s === "formQ") {
    return (
      <div className="h-full bg-gray-100 flex flex-col">
        <BrowserBar url="forms.app/editar" />
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="bg-white rounded-lg border p-3">
            <p className="text-sm font-medium text-gray-800 mb-2">¿Está de acuerdo con instalar cámaras de seguridad en los accesos?</p>
            {["Sí", "No", "Prefiero no opinar"].map((o, i) => (<div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-0.5"><span className="w-3.5 h-3.5 rounded-full border border-gray-400" />{o}</div>))}
          </div>
          <div className="bg-white rounded-lg border p-3">
            <p className="text-sm font-medium text-gray-800 mb-2">¿En qué accesos priorizaría las cámaras?</p>
            {["Entrada principal", "Estacionamiento", "Patio interior"].map((o, i) => (<div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-0.5"><span className="w-3.5 h-3.5 rounded border border-gray-400" />{o}</div>))}
          </div>
        </div>
      </div>
    )
  }
  if (s === "responses") {
    return (
      <div className="h-full bg-gray-100 flex flex-col">
        <BrowserBar url="forms.app/respuestas" />
        <div className="p-4">
          <div className="flex items-baseline gap-2 mb-4"><span className="text-4xl font-bold text-[#286575]">37</span><span className="text-sm text-gray-500">respuestas recibidas</span></div>
          <div className="bg-white rounded-lg border p-3 space-y-2">
            <p className="text-xs text-gray-500 mb-1">¿Instalar cámaras en los accesos?</p>
            <BarChartRow label="Sí" value={24} max={37} color="#286575" />
            <BarChartRow label="No" value={13} max={37} color="#9db8bf" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Las respuestas siguen llegando…</p>
        </div>
      </div>
    )
  }
  if (s === "summary") {
    return (
      <div className="h-full bg-gray-100 flex flex-col">
        <BrowserBar url="forms.app/resumen" />
        <div className="p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">Resumen de resultados</p>
          <p className="text-xs text-gray-500 mb-3">112 de 120 residentes respondieron</p>
          <div className="bg-white rounded-lg border p-3 space-y-2">
            <BarChartRow label="Sí" value={71} max={112} color="#286575" />
            <BarChartRow label="No" value={41} max={112} color="#9db8bf" />
          </div>
          <p className="text-xs text-emerald-700 mt-3 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Listo para presentar en la reunión de vecinos.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="h-full bg-gray-100 flex flex-col">
      <BrowserBar url="computador/ventana" />
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <span className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 mb-3"><FileText className="w-7 h-7" /></span>
        <p className="text-sm font-semibold text-gray-800">{s.title}</p>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">{s.text}</p>
      </div>
    </div>
  )
}

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [step, setStep] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [screen, setScreen] = useState<ScreenState>("desktop")
  const done = step >= STEPS.length

  const choose = (o: Opt) => {
    if (done) return
    if (o.correct) setCorrect(c => c + 1)
    setScreen(o.screen)
    setStep(s => s + 1)
  }

  const handleNext = async () => {
    const point: 0 | 1 = correct >= 3 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 2, point)
    await mark(1, point === 1)
    router.push("/exercises/comp-5-3/avanzado/ej3")
  }

  const cur = STEPS[Math.min(step, STEPS.length - 1)]

  return (
    <ExerciseShell
      label="| 5.3 Uso creativo de las tecnologías digitales · Nivel Avanzado"
      index={2} total={3}
      title="Guiar la creación de una encuesta en línea"
      instruction={'Caso práctico con entorno interactivo.\n\nSituación: el presidente de la junta de vecinos necesita enviar una encuesta digital a los 120 residentes para decidir si instalan cámaras de seguridad, pero nunca ha creado un formulario en línea. Guíelo dándole una instrucción en cada paso. La pantalla de su computador muestra el resultado de la instrucción que usted elige; en cada paso solo puede dar una instrucción.'}
      onNext={handleNext}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_1fr] gap-6 items-stretch">
        <div className="w-full flex flex-col">
          <div className="rounded-xl border-8 border-gray-800 bg-white overflow-hidden flex-1 flex flex-col shadow-xl">
            <div className="bg-gray-800 text-white/80 text-xs px-3 py-1.5 flex items-center gap-2"><Monitor className="w-4 h-4" /> Computador del dirigente</div>
            <div className="flex-1 min-h-[360px] flex flex-col"><Screen s={screen} /></div>
          </div>
          <div className="h-3 bg-gray-700 rounded-b-lg mx-16" />
        </div>

        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 flex flex-col">
          {!done ? (<>
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-semibold text-gray-800">{cur.title}</p>
              <span className="text-xs text-gray-400 shrink-0">Paso {step + 1} de {STEPS.length}</span>
            </div>
            <div className="flex gap-1 mb-4">
              {STEPS.map((_, i) => (<span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-[#286575]" : i === step ? "bg-[#286575]/50" : "bg-gray-200"}`} />))}
            </div>
            <div className="space-y-3">
              {cur.options.map(o => (
                <button key={o.id} onClick={() => choose(o)} className="w-full text-left p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#286575]/40 transition text-sm flex items-start gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-1">
                  <ChevronRight className="w-4 h-4 text-[#286575] shrink-0 mt-0.5" /><span className="text-gray-700">{o.label}</span>
                </button>
              ))}
            </div>
          </>) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="rounded-full p-3 bg-emerald-100 text-emerald-700"><Check className="w-7 h-7" /></div>
              <p className="text-base font-semibold text-gray-800">Guio al dirigente en los 4 pasos.</p>
              <p className="text-sm text-gray-500 max-w-sm">Revise la pantalla del computador y presione <b>Siguiente</b> para continuar.</p>
            </div>
          )}
        </div>
      </div>
    </ExerciseShell>
  )
}
