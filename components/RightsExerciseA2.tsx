"use client"

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react"

export type RightsExerciseA2Handle = {
    check: (opts?: { silent?: boolean }) => boolean
    isReady: () => boolean
    reset: () => void
}

type Action =
    | "PUBLISH_FREELY"
    | "PUBLISH_WITH_ATTRIBUTION"
    | "REQUEST_PERMISSION"
    | "REVIEW_TERMS"
    | "AVOID_COMMERCIAL"

type Reason =
    | "USES_PROTECTED_WORKS"
    | "OPEN_LICENSE_CONDITIONS"
    | "PUBLIC_DOMAIN_USE"
    | "AI_TRAINING_DATASET"
    | "AI_GENERATED_OUTPUT"
    | "RESEMBLES_PROTECTED_IP"
    | "NO_CLEAR_LICENSE"
    | "PERMISSION_LIMITS"

type Dimension = "reason" | "action"

type CaseItem = {
    id: string
    group: "training" | "generated" | "license" | "hybrid"
    title: string
    context: string
    correct: {
        reason: Reason
        action: Action
    }
    reasonOptions: Reason[]
    actionOptions: Action[]
    feedback: string
}

type Props = {
    onEvaluate?: (point: 0 | 1) => void
    onReadyChange?: (ready: boolean) => void
    seed?: number
}

type Answer = Partial<Record<Dimension, string>>

const actionLabel: Record<Action, string> = {
    PUBLISH_FREELY: "Publicar libremente",
    PUBLISH_WITH_ATTRIBUTION: "Publicar con atribución",
    REQUEST_PERMISSION: "Solicitar permiso o licencia",
    REVIEW_TERMS: "Revisar términos legales",
    AVOID_COMMERCIAL: "Evitar uso comercial",
}

const reasonLabel: Record<Reason, string> = {
    USES_PROTECTED_WORKS: "Usa obras protegidas",
    OPEN_LICENSE_CONDITIONS: "La licencia permite reutilización con condiciones",
    PUBLIC_DOMAIN_USE: "El recurso está en dominio público o CC0",
    AI_TRAINING_DATASET: "El contenido fue usado como dataset de IA",
    AI_GENERATED_OUTPUT: "Es una salida generada por IA",
    RESEMBLES_PROTECTED_IP: "Imita propiedad intelectual reconocible",
    NO_CLEAR_LICENSE: "No existe licencia clara",
    PERMISSION_LIMITS: "El permiso tiene límites de uso",
}

