"use client"

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react"

export type ProgrammingExerciseI3Handle = {
    check: (opts?: { silent?: boolean }) => boolean
    finish: (opts?: { silent?: boolean }) => void
    isReady: () => boolean
}

type CategoryId = "ML" | "RULES" | "NO_AI"

type Category = {
    id: CategoryId
    title: string
}

type CaseCard = {
    id: string
    text: string
    correct: CategoryId
}

type Props = {
    onFinish?: (point: 0 | 1) => void
    onReadyChange?: (ready: boolean) => void
    seed?: number
}

const CATEGORIES: Category[] = [
    { id: "ML", title: "Aprendizaje automático" },
    { id: "RULES", title: "Programación tradicional" },
    { id: "NO_AI", title: "No corresponde a IA ni a programación" },
]

const CASES: CaseCard[] = [
    {
        id: "photos-recycling",
        text:
            "Un sistema fue configurado con muchas fotos antiguas ya separadas por tipo de residuo. Al recibir una foto nueva, propone a qué grupo pertenece.",
        correct: "ML",
    },
    {
        id: "music-recommendation",
        text:
            "Una aplicación observa patrones de canciones escuchadas y muestra nuevas opciones que suelen coincidir con usuarios de gustos similares.",
        correct: "ML",
    },
    {
        id: "spam-filter",
        text:
            "Un filtro compara mensajes recientes con correos que antes fueron marcados como no deseados y decide dónde ubicar los próximos mensajes.",
        correct: "ML",
    },
    {
        id: "score-risk",
        text:
            "Una plataforma revisa registros históricos y asigna prioridad a formularios que se parecen a otros que tuvieron errores.",
        correct: "ML",
    },
    {
        id: "tax-calculator",
        text:
            "Una calculadora obtiene el precio final aplicando siempre la misma operación sobre el monto ingresado.",
        correct: "RULES",
    },
    {
        id: "password-rule",
        text:
            "Un formulario acepta una contraseña cuando cumple condiciones exactas de longitud, números y mayúsculas.",
        correct: "RULES",
    },
    {
        id: "if-temperature",
        text:
            "Un programa muestra un aviso cuando el valor ingresado supera un límite definido previamente.",
        correct: "RULES",
    },
    {
        id: "discount-code",
        text:
            "Una tienda aplica 10% de descuento solo si el código escrito por el usuario coincide con el código activo de la campaña.",
        correct: "RULES",
    },
    {
        id: "scheduled-email",
        text:
            "Una plataforma envía el mismo correo preparado todos los viernes a las 9:00.",
        correct: "RULES",
    },
    {
        id: "backup-files",
        text:
            "Un sistema copia cada noche los archivos nuevos de una carpeta a otra ubicación de respaldo.",
        correct: "RULES",
    },
    {
        id: "monthly-report",
        text:
            "Una planilla genera un reporte mensual usando una plantilla fija y los datos ya ingresados por el equipo.",
        correct: "RULES",
    },
    {
        id: "video-call-decision",
        text:
            "Durante una videollamada, el equipo discute los resultados de la encuesta y decide en conjunto qué tema priorizar en el informe.",
        correct: "NO_AI",
    },
    {
        id: "shared-doc-review",
        text:
            "Dos integrantes del equipo revisan juntos un documento compartido y marcan manualmente los párrafos que consideran más relevantes para el resumen.",
        correct: "NO_AI",
    },
]

