"use client"

type Props = {
  options: readonly string[]
  selected: ReadonlySet<number>
  onToggle: (index: number) => void
  ariaLabel?: string
  // Orden de presentación (índices originales). Si se omite, usa el orden natural.
  order?: readonly number[]
}

export default function MultipleSelectionGrid({
  options,
  selected,
  onToggle,
  ariaLabel = "Opciones de respuesta (puede marcar más de una)",
  order,
}: Props) {
  const view = order ?? options.map((_, i) => i)
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2" role="group" aria-label={ariaLabel}>
      {view.map((index, pos) => {
        const option = options[index]
        const isChecked = selected.has(index)
        const isLastOnOwnRow = view.length % 2 !== 0 && pos === view.length - 1

        return (
          <label
            key={index}
            className={`flex min-h-[92px] cursor-pointer select-none items-start gap-3 rounded-2xl border p-4 shadow-sm transition-all ${
              isChecked
                ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-md"
            } ${isLastOnOwnRow ? "md:col-span-2 md:mx-auto md:w-[calc(50%-0.375rem)]" : ""}`}
          >
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 rounded accent-[#286575]"
              checked={isChecked}
              onChange={() => onToggle(index)}
            />
            <span className="text-sm font-medium leading-relaxed text-slate-800">{option}</span>
          </label>
        )
      })}
    </div>
  )
}
