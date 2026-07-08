"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"
import { BatteryCharging, Bell, Cloud, Smartphone } from "lucide-react"

const COMPETENCE = "5.1"
const PREFIX = "session:5.1:Intermedio"

const ENUNCIADOS = [
  {
    q: "Enunciado 1: Para asegurar que sus fotografías y contactos no se pierdan en caso de robo, daño o cambio de dispositivo, la configuración más adecuada es:",
    opts: [
      "transferir manualmente las fotos a un pendrive cada vez que la memoria esté llena.",
      "activar la sincronización automática con un servicio de almacenamiento en la nube (como Google Drive, iCloud o OneDrive).",
      "guardar una copia de los contactos en una libreta física como respaldo.",
      "no realizar ningún respaldo, ya que los dispositivos actuales rara vez presentan fallas de almacenamiento.",
    ], correct: 1,
  },
  {
    q: "Enunciado 2: Si la batería de su teléfono se agota frecuentemente antes del final del día, una configuración preventiva adecuada es:",
    opts: [
      "mantener siempre el brillo de pantalla al máximo para poder ver bien las notificaciones.",
      "desinstalar todas las aplicaciones de redes sociales, ya que son las únicas que consumen batería.",
      "revisar qué aplicaciones consumen más batería en los ajustes, desactivar la actualización en segundo plano de las no prioritarias y reducir el brillo automático.",
      "cargar el dispositivo únicamente cuando la batería llegue a 0 %, para no dañar el ciclo de carga.",
    ], correct: 2,
  },
  {
    q: "Enunciado 3: Para recibir alertas inmediatas cuando se realice una transacción con su tarjeta bancaria, debe:",
    opts: [
      "abrir la aplicación del banco varias veces al día y revisar manualmente el historial de movimientos.",
      "activar las notificaciones push de la aplicación bancaria en los ajustes del dispositivo y dentro de la propia aplicación.",
      "configurar una alarma diaria en el teléfono que le recuerde revisar su cuenta bancaria.",
      "solicitar al banco que le envíe un correo cada vez que se realice una transacción, ya que las notificaciones del celular no son confiables.",
    ], correct: 1,
  },
]

