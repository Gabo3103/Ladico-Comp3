"use client"
import type { ReactNode } from "react"
import { Check } from "lucide-react"

type ChoiceProps = {
  variant?: "radio" | "check"
  selected: boolean
  onClick: () => void
  letter?: string
  children: ReactNode
}

// Opción de respuesta (fila completa clicable) para escritorio:
// hover claro, anillo de foco por teclado, seleccionado con relleno + ✓ (no solo color).
export function Choice({ variant = "radio", selected, onClick, letter, children }: ChoiceProps) {
  return (
    <button
      type="button"
      role={variant === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onClick}
      className={`w-full flex items-center gap-3 text-left rounded-[10px] border p-3 min-h-[44px] text-sm transition
        focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-1
        ${selected ? "bg-[#e8f3f4] border-[#286575]" : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"}`}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 w-6 h-6 flex items-center justify-center text-xs border transition
          ${variant === "radio" ? "rounded-full" : "rounded-md"}
          ${selected ? "bg-[#286575] border-[#286575] text-white" : "border-gray-300 text-gray-500"}`}
      >
        {variant === "radio" ? (letter ?? "") : selected ? <Check className="w-4 h-4" /> : ""}
      </span>
      <span className="flex-1 text-gray-800">{children}</span>
      <Check aria-hidden="true" className={`w-[18px] h-[18px] text-[#286575] shrink-0 transition-opacity ${selected ? "opacity-100" : "opacity-0"}`} />
    </button>
  )
}

// Opción de un control segmentado (para "elegir una opción en cada fila" con menú corto).
export function SegChoice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex-1 min-w-[120px] text-center rounded-lg border p-2.5 min-h-[40px] text-[13px] transition
        focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286575] focus-visible:ring-offset-1
        ${selected ? "bg-[#286575] border-[#286575] text-white" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"}`}
    >
      {children}
    </button>
  )
}
