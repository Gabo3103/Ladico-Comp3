"use client"

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react"

type CaseId =
    | "case1"
    | "case2"
    | "case3"
    | "case4"
    | "case5"
    | "case6"
    | "case7"
    | "case8"
    | "case9"
    | "case10"
    | "case11"
    | "case12"
type ConflictKey = "NONE" | "ETHICAL" | "LEGAL"

export type I3Quality = "good" | "partial" | "bad"

export type RightsExerciseI3Grade = {
    correctCount: number
    totalCount: number
    quality: I3Quality
}

export type RightsExerciseI3Handle = {
    check: () => void
    isReady: () => boolean
    reset: () => void
    grade: () => RightsExerciseI3Grade
}

type Props = {
    onReadyChange?: (ready: boolean) => void
}

const CONFLICT_LABEL: Record<ConflictKey, string> = {
    NONE: "Sin desafío relevante",
    ETHICAL: "Desafío ético: sesgo, daño o falta de transparencia",
    LEGAL: "Desafío legal: derechos, permisos o datos protegidos",
}

const CONFLICT_ORDER: ConflictKey[] = ["NONE", "ETHICAL", "LEGAL"]

const CASE_BANK: Array<{
    id: CaseId
    title: string
    description: string
    correct: ConflictKey[]
    explanation: string
}> = [
    {
        id: "case1",
        title: "Artículos de diarios protegidos",
        description:
            "Una empresa copia artículos completos de diarios con copyright para entrenar un modelo comercial, sin permiso de los medios ni información pública sobre ese uso.",
        correct: ["LEGAL", "ETHICAL"],
        explanation:
            "El desafío es legal por uso no autorizado de obras protegidas y ético por falta de transparencia en el uso de contenido ajeno para entrenamiento.",
    },
    {
        id: "case2",
        title: "Fotos privadas de usuarios",
        description:
            "Una plataforma usa fotos privadas de perfiles cerrados para entrenar una IA de reconocimiento visual sin informar ni pedir consentimiento.",
        correct: ["LEGAL", "ETHICAL"],
        explanation:
            "El desafío es legal por uso de datos personales e imagen sin base clara, y ético por privacidad, consentimiento y transparencia.",
    },
    {
        id: "case3",
        title: "Voces femeninas no reconocidas por un auto",
        description:
            "El asistente de voz de un automóvil reconoce bien órdenes de voces masculinas, pero falla con frecuencia con voces femeninas porque el entrenamiento usó principalmente muestras de hombres.",
        correct: ["ETHICAL"],
        explanation:
            "El desafío es ético: hay sesgo de género que puede excluir o perjudicar a un grupo de usuarios. No se plantea uso no autorizado de obras o datos protegidos.",
    },
    {
        id: "case4",
        title: "Selección laboral automatizada",
        description:
            "Un sistema recomienda menos mujeres para puestos técnicos porque aprendió de historiales de contratación antiguos donde las mujeres estaban subrepresentadas.",
        correct: ["ETHICAL"],
        explanation:
            "El desafío es ético por sesgo y posible discriminación en una decisión relevante. El caso no describe una infracción de permisos o copyright.",
    },
    {
        id: "case5",
        title: "Archivo histórico de dominio público",
        description:
            "Un equipo usa cartas históricas de dominio público para entrenar un modelo de transcripción, registra el archivo de origen y publica una nota metodológica sobre el conjunto usado.",
        correct: ["NONE"],
        explanation:
            "No aparece un conflicto relevante: el material es de dominio público y el origen está documentado con transparencia.",
    },
    {
        id: "case6",
        title: "Ilustraciones protegidas para entrenamiento",
        description:
            "Una plataforma reutiliza ilustraciones con copyright para entrenar un generador de imágenes y sostiene que no necesita permiso porque no publica las obras exactas.",
        correct: ["LEGAL", "ETHICAL"],
        explanation:
            "El desafío es legal por uso no autorizado de obras protegidas y ético porque el entrenamiento aprovecha trabajo ajeno sin claridad ni consentimiento.",
    },
    {
        id: "case7",
        title: "Textos de estudiantes sin aviso",
        description:
            "Una institución usa textos producidos por estudiantes para ajustar una IA educativa interna, sin informarles previamente ni explicar cómo se almacenarán.",
        correct: ["ETHICAL"],
        explanation:
            "El desafío es ético por falta de transparencia y consentimiento. El caso no entrega suficientes elementos para clasificarlo como legal.",
    },
    {
        id: "case8",
        title: "Clasificador con baja diversidad",
        description:
            "Un clasificador de imágenes funciona peor con personas de ciertos tonos de piel porque el conjunto de entrenamiento tenía poca diversidad.",
        correct: ["ETHICAL"],
        explanation:
            "El desafío es ético: el sesgo de datos puede producir resultados menos fiables o dañinos para ciertos grupos.",
    },
    {
        id: "case9",
        title: "Repositorio abierto con atribución",
        description:
            "Un equipo usa imágenes de un repositorio abierto con licencia CC BY para entrenar un prototipo educativo, conserva los créditos exigidos y documenta la fuente.",
        correct: ["NONE"],
        explanation:
            "No hay conflicto relevante si la licencia permite el uso, se cumplen sus condiciones y se documenta la procedencia.",
    },
    {
        id: "case10",
        title: "Encuesta anonimizada y autorizada",
        description:
            "Un laboratorio usa respuestas de una encuesta con consentimiento informado, elimina identificadores personales y describe el uso de esos datos en la documentación del modelo.",
        correct: ["NONE"],
        explanation:
            "No se observa conflicto relevante en el caso descrito: hay consentimiento, anonimización y documentación del uso de datos.",
    },
    {
        id: "case11",
        title: "Fotografía con licencia no comercial",
        description:
            "Una agencia usa en un anuncio pagado una fotografía publicada con licencia CC BY-NC, manteniendo el nombre del autor, pero sin pedir permiso adicional.",
        correct: ["LEGAL"],
        explanation:
            "El desafío es legal: la licencia no permite uso comercial sin autorización adicional. El caso no describe sesgo, daño o falta de transparencia relevante.",
    },
    {
        id: "case12",
        title: "Reconocimiento facial en control policial",
        description:
            "Un sistema de reconocimiento facial usado en controles policiales identifica con mucha mayor frecuencia como 'posible sospechoso' a personas de ciertos rasgos físicos o tonos de piel, porque fue entrenado con conjuntos de datos con escasa diversidad racial. El sesgo no fue detectado ni informado antes de su despliegue.",
        correct: ["ETHICAL", "LEGAL"],
        explanation:
            "El desafío es ético por sesgo racializado con consecuencias graves para personas identificadas injustamente, y legal porque el uso discriminatorio de datos puede vulnerar normativas de igualdad y protección de datos personales.",
    },
]

