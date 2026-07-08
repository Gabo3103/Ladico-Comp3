"use client"

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react"

type CaseId = "case1" | "case2" | "case3" | "case4" | "case5"
type ActionKey =
    | "USE_WITH_ATTRIBUTION"
    | "ADAPT_AND_SHARE_ALIKE"
    | "NON_COMMERCIAL_ONLY"
    | "SHARE_WITHOUT_MODIFYING"
    | "FREE_USE"
    | "NO_RESTRICTIONS_ALWAYS"

export type ExerciseQuality = "good" | "partial" | "bad"

export type RightsExerciseI1Grade = {
    correctCount: number
    totalCount: number
    quality: ExerciseQuality
}

export type RightsExerciseI1Handle = {
    check: () => void
    isReady: () => boolean
    reset: () => void
    grade: () => RightsExerciseI1Grade
}

type Props = {
    onReadyChange?: (ready: boolean) => void
}

const ACTION_LABEL: Record<ActionKey, string> = {
    USE_WITH_ATTRIBUTION: "Usarlo con atribución al autor",
    ADAPT_AND_SHARE_ALIKE:
        "Adaptarlo y compartir la nueva versión con la misma licencia",
    NON_COMMERCIAL_ONLY: "Usarlo solo si no tiene fines comerciales",
    SHARE_WITHOUT_MODIFYING: "Compartirlo, pero sin modificarlo",
    FREE_USE: "Usarlo libremente, sin atribución obligatoria",
    NO_RESTRICTIONS_ALWAYS:
        "Usarlo como quieras: toda imagen o texto con licencia es de uso totalmente libre",
}

const CASE_BANK: Array<{
    id: CaseId
    title: string
    context: string
    license: string
    correct: ActionKey
    hint: string
}> = [
    {
        id: "case1",
        title: "Imagen para una presentación escolar",
        context:
            "Quieres incluir una fotografía en una presentación educativa sobre cambio climático.",
        license: "CC BY",
        correct: "USE_WITH_ATTRIBUTION",
        hint: "La licencia permite reutilizar la obra si reconoces la autoría.",
    },
    {
        id: "case2",
        title: "Infografía para adaptar y volver a publicar",
        context:
            "Planeas traducir una infografía y agregar ejemplos propios antes de compartirla en tu curso.",
        license: "CC BY-SA",
        correct: "ADAPT_AND_SHARE_ALIKE",
        hint: "Si haces una versión derivada, debes mantener la misma licencia.",
    },
    {
        id: "case3",
        title: "Foto para un folleto de una empresa",
        context:
            "Una pequeña empresa quiere usar una foto en un folleto promocional de sus servicios.",
        license: "CC BY-NC",
        correct: "NON_COMMERCIAL_ONLY",
        hint: "La restricción principal es que no puede usarse con fines comerciales.",
    },
    {
        id: "case4",
        title: "Ilustración para recortar o recolorear",
        context:
            "Quieres tomar una ilustración y modificar sus colores para integrarla en un recurso visual.",
        license: "CC BY-ND",
        correct: "SHARE_WITHOUT_MODIFYING",
        hint: "La obra puede compartirse, pero no transformarse ni adaptarse.",
    },
    {
        id: "case5",
        title: "Ícono para material educativo o sitio web",
        context:
            "Necesitas un ícono para una guía digital y también para una página web del proyecto.",
        license: "CC0",
        correct: "FREE_USE",
        hint: "CC0 permite reutilización libre sin obligación de atribución.",
    },
]

const fieldStyle =
    "w-full max-w-[420px] appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-11 font-inherit text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-[#286575]/40 focus:border-[#286575] focus:ring-2 focus:ring-[#286575]/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"

