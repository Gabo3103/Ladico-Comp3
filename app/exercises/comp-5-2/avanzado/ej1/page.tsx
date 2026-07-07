"use client"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, MousePointerClick, Flag } from "lucide-react"
import ExerciseShell from "@/components/ExerciseShell"
import { setPoint } from "@/lib/levelProgress"
import { useLadicoSession } from "@/hooks/useLadicoSession"

const COMPETENCE = "5.2"
const PREFIX = "session:5.2:Avanzado"
const KEY = "ladico:5.2:avanzado:ej1:marks"
const PORTAL_URL = "/exercises/comp-5-2/avanzado/ej1/portal"
// Barreras reales de accesibilidad a marcar.
const BARRIERS = new Set(["btns", "aster", "menu", "error", "contraste", "color", "diminuto"])

function readMarks(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") as string[] } catch { return [] }
}

export default function Page() {
  const router = useRouter()
  const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)
  const [marks, setMarks] = useState<string[]>([])
  const [opened, setOpened] = useState(false)

  const refresh = useCallback(() => setMarks(readMarks()), [])
  useEffect(() => {
    refresh()
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh) }
  }, [refresh])

  const abrir = () => {
    setOpened(true)
    const feat = `width=${Math.min(screen.availWidth, 1500)},height=${Math.min(screen.availHeight, 950)},left=40,top=20`
    const w = window.open(PORTAL_URL, "portalAgenda", feat)
    if (!w) window.open(PORTAL_URL, "_blank")
  }

  const handleNext = async () => {
    const m = readMarks()
    let ok = 0, bad = 0
    m.forEach(id => (BARRIERS.has(id) ? ok++ : bad++))
    const point: 0 | 1 = ok - bad >= 5 ? 1 : 0
    setPoint(COMPETENCE, "avanzado", 1, point)
    await mark(0, point === 1)
    router.push("/exercises/comp-5-2/avanzado/ej2")
  }

  return (
    <ExerciseShell
      label="| 5.2 Identificación de necesidades y respuestas tecnológicas · Nivel Avanzado"
      index={1} total={3}
      title="Detectar las barreras de accesibilidad"
      instruction={'Marcar zonas en una página web (se abre en una ventana aparte).\n\nSituación: revise el portal de agenda de horas médicas y marque únicamente los elementos que constituyen una barrera de accesibilidad. Abra el portal con el botón, márquelos allí (haga clic para resaltar en rojo) y cierre la ventana. Luego vuelva aquí y presione Siguiente.'}
      onNext={handleNext}
    >
      <div className="max-w-xl mx-auto text-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <span className="mx-auto w-14 h-14 rounded-2xl bg-[#e8f3f4] text-[#286575] flex items-center justify-center mb-4"><ExternalLink className="w-7 h-7" /></span>
          <h3 className="text-lg font-semibold text-gray-800">Portal de Agenda de Horas Médicas</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">Se abrirá en una ventana nueva, a pantalla completa. Marque allí las barreras de accesibilidad y cierre la ventana al terminar.</p>
          <button type="button" onClick={abrir}
            className="inline-flex items-center gap-2 bg-[#286575] hover:bg-[#3a7d89] text-white rounded-xl px-6 py-3 text-sm font-medium shadow">
            <MousePointerClick className="w-5 h-5" /> {opened ? "Volver a abrir el portal" : "Abrir el portal"}
          </button>

          <div className="mt-6 pt-5 border-t text-sm">
            {marks.length > 0 ? (
              <p className="text-gray-700 flex items-center justify-center gap-2"><Flag className="w-4 h-4 text-red-500" /> Elementos marcados en el portal: <b>{marks.length}</b></p>
            ) : (
              <p className="text-gray-400">Aún no ha marcado elementos en el portal.</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Puede reabrir el portal para ajustar sus marcas antes de continuar.</p>
          </div>
        </div>
      </div>
    </ExerciseShell>
  )
}
