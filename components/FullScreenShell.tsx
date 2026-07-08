"use client"
import Link from "next/link"
import { useState, type ReactNode } from "react"
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
  nextLabel?: string
  nextDisabled?: boolean
}

// Contraparte a "pantalla entera" de ExerciseShell: misma API, pero ocupa todo
// el alto de la ventana con barra superior, cuerpo amplio y pie con el botón.
export default function FullScreenShell({ label, index, total, title, instruction, children, onNext, nextLabel = "Siguiente", nextDisabled = false }: Props) {
  const [open, setOpen] = useState(true)
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
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
            {instruction && (
              <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="exercise-instruction-fs" className="text-xs text-[#286575] flex items-center gap-1 shrink-0 mt-1 hover:underline focus-visible:ring-2 focus-visible:ring-[#286575] rounded">
                {open ? <>Ocultar enunciado <ChevronUp className="w-3.5 h-3.5" /></> : <>Ver enunciado <ChevronDown className="w-3.5 h-3.5" /></>}
              </button>
            )}
          </div>
          {instruction && open && (
            <div id="exercise-instruction-fs" className="mb-5 bg-white p-4 rounded-xl border-l-4 border-[#286575]"><p className="text-gray-700 whitespace-pre-line leading-snug text-sm">{instruction}</p></div>
          )}
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex justify-end">
          <Button onClick={onNext} disabled={nextDisabled} className="px-10 py-2.5 bg-[#286575] rounded-xl font-medium text-white shadow hover:bg-[#3a7d89] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-2">{nextLabel}</Button>
        </div>
      </footer>
    </div>
  )
}
