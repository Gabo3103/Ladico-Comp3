"use client"

import { useState } from "react"

export type OrderingItem = {
  id: number
  text: string
}

type Props = {
  items: readonly OrderingItem[]
  order: readonly number[]
  onOrderChange: (order: number[]) => void
  onInteraction?: () => void
}

const DND_TYPE = "application/x-ladico-order-step"

export default function OrderingList({ items, order, onOrderChange, onInteraction }: Props) {
  const [dragId, setDragId] = useState<number | null>(null)
  const [overId, setOverId] = useState<number | null>(null)
  const byId = new Map(items.map((item) => [item.id, item]))

  const reorder = (targetId: number) => {
    if (dragId === null || dragId === targetId) return
    const next = [...order]
    const from = next.indexOf(dragId)
    const to = next.indexOf(targetId)
    if (from < 0 || to < 0) return
    next.splice(from, 1)
    next.splice(to, 0, dragId)
    onOrderChange(next)
    onInteraction?.()
  }

  return (
    <ol className="space-y-3">
      {order.map((id, index) => {
        const item = byId.get(id)
        if (!item) return null
        const isDragging = dragId === id
        const isTarget = overId === id && dragId !== id

        return (
          <li
            key={id}
            className={`group flex cursor-grab items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition-all duration-200 ease-out active:cursor-grabbing ${
              isDragging
                ? "rotate-1 scale-[1.015] border-[#286575] bg-[#e4f3f5] opacity-80 shadow-xl"
                : isTarget
                  ? "-rotate-1 border-[#9fc5cd] bg-[#f3fbfb] shadow-md"
                  : "hover:-rotate-[0.35deg] hover:shadow-lg"
            }`}
            draggable
            onDragStart={(event) => {
              setDragId(id)
              event.dataTransfer.setData(DND_TYPE, String(id))
              event.dataTransfer.effectAllowed = "move"
            }}
            onDragEnter={() => {
              setOverId(id)
              reorder(id)
            }}
            onDragOver={(event) => {
              if (event.dataTransfer.types.includes(DND_TYPE)) event.preventDefault()
            }}
            onDragEnd={() => {
              setDragId(null)
              setOverId(null)
            }}
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#286575] font-semibold text-white">
              {index + 1}
            </span>
            <span className="flex-1 text-sm font-medium leading-relaxed text-slate-800">{item.text}</span>
            <span className="rounded-full border border-[#c6dde2] px-3 py-1 text-xs font-semibold text-[#286575]">
              Arrastra
            </span>
          </li>
        )
      })}
    </ol>
  )
}
