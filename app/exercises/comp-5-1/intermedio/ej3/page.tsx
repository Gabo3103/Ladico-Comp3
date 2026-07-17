"use client"
import { useMemo, useState } from "react"
import { shuffledIndices } from "@/lib/shuffle"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"
import { BatteryCharging, Bell, Cloud, Smartphone, Signal, Wifi, BatteryFull, Check } from "lucide-react"

const COMPETENCE = "5.1"
const PREFIX = "session:5.1:Intermedio"

type Sec = { label: string; ask: string; icon: any; opts: string[]; correct: number }
const SECS: Sec[] = [
  {
    label: "Almacenamiento y respaldo",
    ask: "Para que sus fotografías y contactos no se pierdan ante robo, daño o cambio de teléfono:",
    icon: Cloud,
    opts: [
      "Transferir las fotos a un pendrive cada vez que la memoria esté llena.",
      "Activar la sincronización automática con un servicio en la nube (Google Drive, iCloud u OneDrive).",
      "Guardar una copia de los contactos en una libreta física.",
      "No realizar ningún respaldo, porque los teléfonos actuales rara vez fallan.",
    ], correct: 1,
  },
  {
    label: "Batería y rendimiento",
    ask: "Si la batería se agota frecuentemente antes del final del día:",
    icon: BatteryCharging,
    opts: [
      "Mantener siempre el brillo de la pantalla al máximo.",
      "Desinstalar todas las redes sociales, porque son las únicas que gastan batería.",
      "Revisar qué apps consumen más batería, limitar el uso en segundo plano de las no prioritarias y reducir el brillo automático.",
      "Cargar el teléfono solo cuando llegue a 0 %, para no dañar el ciclo de carga.",
    ], correct: 2,
  },
  {
    label: "Notificaciones de seguridad",
    ask: "Para recibir alertas inmediatas cuando se realice una transacción con su tarjeta bancaria:",
    icon: Bell,
    opts: [
      "Abrir la app del banco varias veces al día y revisar el historial manualmente.",
      "Activar las notificaciones push de la app bancaria en el teléfono y dentro de la propia app.",
      "Configurar una alarma diaria que le recuerde revisar su cuenta.",
      "Pedir al banco que envíe un correo por cada transacción, porque las notificaciones no son confiables.",
    ], correct: 1,
  },
]

export default function Page() {
  const router = useRouter()
  const { sessionId, mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)
  const [ans, setAns] = useState<(number | null)[]>([null, null, null])
  // Orden de opciones aleatorizado por sección (conserva el índice original).
  const optOrders = useMemo(() => SECS.map(s => shuffledIndices(s.opts.length)), [])
  // Toca para elegir; toca la misma opción de nuevo para quitarla.
  const set = (i: number, v: number) => setAns(p => { const n = [...p]; n[i] = n[i] === v ? null : v; return n })

  const handleNext = async () => {
    const ok = SECS.reduce((acc, s, i) => acc + (ans[i] === s.correct ? 1 : 0), 0)
    const point: 0 | 1 = ok >= 2 ? 1 : 0
    setPoint(COMPETENCE, "intermedio", 3, point)
    await mark(2, point === 1)
    const prog = getProgress(COMPETENCE, "intermedio")
    const qs = new URLSearchParams({
      score: String(Math.round((levelPoints(prog) / 3) * 100)),
      passed: String(isLevelPassed(prog)), correct: String(levelPoints(prog)), total: "3",
      competence: COMPETENCE, level: "intermedio",
      q1: String(getPoint(prog, 1)), q2: String(getPoint(prog, 2)), q3: String(getPoint(prog, 3)),
      sid: sessionId ?? "",
    })
    router.push(`/test/comp-5-1-intermedio/results?${qs.toString()}`)
  }

  return (
    <ExerciseShell
      selectionType="Una opción por sección"
      label="| 5.1 Identificar y resolver problemas técnicos · Nivel Intermedio"
      index={3} total={3}
      title="Configuraciones preventivas del teléfono"
      instruction={"Desea optimizar el funcionamiento y la seguridad de su teléfono con ajustes preventivos. En cada sección de Ajustes, toque la opción más adecuada. Puede tocar de nuevo una opción para deseleccionarla."}
      onNext={handleNext}
      onCheck={() => SECS.reduce((acc, s, i) => acc + (ans[i] === s.correct ? 1 : 0), 0) >= 2}
      checkDisabled={false}
      nextLabel="Finalizar"
      nextDisabled={ans.some(a => a === null)}
    >
      <div className="mx-auto w-full max-w-[380px] rounded-[2.6rem] border-[10px] border-gray-900 bg-black overflow-hidden shadow-2xl">
        <div className="bg-gray-900 text-white flex items-center justify-between px-6 py-1.5 text-xs">
          <span>9:41</span>
          <span className="flex items-center gap-1"><Signal className="w-3.5 h-3.5" /><Wifi className="w-3.5 h-3.5" /><BatteryFull className="w-4 h-4" /></span>
        </div>
        <div className="h-[560px] overflow-y-auto bg-gradient-to-b from-[#dfeaf0] to-[#eef3f6] p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3 px-1">
            <Smartphone className="w-4 h-4 text-[#286575]" /> Ajustes del teléfono
          </div>
          <div className="space-y-3">
            {SECS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="rounded-2xl border bg-white p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-8 h-8 rounded-lg bg-[#e8f3f4] text-[#286575] flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></span>
                    <span className="text-[13px] font-semibold text-gray-800">{s.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-2 leading-snug">{s.ask}</p>
                  <div className="space-y-1.5">
                    {optOrders[i].map((j) => {
                      const o = s.opts[j]
                      const selected = ans[i] === j
                      return (
                        <button key={j} type="button" onClick={() => set(i, j)}
                          className={`w-full text-left rounded-lg border px-2.5 py-2 text-[12px] leading-snug flex items-start gap-2 transition ${selected ? "border-[#286575] bg-[#e8f3f4] text-[#1f5562] font-medium" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-white"}`}>
                          <span className={`mt-0.5 w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${selected ? "bg-[#286575] border-[#286575]" : "border-gray-300"}`}>{selected && <Check className="w-3 h-3 text-white" />}</span>
                          <span>{o}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ExerciseShell>
  )
}
