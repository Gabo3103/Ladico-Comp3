"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ExerciseShell from "@/components/ExerciseShell"
import { Choice } from "@/components/Choice"
import { setPoint, getProgress, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

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
