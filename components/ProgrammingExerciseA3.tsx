"use client"

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react"

export type ExerciseQuality = "good" | "partial" | "bad"

export type ProgrammingExerciseA3Grade = {
    matchingScore: number
    matchingTotal: number
    sequenceOk: boolean
    sequenceCorrectCount: number
    sequenceTotal: number
    total: number
    quality: ExerciseQuality
}

export type ProgrammingExerciseA3Handle = {
    check: () => boolean
    finish: () => boolean
    grade: () => ProgrammingExerciseA3Grade
}

type Props = {
    onFinish?: (point: 0 | 1) => void
}

type ToolId = "CODE" | "AI" | "HUMAN"

type ActivityId = "CLASSIFY" | "STATS" | "SUMMARY" | "REVIEW"

type StageId =
    | "collect"
    | "processWithAI"
    | "stats"
    | "review"
    | "report"

const TOOL_LABEL: Record<ToolId, string> = {
    CODE: "Código",
    AI: "Sistema de IA",
    HUMAN: "Revisión humana",
}

const TOOL_ORDER: ToolId[] = ["CODE", "AI", "HUMAN"]

type Activity = {
    id: ActivityId
    label: string
    correct: ToolId
}

const ACTIVITIES: Activity[] = [
    {
        id: "CLASSIFY",
        label: "Clasificar los comentarios según el tema que abordan",
        correct: "AI",
    },
    {
        id: "STATS",
        label: "Generar tablas y frecuencias estadísticas",
        correct: "CODE",
    },
    {
        id: "SUMMARY",
        label: "Elaborar un resumen preliminar de los hallazgos",
        correct: "AI",
    },
    {
        id: "REVIEW",
        label: "Revisar posibles errores o inconsistencias del proceso",
        correct: "HUMAN",
    },
]

const STAGE_LABEL: Record<StageId, string> = {
    collect: "Recopilar las respuestas de los estudiantes",
    processWithAI: "Clasificar y resumir los comentarios con un sistema de IA",
    stats: "Generar estadísticas con programación",
    review: "Revisar los resultados obtenidos",
    report: "Elaborar el informe final",
}

const STAGE_ORDER: StageId[] = [
    "collect",
    "processWithAI",
    "stats",
    "review",
    "report",
]

function shuffle<T>(items: readonly T[]) {
    return [...items].sort(() => Math.random() - 0.5)
}

function reorderByIds<T extends { id: string }>(
    items: T[],
    draggedId: string,
    targetId: string
) {
    if (draggedId === targetId) return items

    const next = [...items]
    const from = next.findIndex((item) => item.id === draggedId)
    const to = next.findIndex((item) => item.id === targetId)

    if (from < 0 || to < 0) return items

    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
}

function disorderStages(stages: { id: StageId; label: string }[], validOrder: StageId[]) {
    for (let attempt = 0; attempt < 30; attempt++) {
        const candidate = shuffle(stages)
        const misplaced = candidate.filter(
            (stage, index) => stage.id !== validOrder[index]
        ).length

        if (misplaced >= Math.min(validOrder.length - 1, 3)) return candidate
    }

    return [...stages.slice(1), stages[0]]
}

const DND_TYPE = "application/ladico-programming-stage"

const fieldStyle =
    "w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-[#286575]/40 focus:border-[#286575] focus:ring-2 focus:ring-[#286575]/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"

const SelectArrow = () => (
    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#286575]">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
            />
        </svg>
    </span>
)