function shuffle<T>(items: T[]): T[] {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

function pickRandomCases() {
    return shuffle(CASE_BANK).slice(0, 3)
}

const ORIGINAL_ACTIONS: ActionKey[] = [
    "USE_WITH_ATTRIBUTION",
    "ADAPT_AND_SHARE_ALIKE",
    "NON_COMMERCIAL_ONLY",
    "SHARE_WITHOUT_MODIFYING",
    "FREE_USE",
]

// 5 alternativas por caso: la correcta + 3 rotando entre las 4 incorrectas
// originales disponibles + la trampa de "diferenciación conceptual" (siempre fija).
function buildOptionsForCase(correct: ActionKey): ActionKey[] {
    const wrongOriginals = shuffle(ORIGINAL_ACTIONS.filter((a) => a !== correct)).slice(0, 3)
    return shuffle([correct, ...wrongOriginals, "NO_RESTRICTIONS_ALWAYS"])
}

const RightsExerciseI1 = forwardRef<RightsExerciseI1Handle, Props>(
    function RightsExerciseI1({ onReadyChange }, ref) {
        const [visibleCases, setVisibleCases] = useState(() => pickRandomCases())
        const [answers, setAnswers] = useState<Partial<Record<CaseId, ActionKey>>>({})
        const [checked, setChecked] = useState(false)

        const optionsByCase = useMemo(() => {
            const map: Partial<Record<CaseId, ActionKey[]>> = {}
            visibleCases.forEach((item) => {
                map[item.id] = buildOptionsForCase(item.correct)
            })
            return map
        }, [visibleCases])

        const allAnswered = useMemo(
            () => visibleCases.every((item) => !!answers[item.id]),
            [answers, visibleCases]
        )

        useEffect(() => {
            onReadyChange?.(allAnswered)
        }, [allAnswered, onReadyChange])

        const isCorrectCase = (caseId: CaseId) => {
            const item = visibleCases.find((entry) => entry.id === caseId)
            if (!item) return false
            return answers[caseId] === item.correct
        }

        const computeGrade = (): RightsExerciseI1Grade => {
            const totalCount = visibleCases.length
            let correctCount = 0

            visibleCases.forEach((item) => {
                if (answers[item.id] === item.correct) {
                    correctCount += 1
                }
            })

            let quality: ExerciseQuality = "bad"
            if (correctCount === totalCount) {
                quality = "good" // 3/3: Alto
            } else if (correctCount === 2) {
                quality = "partial" // 2/3: Medio
            } // 0-1/3: Bajo

            return { correctCount, totalCount, quality }
        }

        const setAction = (caseId: CaseId, value: ActionKey | undefined) => {
            setAnswers((prev) => ({ ...prev, [caseId]: value }))
        }

        useImperativeHandle(ref, () => ({
            check() {
                if (allAnswered) setChecked(true)
            },
            isReady() {
                return allAnswered
            },
            reset() {
                setVisibleCases(pickRandomCases())
                setAnswers({})
                setChecked(false)
                onReadyChange?.(false)
            },
            grade() {
                const result = computeGrade()
                if (allAnswered) setChecked(true)
                return result
            },
        }))

        return (
            <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.35fr)]">
                <aside className="flex rounded-2xl border bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:min-h-full lg:self-stretch">
                    <div className="flex w-full flex-col">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                            Guía Creative Commons
                        </p>
                        <p className="mt-1 text-justify text-sm leading-relaxed text-slate-600">
                            Cada licencia combina símbolos que indican qué está permitido. Revísala si lo necesitas.
                        </p>
                        <div className="mt-3 flex flex-1 items-start justify-center overflow-hidden rounded-xl border bg-slate-50">
                            <img
                                src="/img/CcGuide.png"
                                alt="Guía visual de licencias Creative Commons"
                                className="h-full max-h-[760px] w-full object-contain"
                            />
                        </div>
                    </div>
                </aside>

                <div className="space-y-4 text-sm text-gray-700">
                    {visibleCases.map((item) => {
                        const selected = answers[item.id]
                        const correctNow = checked ? isCorrectCase(item.id) : null

                        return (
                            <div key={item.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                                <div className="mb-2">
                                    <div className="font-semibold">{item.title}</div>
                                    <div className="opacity-80">{item.context}</div>
                                    <div className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                        Licencia: {item.license}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[180px,1fr]">
                                    <span>Qué puedes hacer</span>
                                    <div className="relative w-full max-w-[420px]">
                                        <select
                                            className={`${fieldStyle} ${
                                                selected
                                                    ? "border-[#286575] bg-[#e4f3f5] text-slate-950 ring-2 ring-[#286575]/20"
                                                    : "text-slate-500"
                                            }`}
                                            value={selected ?? ""}
                                            onChange={(e) =>
                                                setAction(
                                                    item.id,
                                                    (e.target.value as ActionKey) || undefined
                                                )
                                            }
                                            disabled={checked}
                                        >
                                            <option value="" className="text-slate-500">
                                                Selecciona...
                                            </option>
                                            {(optionsByCase[item.id] ?? []).map(
                                                (action) => (
                                                    <option
                                                        key={action}
                                                        value={action}
                                                        className="font-semibold text-slate-950"
                                                    >
                                                        {ACTION_LABEL[action]}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#286575]">
                                            <svg
                                                aria-hidden="true"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                {checked && (
                                    <div
                                        className={`mt-3 rounded-xl border p-3 ${
                                            correctNow
                                                ? "border-emerald-500/40 text-emerald-600"
                                                : "border-rose-500/40 text-rose-600"
                                        }`}
                                    >
                                        {correctNow ? (
                                            <p>Correcto.</p>
                                        ) : (
                                            <div>
                                                <p className="font-medium">Revisa:</p>
                                                <ul className="list-inside list-disc">
                                                    <li>
                                                        La opción correcta es:{" "}
                                                        <strong>
                                                            {ACTION_LABEL[item.correct]}
                                                        </strong>
                                                        .
                                                    </li>
                                                    <li>{item.hint}</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
)

RightsExerciseI1.displayName = "RightsExerciseI1"

export default RightsExerciseI1