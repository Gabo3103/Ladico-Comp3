"use client"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ReactNode } from "react"

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
}

export default function ExerciseShell({ label, index, total, title, instruction, children, onNext, onCheck, nextLabel = "Siguiente", nextDisabled = false, checkDisabled }: Props) {
  const { isProfesor, isAdmin } = useAuth()
  const demoMode = isProfesor || isAdmin
  const pct = (index / total) * 100
  const [open, setOpen] = useState(true)
  const [checkResult, setCheckResult] = useState<boolean | null>(null)
  const handleCheck = () => {
    if (!onCheck) return
    setCheckResult(onCheck())
  }
  return (
    <div className="min-h-screen bg-[#f3fbfb]">
      <div className="bg-white/10 border-b border-white/20 rounded-b-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3">
          <Link href="/dashboard"><img src="/ladico_green.png" alt="Ladico" className="w-9 h-9 object-contain cursor-pointer hover:opacity-80" /></Link>
          <span className="text-[#2e6372] text-sm opacity-90 bg-white/10 px-3 py-1 rounded-full">{label}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#286575] font-medium bg-white/10 px-3 py-1 rounded-full">Pregunta {index} de {total}</span>
          <div className="flex space-x-2" aria-hidden="true">
            {Array.from({ length: total }).map((_, i) => (<div key={i} className={`w-2.5 h-2.5 rounded-full ${i < index ? "bg-[#286575]" : "bg-[#dde3e8]"}`} />))}
          </div>
        </div>
        <div role="progressbar" aria-label={`Progreso: pregunta ${index} de ${total}`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={index} className="bg-[#dde3e8] rounded-full h-2 overflow-hidden"><div className="h-full bg-[#286575] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <Card className="bg-white shadow-xl rounded-2xl border-0 ring-1 ring-[#286575]/20">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              {instruction && (
                <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="exercise-instruction" className="text-xs text-[#286575] flex items-center gap-1 shrink-0 mt-1 hover:underline focus-visible:ring-2 focus-visible:ring-[#286575] rounded">
                  {open ? <>Ocultar enunciado <ChevronUp className="w-3.5 h-3.5" /></> : <>Ver enunciado <ChevronDown className="w-3.5 h-3.5" /></>}
                </button>
              )}
            </div>
            {instruction && open && (
              <div id="exercise-instruction" className="mt-2 mb-3 bg-gray-50 p-2.5 sm:p-3 rounded-xl border-l-4 border-[#286575]">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm max-w-4xl">{instruction}</p>
              </div>
            )}
            <div className="mt-3">{children}</div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Button asChild className="min-h-12 px-8 bg-[#286575] rounded-xl font-semibold text-white shadow-lg hover:bg-[#3a7d89] focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-2">
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
                      className="min-h-12 px-8 rounded-xl border-[#286575] text-[#286575] font-semibold shadow-sm hover:bg-[#e4f3f5] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Comprobar
                    </Button>
                  </>
                )}
                <Button onClick={onNext} disabled={nextDisabled} className="min-h-12 px-10 bg-[#286575] rounded-xl font-semibold text-white shadow-lg hover:bg-[#3a7d89] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-2">{nextLabel}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