const ProgrammingExerciseA3 = forwardRef<ProgrammingExerciseA3Handle, Props>(
    function ProgrammingExerciseA3({ onFinish }, ref) {
        const activities = useMemo(() => shuffle(ACTIVITIES), [])
        const stages = useMemo(
            () => STAGE_ORDER.map((id) => ({ id, label: STAGE_LABEL[id] })),
            []
        )

        const [toolAnswers, setToolAnswers] = useState<Partial<Record<ActivityId, ToolId>>>(
            {}
        )
        const [order, setOrder] = useState<{ id: StageId; label: string }[]>([])
        const [dragId, setDragId] = useState<StageId | null>(null)
        const [overId, setOverId] = useState<StageId | null>(null)
        const [checked, setChecked] = useState(false)
        const [feedbackVisible, setFeedbackVisible] = useState(false)

        useEffect(() => {
            setOrder(disorderStages(stages, STAGE_ORDER))
        }, [stages])

        const allToolsAnswered = activities.every((a) => !!toolAnswers[a.id])
        const allAnswered = allToolsAnswered && order.length === STAGE_ORDER.length

        function setToolAnswer(activityId: ActivityId, tool: ToolId) {
            setToolAnswers((prev) => ({ ...prev, [activityId]: tool }))
            setChecked(false)
            setFeedbackVisible(false)
        }

        const sequenceScore = (items = order) =>
            items.reduce(
                (total, stage, index) => total + Number(stage.id === STAGE_ORDER[index]),
                0
            )

        const onDragStart = (id: StageId, e: React.DragEvent) => {
            setDragId(id)
            e.dataTransfer.setData(DND_TYPE, id)
            e.dataTransfer.effectAllowed = "move"
        }

        const onDragEnter = (targetId: StageId) => {
            setOverId(targetId)
            setOrder((current) =>
                dragId ? reorderByIds(current, dragId, targetId) : current
            )
            setChecked(false)
            setFeedbackVisible(false)
        }

        const onDragOver = (e: React.DragEvent) => {
            if (e.dataTransfer.types.includes(DND_TYPE)) e.preventDefault()
        }

        const onDragEnd = () => {
            setDragId(null)
            setOverId(null)
        }

        function computeGrade(): ProgrammingExerciseA3Grade {
            // Emparejamiento: 0.5 puntos por cada una de las 4 actividades correctas
            // (máx 2.0).
            const matchingCorrectCount = activities.filter(
                (activity) => toolAnswers[activity.id] === activity.correct
            ).length
            const matchingTotal = activities.length
            const matchingScore = matchingCorrectCount * 0.5

            // Secuencia: parte de 3 puntos, resta 0.5 por cada etapa mal ubicada.
            const sequenceCorrectCount = sequenceScore()
            const sequenceTotal = STAGE_ORDER.length
            const sequenceErrors = sequenceTotal - sequenceCorrectCount
            const sequenceRawScore = Math.max(0, 3 - sequenceErrors * 0.5)
            const sequenceOk = sequenceCorrectCount >= 4

            const total = Math.round((sequenceRawScore + matchingScore) * 100) / 100

            // Aprueba con 4 o 5 (mínimo 4, máximo 5).
            let quality: ExerciseQuality = "bad"
            if (total === 5) quality = "good"
            else if (total >= 4) quality = "partial"

            return {
                matchingScore,
                matchingTotal,
                sequenceOk,
                sequenceCorrectCount,
                sequenceTotal,
                total,
                quality,
            }
        }

        function checkNow() {
            if (!allAnswered) return false
            const result = computeGrade()
            const ok = result.quality === "good" || result.quality === "partial"
            setChecked(true)
            setFeedbackVisible(true)
            onFinish?.(ok ? 1 : 0)
            return ok
        }

        useImperativeHandle(ref, () => ({
            check: checkNow,
            finish: checkNow,
            grade: computeGrade,
        }))

        const grade = feedbackVisible ? computeGrade() : null

        return (
            <section className="space-y-6">
                {/* Parte A: emparejamiento */}
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                        Parte A · Emparejamiento
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-800">
                        Relaciona cada actividad con la herramienta más adecuada
                    </h3>

                    <div className="mt-3 space-y-3">
                        {activities.map((activity) => {
                            const selected = toolAnswers[activity.id]
                            const isCorrect = checked && selected === activity.correct

                            return (
                                <div
                                    key={activity.id}
                                    className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr,220px]"
                                >
                                    <p className="text-sm leading-relaxed text-slate-700">
                                        {activity.label}
                                    </p>
                                    <div className="relative">
                                        <select
                                            value={selected ?? ""}
                                            disabled={checked}
                                            onChange={(e) =>
                                                setToolAnswer(
                                                    activity.id,
                                                    e.target.value as ToolId
                                                )
                                            }
                                            className={`${fieldStyle} ${
                                                selected
                                                    ? "border-[#286575] bg-[#e4f3f5] text-slate-950 ring-2 ring-[#286575]/20"
                                                    : "text-slate-500"
                                            }`}
                                        >
                                            <option value="" disabled>
                                                Selecciona...
                                            </option>
                                            {TOOL_ORDER.map((tool) => (
                                                <option
                                                    key={tool}
                                                    value={tool}
                                                    className="font-semibold text-slate-950"
                                                >
                                                    {TOOL_LABEL[tool]}
                                                </option>
                                            ))}
                                        </select>
                                        <SelectArrow />
                                    </div>
                                    {checked && (
                                        <div
                                            className={`md:col-span-2 rounded-xl border px-3 py-1.5 text-xs ${
                                                isCorrect
                                                    ? "border-emerald-500/40 text-emerald-600"
                                                    : "border-rose-500/40 text-rose-600"
                                            }`}
                                        >
                                            {isCorrect
                                                ? "Correcto."
                                                : `La herramienta más adecuada es: ${TOOL_LABEL[activity.correct]}.`}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Parte B: ordenamiento */}
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                        Parte B · Ordenamiento
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-800">
                        Ordena las etapas del proceso, del paso 1 al paso 6
                    </h3>

                    <ol className="mt-3 space-y-3">
                        {order.map((stage, idx) => {
                            const isDragging = dragId === stage.id
                            const isTarget = overId === stage.id && dragId !== stage.id

                            return (
                                <li
                                    key={stage.id}
                                    className={`group flex cursor-grab items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition-all duration-200 ease-out active:cursor-grabbing ${
                                        isDragging
                                            ? "rotate-1 scale-[1.015] border-[#286575] bg-[#e4f3f5] opacity-80 shadow-xl"
                                            : isTarget
                                            ? "-rotate-1 border-[#9fc5cd] bg-[#f3fbfb] shadow-md"
                                            : "hover:-rotate-[0.35deg] hover:shadow-lg"
                                    } ${checked ? "cursor-default opacity-90" : ""}`}
                                    draggable={!checked}
                                    onDragStart={(event) => onDragStart(stage.id, event)}
                                    onDragEnter={() => onDragEnter(stage.id)}
                                    onDragOver={onDragOver}
                                    onDragEnd={onDragEnd}
                                >
                                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#286575] font-semibold text-white">
                                        {idx + 1}
                                    </span>

                                    <div className="flex-1 text-sm font-medium leading-relaxed text-slate-800">
                                        {stage.label}
                                    </div>

                                    {!checked && (
                                        <span className="rounded-full border border-[#c6dde2] px-3 py-1 text-xs font-semibold text-[#286575]">
                                            Arrastra
                                        </span>
                                    )}
                                </li>
                            )
                        })}
                    </ol>
                </div>

                {grade && (
                    <div
                        role="status"
                        aria-live="assertive"
                        className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                            grade.quality === "good"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : grade.quality === "partial"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        <p className="font-semibold">Puntaje: {grade.total}/5</p>
                        <p className="mt-1">
                            Emparejamiento: {grade.matchingScore}/2 pts ({grade.matchingScore * 2} de {grade.matchingTotal} correctas) ·
                            Secuencia: {grade.sequenceCorrectCount}/{grade.sequenceTotal} etapas{" "}
                            {grade.sequenceOk ? "(válida)" : "(insuficiente)"}
                        </p>
                        <p className="mt-1">
                            {grade.quality === "good"
                                ? "Excelente. Aplicaste bien programación, IA y revisión humana, y la secuencia del proceso es correcta."
                                : grade.quality === "partial"
                                ? "Vas bien, pero revisa qué actividad o etapa no calza con la herramienta o el orden esperado."
                                : "Revisa qué tareas conviene resolver con programación, con IA o con revisión humana, y el orden lógico del proceso completo."}
                        </p>
                    </div>
                )}
            </section>
        )
    }
)

ProgrammingExerciseA3.displayName = "ProgrammingExerciseA3"

export default ProgrammingExerciseA3