function shuffle<T>(items: T[], seed = Math.random()) {
    let a = Math.floor(seed * 1e9) | 0
    const rand = () => {
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

function pickCases(seed?: number) {
    const s = seed ?? Math.random()
    const byCategory = (category: CategoryId, offset: number) =>
        shuffle(CASES.filter((item) => item.correct === category), s + offset)
    const mlCases = byCategory("ML", 0.11)

    return shuffle(
        [mlCases[0], mlCases[1], byCategory("RULES", 0.23)[0], byCategory("NO_AI", 0.37)[0]],
        s + 0.53
    )
}

const ProgrammingExerciseI3 = forwardRef<ProgrammingExerciseI3Handle, Props>(
    function ProgrammingExerciseI3({ onFinish, onReadyChange, seed }, ref) {
        const cases = useMemo(() => pickCases(seed), [seed])
        const [answers, setAnswers] = useState<Record<string, CategoryId | null>>({})
        const [activeCase, setActiveCase] = useState(0)
        const [feedback, setFeedback] = useState<{
            score: number
            message: string
            ok: boolean
        } | null>(null)

        const allAnswered = cases.every((item) => !!answers[item.id])

        useEffect(() => {
            onReadyChange?.(allAnswered)
        }, [allAnswered, onReadyChange])

        const score = () =>
            cases.reduce(
                (total, item) => total + Number(answers[item.id] === item.correct),
                0
            )

        const check = (opts?: { silent?: boolean }) => {
            const result = score()
            const ok = result === cases.length
            const approved = result >= 2

            if (!opts?.silent) {
                setFeedback({
                    score: result,
                    ok: approved,
                    message: ok
                        ? "Excelente. Distingues cuándo un sistema aprende de datos y cuándo solo sigue reglas o automatiza tareas."
                        : approved
                        ? "Vas bien. Comprendes la mayoría, revisa el caso que falló: el aprendizaje automático usa ejemplos o datos para clasificar, predecir o recomendar."
                        : "Revisa los casos: el aprendizaje automático usa ejemplos o datos para clasificar, predecir o recomendar.",
                })
            }
            return approved
        }

        const finish = (opts?: { silent?: boolean }) => {
            const ok = check(opts)
            const point: 0 | 1 = ok ? 1 : 0
            onFinish?.(point)
        }

        useImperativeHandle(ref, () => ({ check, finish, isReady: () => allAnswered }))

        return (
            <section className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm">
                {/* Puntos de navegación */}
                <div className="flex items-center justify-center gap-2">
                    {cases.map((item, idx) => {
                        const isAnswered = !!answers[item.id]
                        const isActive = idx === activeCase

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveCase(idx)}
                                aria-label={`Ir al caso ${idx + 1}`}
                                className={`h-2.5 rounded-full transition-all duration-200 ${
                                    isActive
                                        ? "w-7 bg-[#286575]"
                                        : isAnswered
                                        ? "w-2.5 bg-emerald-300 hover:bg-emerald-400"
                                        : "w-2.5 bg-slate-200 hover:bg-slate-300"
                                }`}
                            />
                        )
                    })}
                </div>

                {/* Caso activo */}
                {cases.map((item, index) => {
                    if (index !== activeCase) return null

                    return (
                        <article
                            key={item.id}
                            className="rounded-2xl border bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#286575] font-semibold text-white">
                                    {index + 1}
                                </span>
                                <p className="text-sm font-medium leading-relaxed text-slate-800">
                                    {item.text}
                                </p>
                            </div>

                            <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                {CATEGORIES.map((category) => {
                                    const selected = answers[item.id] === category.id

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => {
                                                setAnswers((prev) => ({
                                                    ...prev,
                                                    [item.id]: category.id,
                                                }))
                                                setFeedback(null)
                                            }}
                                            className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                                                selected
                                                    ? "border-[#286575] bg-[#e4f3f5] text-slate-950 ring-2 ring-[#286575]/20"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-[#286575]/40 hover:shadow-sm"
                                            }`}
                                        >
                                            {category.title}
                                        </button>
                                    )
                                })}
                            </div>
                        </article>
                    )
                })}

                {/* Navegación prev/next */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                    <button
                        type="button"
                        onClick={() => setActiveCase((i) => Math.max(0, i - 1))}
                        disabled={activeCase === 0}
                        className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                            activeCase === 0
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                        }`}
                    >
                        <span
                            className={`inline-block transition-transform duration-300 ${
                                activeCase !== 0 ? "group-hover:-translate-x-1" : ""
                            }`}
                            aria-hidden
                        >
                            ←
                        </span>
                        Anterior
                    </button>

                    <span className="text-xs text-slate-400">
                        {cases.filter((c) => !!answers[c.id]).length}/{cases.length} respondidos
                    </span>

                    <button
                        type="button"
                        onClick={() => setActiveCase((i) => Math.min(cases.length - 1, i + 1))}
                        disabled={activeCase === cases.length - 1}
                        className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                            activeCase === cases.length - 1
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                        }`}
                    >
                        Siguiente
                        <span
                            className={`inline-block transition-transform duration-300 ${
                                activeCase !== cases.length - 1
                                    ? "group-hover:translate-x-1"
                                    : ""
                            }`}
                            aria-hidden
                        >
                            →
                        </span>
                    </button>
                </div>

                {feedback && (
                    <div
                        role="status"
                        aria-live="assertive"
                        className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                            feedback.ok
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        <p className="font-semibold">Casos correctos: {feedback.score}/4</p>
                        <p className="mt-1">{feedback.message}</p>
                    </div>
                )}
            </section>
        )
    }
)

ProgrammingExerciseI3.displayName = "ProgrammingExerciseI3"

export default ProgrammingExerciseI3