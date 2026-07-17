"use client"
import Link from "next/link"
import { useState, type ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

type Props = {
  label: string
  index: number
  total: number
  title: string
  instruction?: string
  children: ReactNode
  onNext: () => void
  onCheck?: () => boolean
  nextLabel?: string
  nextDisabled?: boolean
  checkDisabled?: boolean
  selectionType?: string
}

// Contraparte a "pantalla entera" de ExerciseShell: misma API, pero ocupa todo
// el alto de la ventana con barra superior, cuerpo amplio y pie con el botón.
export default function FullScreenShell({ label, index, total, title, instruction, children, onNext, onCheck, nextLabel = "Siguiente", nextDisabled = false, checkDisabled, selectionType }: Props) {
  const { isProfesor, isAdmin } = useAuth()
  const demoMode = isProfesor || isAdmin
  const [open, setOpen] = useState(true)
  const [checkResult, setCheckResult] = useState<boolean | null>(null)
  const handleCheck = () => {
    if (!onCheck) return
    setCheckResult(onCheck())
  }
  return (
    <div className="min-h-screen flex flex-col bg-[#f3fbfb]">
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-8 py-2.5 flex items-center gap-3">
          <Link href="/dashboard"><img src="/ladico_green.png" alt="Ladico" className="w-10 h-10 object-contain hover:opacity-80" /></Link>
          <span className="text-[#2e6372] text-xs sm:text-sm opacity-80 bg-gray-100 px-3 py-1 rounded-full">{label}</span>
          <span className="ml-auto text-xs text-gray-400 shrink-0">Pregunta {index} de {total}</span>
        </div>
        <div className="px-4 sm:px-8 pb-2">
          <div role="progressbar" aria-label={`Progreso: pregunta ${index} de ${total}`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={index} className="bg-[#dde3e8] rounded-full h-1.5 overflow-hidden"><div className="h-full bg-[#286575] rounded-full transition-all duration-500" style={{ width: `${(index / total) * 100}%` }} /></div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-base sm:text-lg font-bold text-gray-900">{title}</h1>
            {instruction && (
              <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="exercise-instruction-fs" className="text-xs text-[#286575] flex items-center gap-1 shrink-0 mt-1 hover:underline focus-visible:ring-2 focus-visible:ring-[#286575] rounded">
                {open ? <>Ocultar enunciado <ChevronUp className="w-3.5 h-3.5" /></> : <>Ver enunciado <ChevronDown className="w-3.5 h-3.5" /></>}
              </button>
            )}
          </div>
          {instruction && open && (
            <div id="exercise-instruction-fs" className="mb-4 bg-white p-3 rounded-xl border-l-4 border-[#286575]"><p className="text-gray-700 whitespace-pre-line leading-snug text-[13px]">{instruction}</p></div>
          )}
          {selectionType && (
            <p className="mb-3 inline-block text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-full">{selectionType}</p>
          )}
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <Button asChild className="px-8 py-2.5 bg-[#286575] rounded-xl font-medium text-white shadow hover:bg-[#3a7d89] focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-2">
            <Link href="/dashboard">Salir</Link>
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {demoMode && onCheck && (
              <>
                {checkResult !== null && (
                  <span className={`text-xs font-semibold rounded-full px-3 py-1 ${checkResult ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                    {checkResult ? "Correcto" : "Revisar respuesta"}
                  </span>
                )}
                <Button
                  variant="outline"
                  onClick={handleCheck}
                  disabled={checkDisabled ?? nextDisabled}
                  className="px-8 py-2.5 rounded-xl border-[#286575] text-[#286575] font-medium shadow-sm hover:bg-[#e4f3f5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comprobar
                </Button>
              </>
            )}
            <Button onClick={onNext} disabled={nextDisabled} className="px-10 py-2.5 bg-[#286575] rounded-xl font-medium text-white shadow hover:bg-[#3a7d89] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-2">{nextLabel}</Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