function shuffle<T>(items: T[]): T[] {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

function normalizeCorrect(correct: ConflictKey[] | ConflictKey): ConflictKey[] {
    return Array.isArray(correct) ? correct : [correct]
}

function isNoConflict(item: (typeof CASE_BANK)[number]) {
    const correct = normalizeCorrect(item.correct)
    return correct.length === 1 && correct[0] === "NONE"
}

function pickRandomCases() {
    const noConflictCases = shuffle(CASE_BANK.filter(isNoConflict))
    const conflictCases = shuffle(CASE_BANK.filter((item) => !isNoConflict(item)))
    const includeNoConflict = Math.random() < 0.55

    if (includeNoConflict && noConflictCases.length > 0) {
        return shuffle([...conflictCases.slice(0, 3), noConflictCases[0]])
    }

    return conflictCases.slice(0, 4)
}

function sameSet(a: ConflictKey[] | undefined, b: ConflictKey[] | ConflictKey) {
    const expected = normalizeCorrect(b)
    if (!a) return false
    if (a.length !== expected.length) return false
    return expected.every((item) => a.includes(item))
}

const RightsExerciseI3 = forwardRef<RightsExerciseI3Handle, Props>(
    function RightsExerciseI3({ onReadyChange }, ref) {
        const [visibleCases, setVisibleCases] = useState(() => pickRandomCases())
        const [answers, setAnswers] = useState<Partial<Record<CaseId, ConflictKey[]>>>({})
        const [checked, setChecked] = useState(false)
        const [activeCase, setActiveCase] = useState(0)

        const allAnswered = useMemo(
            () => visibleCases.every((item) => (answers[item.id]?.length ?? 0) > 0),
            [answers, visibleCases]
        )

        useEffect(() => {
            onReadyChange?.(allAnswered)
        }, [allAnswered, onReadyChange])

        // Puntaje por caso: 1 si coincide exactamente, 0 si marca algo que no
        // corresponde (invalida), y 0.5 en los casos que requieren AMBOS conflictos
        // (legal + ético) si solo marca uno de los dos correctamente.
        const caseScore = (caseId: CaseId): number => {
            const item = visibleCases.find((entry) => entry.id === caseId)
            if (!item) return 0

            const expected = normalizeCorrect(item.correct)
            const given = answers[caseId] ?? []
            const matchedCount = expected.filter((id) => given.includes(id)).length
            const extraCount = given.filter((id) => !expected.includes(id)).length

            if (extraCount > 0) return 0
            if (matchedCount === expected.length) return 1
            if (matchedCount >= 1 && expected.length === 2) return 0.5
            return 0
        }

        // Puntaje según el Excel: 4 casos (Identificación de conflicto legal +
        // Sensibilidad ética), con crédito parcial en los casos de doble conflicto.
        // Aprueba con 3 o más.
        const computeGrade = (): RightsExerciseI3Grade => {
            const totalCount = visibleCases.length
            const correctCount = visibleCases.reduce(
                (sum, item) => sum + caseScore(item.id),
                0
            )

            let quality: I3Quality = "bad"
            if (correctCount === totalCount) {
                quality = "good" // 4 puntos: Alto
            } else if (correctCount >= 3) {
                quality = "partial" // 3-3.5 puntos: Medio, aprueba
            } // <3 puntos: Bajo, no aprueba

            return { correctCount, totalCount, quality }
        }

        const toggleConflict = (caseId: CaseId, conflict: ConflictKey) => {
            setAnswers((prev) => {
                const current = prev[caseId] ?? []

                if (conflict === "NONE") {
                    return {
                        ...prev,
                        [caseId]: current.includes("NONE") ? [] : ["NONE"],
                    }
                }

                const withoutNone = current.filter((item) => item !== "NONE")
                const next = withoutNone.includes(conflict)
                    ? withoutNone.filter((item) => item !== conflict)
                    : [...withoutNone, conflict]

                return { ...prev, [caseId]: next }
            })
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
                setActiveCase(0)
                onReadyChange?.(false)
            },
            grade() {
                const result = computeGrade()
                if (allAnswered) setChecked(true)
                return result
            },
        }))

        return (
            <div className="space-y-5 rounded-2xl border bg-white p-6">
                {/* Puntos de navegación */}
                <div className="flex items-center justify-center gap-2">
                    {visibleCases.map((item, idx) => {
                        const isAnswered = (answers[item.id]?.length ?? 0) > 0
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
                {visibleCases.map((item, idx) => {
                    if (idx !== activeCase) return null
                    const selected = answers[item.id] ?? []
                    const caseScoreNow = checked ? caseScore(item.id) : null
                    const expectedConflicts = normalizeCorrect(item.correct)

                    return (
                        <div key={item.id} className="rounded-2xl border p-4 shadow-sm">
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    {item.title}
                                </h3>
                                <p className="mt-1 text-justify text-sm leading-relaxed text-gray-600">
                                    {item.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                {CONFLICT_ORDER.map((conflict) => {
                                    const isPicked = selected.includes(conflict)
                                    return (
                                        <label
                                            key={conflict}
                                            className={`flex cursor-pointer select-none items-start gap-3 rounded-2xl border p-3 text-sm transition ${
                                                isPicked
                                                    ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                                    : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-sm"
                                            } ${checked ? "cursor-not-allowed opacity-80" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isPicked}
                                                disabled={checked}
                                                onChange={() => toggleConflict(item.id, conflict)}
                                                className="mt-1 h-5 w-5 shrink-0 rounded accent-[#286575]"
                                            />
                                            <span className="font-medium leading-relaxed text-slate-800">
                                                {CONFLICT_LABEL[conflict]}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>

                            {checked && (
                                <div
                                    className={`mt-3 rounded-xl border p-3 text-sm ${
                                        caseScoreNow === 1
                                            ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                                            : caseScoreNow === 0.5
                                            ? "border-amber-500/40 bg-amber-50 text-amber-700"
                                            : "border-rose-500/40 bg-rose-50 text-rose-700"
                                    }`}
                                >
                                    {caseScoreNow === 1 ? (
                                        <p>Correcto. {item.explanation}</p>
                                    ) : caseScoreNow === 0.5 ? (
                                        <div>
                                            <p className="font-medium">Parcialmente correcto (0.5 punto):</p>
                                            <p>
                                                Este caso presenta dos desafíos a la vez:{" "}
                                                <strong>
                                                    {expectedConflicts
                                                        .map((conflict) => CONFLICT_LABEL[conflict])
                                                        .join(" + ")}
                                                </strong>
                                                . Identificaste solo uno de los dos.
                                            </p>
                                            <p className="mt-1">{item.explanation}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-medium">Revisa:</p>
                                            <p>
                                                La clasificación esperada es:{" "}
                                                <strong>
                                                    {expectedConflicts
                                                        .map((conflict) => CONFLICT_LABEL[conflict])
                                                        .join(" + ")}
                                                </strong>
                                                .
                                            </p>
                                            <p className="mt-1">{item.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Navegación prev/next */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
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
                        {visibleCases.filter((c) => (answers[c.id]?.length ?? 0) > 0).length}
                        /{visibleCases.length} respondidos
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setActiveCase((i) => Math.min(visibleCases.length - 1, i + 1))
                        }
                        disabled={activeCase === visibleCases.length - 1}
                        className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                            activeCase === visibleCases.length - 1
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                        }`}
                    >
                        Siguiente
                        <span
                            className={`inline-block transition-transform duration-300 ${
                                activeCase !== visibleCases.length - 1
                                    ? "group-hover:translate-x-1"
                                    : ""
                            }`}
                            aria-hidden
                        >
                            →
                        </span>
                    </button>
                </div>
            </div>
        )
    }
)

RightsExerciseI3.displayName = "RightsExerciseI3"

export default RightsExerciseI3