const CASE_BANK: CaseItem[] = [
    {
        id: "training-news",
        group: "training",
        title: "Asistente informativo",
        context:
            "Una empresa mejora las respuestas de su asistente comercial incorporando miles de artículos completos obtenidos desde medios digitales, sin acuerdo previo con esos medios.",
        correct: {
            reason: "AI_TRAINING_DATASET",
            action: "REVIEW_TERMS",
        },
        reasonOptions: [
            "AI_TRAINING_DATASET",
            "AI_GENERATED_OUTPUT",
            "PUBLIC_DOMAIN_USE",
            "OPEN_LICENSE_CONDITIONS",
        ],
        actionOptions: [
            "REVIEW_TERMS",
            "REQUEST_PERMISSION",
            "PUBLISH_WITH_ATTRIBUTION",
            "PUBLISH_FREELY",
        ],
        feedback:
            "El foco está en el uso de contenido como datos de entrenamiento. La acción más prudente es revisar términos, permisos y reglas aplicables antes de usarlo.",
    },
    {
        id: "training-pirated-films",
        group: "training",
        title: "Sistema de video",
        context:
            "Una startup descarga películas desde sitios no autorizados y las usa como material base para que su sistema aprenda a crear nuevas escenas.",
        correct: {
            reason: "USES_PROTECTED_WORKS",
            action: "REQUEST_PERMISSION",
        },
        reasonOptions: [
            "USES_PROTECTED_WORKS",
            "AI_GENERATED_OUTPUT",
            "PUBLIC_DOMAIN_USE",
            "NO_CLEAR_LICENSE",
        ],
        actionOptions: [
            "REQUEST_PERMISSION",
            "REVIEW_TERMS",
            "PUBLISH_WITH_ATTRIBUTION",
            "PUBLISH_FREELY",
        ],
        feedback:
            "El origen del material es problemático: se usan obras protegidas obtenidas sin autorización.",
    },
    {
        id: "training-cc-by-books",
        group: "training",
        title: "Biblioteca educativa",
        context:
            "Una universidad incorpora a su sistema educativo libros publicados con una licencia abierta que permite reutilización, manteniendo registro de autores y condiciones de uso.",
        correct: {
            reason: "OPEN_LICENSE_CONDITIONS",
            action: "PUBLISH_WITH_ATTRIBUTION",
        },
        reasonOptions: [
            "OPEN_LICENSE_CONDITIONS",
            "AI_GENERATED_OUTPUT",
            "RESEMBLES_PROTECTED_IP",
            "PERMISSION_LIMITS",
        ],
        actionOptions: [
            "PUBLISH_WITH_ATTRIBUTION",
            "REVIEW_TERMS",
            "REQUEST_PERMISSION",
            "AVOID_COMMERCIAL",
        ],
        feedback:
            "La licencia abierta permite reutilización, pero exige respetar condiciones como atribución y trazabilidad.",
    },
    {
        id: "generated-landscape",
        group: "generated",
        title: "Imagen para portada",
        context:
            "Una persona crea una imagen de paisaje desde una instrucción escrita propia, sin solicitar que copie una obra, personaje o estilo específico.",
        correct: {
            reason: "AI_GENERATED_OUTPUT",
            action: "REVIEW_TERMS",
        },
        reasonOptions: [
            "AI_GENERATED_OUTPUT",
            "AI_TRAINING_DATASET",
            "USES_PROTECTED_WORKS",
            "OPEN_LICENSE_CONDITIONS",
        ],
        actionOptions: [
            "REVIEW_TERMS",
            "PUBLISH_FREELY",
            "PUBLISH_WITH_ATTRIBUTION",
            "REQUEST_PERMISSION",
        ],
        feedback:
            "Es una salida generada por IA. Aunque no copie una obra específica, conviene revisar los términos de la herramienta antes de publicar.",
    },
    {
        id: "generated-pixar-style",
        group: "generated",
        title: "Arte para redes",
        context:
            "Un creador publica una imagen nueva creada con una herramienta digital, pero sus personajes, colores y universo visual son claramente reconocibles como una franquicia comercial.",
        correct: {
            reason: "RESEMBLES_PROTECTED_IP",
            action: "AVOID_COMMERCIAL",
        },
        reasonOptions: [
            "RESEMBLES_PROTECTED_IP",
            "PUBLIC_DOMAIN_USE",
            "AI_TRAINING_DATASET",
            "OPEN_LICENSE_CONDITIONS",
        ],
        actionOptions: [
            "AVOID_COMMERCIAL",
            "REVIEW_TERMS",
            "PUBLISH_WITH_ATTRIBUTION",
            "PUBLISH_FREELY",
        ],
        feedback:
            "Aunque sea generado por IA, la similitud con personajes, marcas o universos protegidos puede generar riesgo.",
    },
    {
        id: "generated-paper-summary",
        group: "generated",
        title: "Texto académico breve",
        context:
            "Un equipo produce un texto nuevo con ayuda automática a partir de resúmenes de papers científicos, incluyendo una bibliografía al final.",
        correct: {
            reason: "AI_GENERATED_OUTPUT",
            action: "REVIEW_TERMS",
        },
        reasonOptions: [
            "AI_GENERATED_OUTPUT",
            "USES_PROTECTED_WORKS",
            "PUBLIC_DOMAIN_USE",
            "PERMISSION_LIMITS",
        ],
        actionOptions: [
            "REVIEW_TERMS",
            "PUBLISH_WITH_ATTRIBUTION",
            "REQUEST_PERMISSION",
            "PUBLISH_FREELY",
        ],
        feedback:
            "Es contenido generado con IA. El riesgo depende de cuánto reproduce las fuentes, de las citas y de los términos de uso.",
    },
    {
        id: "cc-by-sa-blog",
        group: "license",
        title: "Imagen para blog",
        context:
            "Un blog comercial quiere usar una fotografía cuya página de origen permite reutilizarla si se reconoce autor, licencia y enlace, y si las adaptaciones mantienen condiciones equivalentes.",
        correct: {
            reason: "OPEN_LICENSE_CONDITIONS",
            action: "PUBLISH_WITH_ATTRIBUTION",
        },
        reasonOptions: [
            "OPEN_LICENSE_CONDITIONS",
            "AI_GENERATED_OUTPUT",
            "NO_CLEAR_LICENSE",
            "RESEMBLES_PROTECTED_IP",
        ],
        actionOptions: [
            "PUBLISH_WITH_ATTRIBUTION",
            "PUBLISH_FREELY",
            "REQUEST_PERMISSION",
            "AVOID_COMMERCIAL",
        ],
        feedback:
            "La licencia abierta permite reutilización, incluso comercial, si se cumplen atribución y condiciones asociadas.",
    },
    {
        id: "downloaded-photo-no-license",
        group: "license",
        title: "Recurso encontrado en la web",
        context:
            "Una persona toma una fotografía desde una página web donde no aparecen autor, permiso de reutilización ni condiciones de uso.",
        correct: {
            reason: "NO_CLEAR_LICENSE",
            action: "REQUEST_PERMISSION",
        },
        reasonOptions: [
            "NO_CLEAR_LICENSE",
            "PUBLIC_DOMAIN_USE",
            "AI_GENERATED_OUTPUT",
            "OPEN_LICENSE_CONDITIONS",
        ],
        actionOptions: [
            "REQUEST_PERMISSION",
            "REVIEW_TERMS",
            "PUBLISH_WITH_ATTRIBUTION",
            "PUBLISH_FREELY",
        ],
        feedback:
            "Que esté en internet no significa libre uso. Si no hay licencia clara, debe asumirse restricción y pedir permiso o buscar alternativa.",
    },
    {
        id: "public-domain-music",
        group: "license",
        title: "Audio de museo digital",
        context:
            "Un video escolar usa una pieza musical que la biblioteca digital de un museo identifica como libre de restricciones patrimoniales vigentes.",
        correct: {
            reason: "PUBLIC_DOMAIN_USE",
            action: "PUBLISH_FREELY",
        },
        reasonOptions: [
            "PUBLIC_DOMAIN_USE",
            "OPEN_LICENSE_CONDITIONS",
            "AI_TRAINING_DATASET",
            "NO_CLEAR_LICENSE",
        ],
        actionOptions: [
            "PUBLISH_FREELY",
            "PUBLISH_WITH_ATTRIBUTION",
            "REQUEST_PERMISSION",
            "REVIEW_TERMS",
        ],
        feedback:
            "El dominio público permite uso amplio. Citar la fuente sigue siendo una buena práctica académica.",
    },
    {
        id: "franchise-style-prompt",
        group: "hybrid",
        title: "Afiche de campaña",
        context:
            "Una agencia crea un afiche para una campaña pagada usando una instrucción que pide imitar exactamente un personaje y universo visual de una saga comercial conocida.",
        correct: {
            reason: "RESEMBLES_PROTECTED_IP",
            action: "AVOID_COMMERCIAL",
        },
        reasonOptions: [
            "RESEMBLES_PROTECTED_IP",
            "PUBLIC_DOMAIN_USE",
            "AI_TRAINING_DATASET",
            "OPEN_LICENSE_CONDITIONS",
        ],
        actionOptions: [
            "AVOID_COMMERCIAL",
            "REVIEW_TERMS",
            "REQUEST_PERMISSION",
            "PUBLISH_FREELY",
        ],
        feedback:
            "El prompt busca imitar propiedad intelectual reconocible. El riesgo aumenta si el uso es comercial.",
    },
    {
        id: "museum-cc0-image-ai-remix",
        group: "hybrid",
        title: "Recurso de colección abierta",
        context:
            "Un museo ofrece una imagen marcada como libre para reutilización sin obligación de permiso, y un usuario la toma como base para crear una variante visual.",
        correct: {
            reason: "PUBLIC_DOMAIN_USE",
            action: "PUBLISH_FREELY",
        },
        reasonOptions: [
            "PUBLIC_DOMAIN_USE",
            "USES_PROTECTED_WORKS",
            "NO_CLEAR_LICENSE",
            "RESEMBLES_PROTECTED_IP",
        ],
        actionOptions: [
            "PUBLISH_FREELY",
            "PUBLISH_WITH_ATTRIBUTION",
            "REVIEW_TERMS",
            "REQUEST_PERMISSION",
        ],
        feedback:
            "La base CC0 permite reutilización amplia. Si no incorpora otros elementos protegidos, puede publicarse sin pedir permiso adicional.",
    },
]