function PhoneSettingsPreview() {
  const rows = [
    { label: "Respaldo en la nube", value: "Fotos y contactos sincronizados", icon: Cloud, active: true },
    { label: "Batería", value: "Apps en segundo plano revisadas", icon: BatteryCharging, active: true },
    { label: "Notificaciones banco", value: "Alertas push activadas", icon: Bell, active: true },
  ]

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[260px_1fr] items-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mx-auto w-full max-w-[230px] rounded-[2rem] border-8 border-gray-800 bg-gray-900 overflow-hidden shadow-xl">
        <div className="bg-gray-800 text-white text-[11px] px-4 py-1 flex justify-between">
          <span>9:41</span><span>82%</span>
        </div>
        <div className="bg-[#eef3f6] min-h-[300px] p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
            <Smartphone className="w-4 h-4 text-[#286575]" /> Ajustes del teléfono
          </div>
          <div className="space-y-2">
            {rows.map(({ label, value, icon: Icon, active }) => (
              <div key={label} className="rounded-xl border bg-white p-3 flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-[#e8f3f4] text-[#286575] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-gray-800">{label}</span>
                  <span className="block text-[10px] text-gray-500">{value}</span>
                </span>
                <span className={`w-8 h-4 rounded-full ${active ? "bg-[#286575]" : "bg-gray-300"}`}>
                  <span className="block ml-auto mr-0.5 mt-0.5 w-3 h-3 rounded-full bg-white" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1">Entorno simulado</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Observe el teléfono como referencia: las preguntas se relacionan con ajustes preventivos
          para respaldo, batería y notificaciones. Seleccione la configuración correcta en cada enunciado.
        </p>
      </div>
    </div>
  )
}

function InteractivePhoneSettings({ ans, set }: { ans: (number | null)[]; set: (i: number, v: number) => void }) {
  const rows = [
    {
      label: "Almacenamiento y respaldo",
      value: "Proteja fotos y contactos",
      icon: Cloud,
      question: 0,
      options: [
        { text: "Pendrive manual", value: 0 },
        { text: "Sincronización automática en la nube", value: 1 },
        { text: "Libreta física", value: 2 },
      ],
    },
    {
      label: "Batería y rendimiento",
      value: "Optimice autonomía",
      icon: BatteryCharging,
      question: 1,
      options: [
        { text: "Brillo al máximo", value: 0 },
        { text: "Desinstalar redes sociales", value: 1 },
        { text: "Revisar consumo por app y limitar segundo plano", value: 2 },
      ],
    },
    {
      label: "Notificaciones de seguridad",
      value: "Reciba alertas bancarias",
      icon: Bell,
      question: 2,
      options: [
        { text: "Revisar manualmente", value: 0 },
        { text: "Activar push en banco y dispositivo", value: 1 },
        { text: "Alarma diaria", value: 2 },
      ],
    },
  ]

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[320px_1fr] items-start rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mx-auto w-full max-w-[300px] rounded-[2rem] border-8 border-gray-800 bg-gray-900 overflow-hidden shadow-xl">
        <div className="bg-gray-800 text-white text-[11px] px-4 py-1 flex justify-between">
          <span>9:41</span><span>82%</span>
        </div>
        <div className="bg-[#eef3f6] min-h-[420px] p-3 overflow-y-auto">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
            <Smartphone className="w-4 h-4 text-[#286575]" /> Ajustes del teléfono
          </div>
          <div className="space-y-2">
            {rows.map(({ label, value, icon: Icon, question, options }) => (
              <div key={label} className="rounded-xl border bg-white p-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-[#e8f3f4] text-[#286575] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-gray-800">{label}</span>
                    <span className="block text-[10px] text-gray-500">{value}</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {options.map((option) => {
                    const selected = ans[question] === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => set(question, option.value)}
                        className={`w-full rounded-lg border px-2.5 py-2 text-left text-[11px] transition ${
                          selected
                            ? "border-[#286575] bg-[#e8f3f4] text-[#1f5562] font-medium"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-white"
                        }`}
                      >
                        {option.text}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1">Entorno simulado</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Use el teléfono simulado para ajustar configuraciones preventivas de respaldo, batería y
          notificaciones. Las selecciones del teléfono quedan reflejadas en los enunciados de abajo.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [ans, setAns] = useState<(number | null)[]>([null, null, null])

  const set = (i: number, v: number) => setAns((p) => { const n = [...p]; n[i] = v; return n })

  const handleNext = async () => {
    const ok = ENUNCIADOS.reduce((acc, e, i) => acc + (ans[i] === e.correct ? 1 : 0), 0)
    const point: 0 | 1 = ok >= 2 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 3, point)
    await mark(2, point === 1)

    const prog = getProgress(COMPETENCE, "intermedio")
    const totalPts = levelPoints(prog)
    const passed = isLevelPassed(prog)
    const qs = new URLSearchParams({
      score: String(Math.round((totalPts / 3) * 100)),
      passed: String(passed), correct: String(totalPts), total: "3",
      competence: COMPETENCE, level: "intermedio",
      q1: String(getPoint(prog, 1)), q2: String(getPoint(prog, 2)), q3: String(getPoint(prog, 3)),
      sid: sessionId ?? "",
    })
    router.push(`/test/comp-5-1-intermedio/results?${qs.toString()}`)
  }

  return (
    <ExerciseShell
      label="| 5.1 Identificar y resolver problemas técnicos · Nivel Intermedio"
      index={3} total={3}
      title="Configuraciones preventivas del teléfono"
      instruction={"Completar la oración (seleccione la opción correcta para cada enunciado).\n\nSituación: Desea optimizar el funcionamiento y la seguridad de su teléfono realizando ajustes preventivos. Complete cada enunciado eligiendo la opción más adecuada."}
      onNext={handleNext} nextLabel="Finalizar" nextDisabled={ans.some(a => a === null)}
    >
      <div className="space-y-6">
        <InteractivePhoneSettings ans={ans} set={set} />
        {ENUNCIADOS.map((e, i) => (
          <div key={i}>
            <p className="font-medium text-gray-800 text-sm mb-2">{e.q}</p>
            <div className="space-y-2" role="radiogroup">
              {e.opts.map((o, j) => (
                <Choice key={j} variant="radio" letter={String.fromCharCode(65 + j)} selected={ans[i] === j} onClick={() => set(i, j)}>{o}</Choice>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ExerciseShell>
  )
}