function shuffle<T>(items: T[], seed = Math.random()): T[] {
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

function pickCases(seed?: number): CaseItem[] {
    const s = seed ?? Math.random()
    const aiCase = shuffle(
        CASE_BANK.filter((item) => item.group === "training" || item.group === "generated"),
        s + 0.13
    )[0]
    const generalCase = shuffle(
        CASE_BANK.filter((item) => item.group === "license" || item.group === "hybrid"),
        s + 0.29
    )[0]

    return shuffle([aiCase, generalCase], s + 0.41)
}

const RightsExerciseA2 = forwardRef<RightsExerciseA2Handle, Props>(
    function RightsExerciseA2({ onEvaluate, onReadyChange, seed }, ref) {
        const [visibleCases, setVisibleCases] = useState<CaseItem[]>(() => pickCases(seed))
        const [answers, setAnswers] = useState<Record<string, Answer>>({})
        const [checked, setChecked] = useState(false)
        const [activeCase, setActiveCase] = useState(0)

        const allAnswered = useMemo(
            () =>
                visibleCases.every((item) => {
                    const answer = answers[item.id]
                    return answer?.reason && answer.action
                }),
            [answers, visibleCases]
        )

        const optionSets = useMemo(() => {
            return visibleCases.reduce<
                Record<string, { reasonOptions: Reason[]; actionOptions: Action[] }>
            >(
                (sets, item) => {
                    sets[item.id] = {
                        reasonOptions: shuffle(item.reasonOptions),
                        actionOptions: shuffle(item.actionOptions),
                    }
                    return sets
                },
                {}
            )
        }, [visibleCases])

        useEffect(() => {
            onReadyChange?.(allAnswered)
        }, [allAnswered, onReadyChange])

        const setAnswer = (caseId: string, dimension: Dimension, value: string) => {
            setAnswers((prev) => ({
                ...prev,
                [caseId]: {
                    ...prev[caseId],
                    [dimension]: value,
                },
            }))
        }

        const scoreCase = (item: CaseItem) => {
            const answer = answers[item.id]
            if (!answer) return 0

            return (
                (answer.reason === item.correct.reason ? 1 : 0) +
                (answer.action === item.correct.action ? 1 : 0)
            )
        }

        const totalScore = () =>
            visibleCases.reduce((total, item) => total + scoreCase(item), 0)

        const maxScore = visibleCases.length * 2

        // Bandas según la planilla ajustada: 4=Alto, 3=Medio (aprueba, ≥75%), 0-2=Bajo.
        const performanceLevel = (): "Alto" | "Medio" | "Bajo" => {
            const score = totalScore()
            if (score === maxScore) return "Alto"
            if (score >= Math.ceil(maxScore * 0.75)) return "Medio"
            return "Bajo"
        }

        const handleCheck = (opts?: { silent?: boolean }) => {
            if (!allAnswered) return false

            const ok = totalScore() >= Math.ceil(maxScore * 0.75)
            if (!opts?.silent) setChecked(true)
            onEvaluate?.(ok ? 1 : 0)
            return ok
        }

        useImperativeHandle(ref, () => ({
            check: (opts) => handleCheck(opts),
            isReady: () => allAnswered,
            reset: () => {
                setVisibleCases(pickCases())
                setAnswers({})
                setChecked(false)
                setActiveCase(0)
                onReadyChange?.(false)
            },
        }))

        const renderChoiceGroup = (
            item: CaseItem,
            dimension: Dimension,
            options: Array<{ value: string; label: string }>
        ) => {
            const selected = answers[item.id]?.[dimension]
            const helperText: Record<Dimension, string> = {
                reason:
                    "Elige el motivo central que explica por qué ese recurso puede o no puede reutilizarse.",
                action:
                    "Selecciona la acción más responsable antes de publicar, reutilizar o integrar el recurso.",
            }
            const dimensionMeta: Record<Dimension, { label: string; icon: string }> = {
                reason: { label: "Razón principal", icon: "🔍" },
                action: { label: "Acción recomendada", icon: "❗" },
            }

            return (
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] text-white"
                            style={{ backgroundColor: "#286575" }}
                        >
                            {dimensionMeta[dimension].icon}
                        </span>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                            {dimensionMeta[dimension].label}
                        </p>
                    </div>
                    <p className="mb-3 ml-8 text-xs leading-relaxed text-slate-500">
                        {helperText[dimension]}
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3">
                        {options.map((option) => {
                            const active = selected === option.value
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        setAnswer(item.id, dimension, option.value)
                                    }
                                    className={`rounded-xl border px-5 py-3 text-left text-sm leading-snug transition-colors ${
                                        active
                                            ? "border-[#286575] bg-[#e4f3f5] font-medium text-[#1d4f5c] shadow-sm"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-[#286575]/40 hover:bg-slate-50"
                                    } disabled:cursor-default`}
                                >
                                    {option.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )
        }

        return (
            <section className="space-y-5 rounded-2xl border bg-white p-6">
                {/* Puntos de navegación */}
                <div className="flex items-center justify-center gap-2">
                    {visibleCases.map((item, idx) => {
                        const answer = answers[item.id]
                        const isAnswered = !!(answer?.reason && answer?.action)
                        const isActive = idx === activeCase

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveCase(idx)}
                                aria-label={`Ir al caso ${idx + 1}`}
                                className={`h-2.5 rounded-full transition-all duration-200 ${
                                    isActive
                                        ? "w-7 bg-[#286575] shadow-md ring-2 ring-[#286575]/30 ring-offset-2"
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
                    const caseScore = checked ? scoreCase(item) : null

                    return (
                        <article
                            key={item.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                        >
                            <div className="border-b border-[#286575]/15 bg-[#eef6f7] px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#286575]">
                                    Caso {idx + 1} de {visibleCases.length}
                                </p>
                                <h4 className="mt-0.5 text-sm font-semibold text-[#1d4f5c]">
                                    {item.title}
                                </h4>
                            </div>

                            <div className="space-y-4 p-4">
                                <p className="text-justify text-sm leading-relaxed text-gray-600">
                                    {item.context}
                                </p>

                                <div className="space-y-4 divide-y divide-slate-100">
                                    <div>
                                        {renderChoiceGroup(
                                            item,
                                            "reason",
                                            optionSets[item.id].reasonOptions.map((value) => ({
                                                value,
                                                label: reasonLabel[value],
                                            }))
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        {renderChoiceGroup(
                                            item,
                                            "action",
                                            optionSets[item.id].actionOptions.map((value) => ({
                                                value,
                                                label: actionLabel[value],
                                            }))
                                        )}
                                    </div>
                                </div>

                                {checked && (
                                    <div
                                        className={`rounded-xl border p-3 text-sm ${
                                            caseScore === 2
                                                ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                                                : caseScore === 1
                                                ? "border-amber-500/40 bg-amber-50 text-amber-700"
                                                : "border-rose-500/40 bg-rose-50 text-rose-700"
                                        }`}
                                    >
                                        <p className="font-medium">
                                            Puntaje del caso: {caseScore}/2
                                        </p>
                                        <p className="mt-1">{item.feedback}</p>
                                    </div>
                                )}
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
                        {
                            visibleCases.filter((c) => {
                                const a = answers[c.id]
                                return !!(a?.reason && a?.action)
                            }).length
                        }
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

                {checked && (
                    <div
                        className={`rounded-xl border p-3 text-sm ${
                            performanceLevel() === "Alto"
                                ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                                : performanceLevel() === "Medio"
                                ? "border-amber-500/40 bg-amber-50 text-amber-700"
                                : "border-rose-500/40 bg-rose-50 text-rose-700"
                        }`}
                    >
                        <p className="font-semibold">
                            Resultado: {totalScore()} de {maxScore} — Nivel {performanceLevel()}
                        </p>
                        <p className="mt-1">
                            {performanceLevel() === "Alto"
                                ? "Categorizas y decides correctamente en ambos casos."
                                : performanceLevel() === "Medio"
                                ? "Aprobado. Acertaste la mayoría de las respuestas, revisa el detalle de cada caso."
                                : "No aprobado. Revisa si reconoces bien cuándo se aplica el derecho de autor y qué acción corresponde."}
                        </p>
                    </div>
                )}
            </section>
        )
    }
)

RightsExerciseA2.displayName = "RightsExerciseA2"

export default RightsExerciseA2