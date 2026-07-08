"use client"

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react"

type StageId = string

type Stage = {
    id: StageId
    label: string
}

type Scenario = {
    id: string
    title: string
    product: string
    context: string
    expectedImpact: string
    stages: Stage[]
    validOrder: StageId[]
}

const SCENARIOS: Scenario[] = [
    {
        id: "school-chatbot",
        title: "Chatbot de orientación escolar",
        product: "Sistema de respuestas automáticas para dudas frecuentes",
        context:
            "El equipo quiere crear un chatbot sencillo para orientar a estudiantes sobre horarios, salas y trámites escolares",
        expectedImpact:
            "Debe responder de forma clara, evitar información inventada y poder revisarse después de publicarse",
        stages: [
            { id: "define", label: "Definir qué dudas resolverá y cuáles quedarán fuera del chatbot" },
            { id: "prepare", label: "Preparar respuestas verificadas y ejemplos de preguntas frecuentes" },
            { id: "build", label: "Construir un prototipo con el flujo de preguntas y respuestas" },
            { id: "internalTest", label: "Revisar internamente si las respuestas son coherentes y no inventan información" },
            { id: "validate", label: "Probar respuestas con usuarios y corregir errores antes de publicar" },
            { id: "deploy", label: "Publicar el chatbot y monitorear preguntas problemáticas" },
        ],
        validOrder: ["define", "prepare", "build", "internalTest", "validate", "deploy"],
    },
    {
        id: "reminder-app",
        title: "Aplicación de recordatorios",
        product: "App sencilla para organizar tareas semanales",
        context:
            "Un curso necesita una aplicación que permita registrar tareas, fechas importantes y avisos de entrega",
        expectedImpact:
            "La solución debe funcionar sin perder datos y avisar correctamente antes de compartirse con el curso",
        stages: [
            { id: "define", label: "Definir qué tareas y avisos debe gestionar la aplicación" },
            { id: "prepare", label: "Diseñar pantallas, campos y reglas de recordatorio" },
            { id: "build", label: "Programar el prototipo con registro, edición y alertas" },
            { id: "internalTest", label: "Probar internamente ingreso de datos, edición y notificaciones básicas" },
            { id: "validate", label: "Probar fechas, errores de ingreso y funcionamiento de alertas" },
            { id: "deploy", label: "Publicar una versión inicial y revisar reportes de uso" },
        ],
        validOrder: ["define", "prepare", "build", "internalTest", "validate", "deploy"],
    },
    {
        id: "image-classifier",
        title: "Clasificador simple de imágenes",
        product: "Sistema de IA para separar fotos por categoría",
        context:
            "Se quiere crear un sistema que clasifique imágenes de residuos en papel, vidrio, plástico u orgánico",
        expectedImpact:
            "El sistema debe entrenarse con ejemplos adecuados y validarse antes de usar sus resultados",
        stages: [
            { id: "define", label: "Definir categorías y criterios de clasificación" },
            { id: "prepare", label: "Reunir ejemplos variados y revisar calidad de los datos" },
            { id: "build", label: "Entrenar o configurar el modelo con los ejemplos seleccionados" },
            { id: "internalTest", label: "Probar el modelo con ejemplos reservados y revisar patrones de error" },
            { id: "validate", label: "Validar resultados con imágenes nuevas y revisar errores frecuentes" },
            { id: "deploy", label: "Usar el sistema con monitoreo y revisión humana" },
        ],
        validOrder: ["define", "prepare", "build", "internalTest", "validate", "deploy"],
    },
    {
        id: "smart-form",
        title: "Formulario inteligente de inscripción",
        product: "Formulario con validaciones y sugerencias automáticas",
        context:
            "Una organización necesita recibir inscripciones y detectar datos incompletos antes de confirmar cada registro",
        expectedImpact:
            "Debe solicitar solo datos necesarios, validar la información y proteger privacidad antes de publicarse",
        stages: [
            { id: "define", label: "Definir qué datos son necesarios y por qué se solicitan" },
            { id: "prepare", label: "Diseñar campos, reglas de validación y mensajes de ayuda" },
            { id: "build", label: "Construir el formulario con validaciones automáticas" },
            { id: "internalTest", label: "Revisar internamente errores de validación y tratamiento de datos personales" },
            { id: "validate", label: "Probar errores, privacidad y claridad de los mensajes" },
            { id: "deploy", label: "Publicar el formulario y monitorear registros con problemas" },
        ],
        validOrder: ["define", "prepare", "build", "internalTest", "validate", "deploy"],
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

function reorderByIds<T extends { id: string }>(items: T[], draggedId: string, targetId: string) {
    if (draggedId === targetId) return items

    const next = [...items]
    const from = next.findIndex((item) => item.id === draggedId)
    const to = next.findIndex((item) => item.id === targetId)

    if (from < 0 || to < 0) return items

    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
}

function disorderStages(stages: Stage[], validOrder: StageId[], seed?: number) {
    const s = seed ?? Math.random()
    for (let attempt = 0; attempt < 30; attempt++) {
        const candidate = shuffle(stages, s + attempt * 0.017)
        const misplaced = candidate.filter((stage, index) => stage.id !== validOrder[index]).length

        if (misplaced >= Math.max(4, validOrder.length - 1)) return candidate
    }

    return [...stages.slice(1), stages[0]]
}

export type ProgrammingExerciseI2Grade = {
    correctCount: number
    totalCount: number
    quality: "good" | "partial" | "bad"
}

export type ProgrammingExerciseI2Handle = {
    check: () => boolean
    grade: () => ProgrammingExerciseI2Grade
}

const DND_TYPE = "application/ladico-programming-stage"

type Props = {
    seed?: number
}

const ProgrammingExerciseI2 = forwardRef<ProgrammingExerciseI2Handle, Props>(
    function ProgrammingExerciseI2({ seed }, ref) {
        const scenario = useMemo(() => shuffle(SCENARIOS, seed)[0], [seed])
        const [order, setOrder] = useState<Stage[]>([])
        const [dragId, setDragId] = useState<string | null>(null)
        const [overId, setOverId] = useState<string | null>(null)
        const [feedback, setFeedback] = useState<{
            kind: "idle" | "success" | "warning" | "error"
            score?: number
            message?: string
        }>({ kind: "idle" })

        useEffect(() => {
            setOrder(disorderStages(scenario.stages, scenario.validOrder, seed))
        }, [scenario, seed])

        const score = (items = order) =>
            items.reduce(
                (total, stage, index) => total + Number(stage.id === scenario.validOrder[index]),
                0
            )

        const onDragStart = (id: string, e: React.DragEvent) => {
            setDragId(id)
            e.dataTransfer.setData(DND_TYPE, id)
            e.dataTransfer.effectAllowed = "move"
        }

        const onDragEnter = (targetId: string) => {
            setOverId(targetId)
            setOrder((current) => (dragId ? reorderByIds(current, dragId, targetId) : current))
            setFeedback({ kind: "idle" })
        }

        const onDragOver = (e: React.DragEvent) => {
            if (e.dataTransfer.types.includes(DND_TYPE)) e.preventDefault()
        }

        const onDragEnd = () => {
            setDragId(null)
            setOverId(null)
        }

        const check = () => {
            const result = score()
            const ok = result === scenario.validOrder.length

            if (ok) {
                setFeedback({
                    kind: "success",
                    score: result,
                    message:
                        "Secuencia correcta. Reconoces que diseñar, construir, validar y desplegar son etapas distintas.",
                })
                return true
            }

            const approved = result >= 4

            setFeedback({
                kind: approved ? "warning" : "error",
                score: result,
                message:
                    "Revisa el tramo crítico: una solución debe probarse y validarse antes de publicarse o usarse con personas.",
            })
            return approved
        }

        // Puntaje según el Excel ajustado (máx 6, no 5, por la etapa adicional de
        // revisión interna): 6=Alto, 4-5=Medio (aprueba), 0-3=Bajo (no aprueba).
        const computeGrade = (): ProgrammingExerciseI2Grade => {
            const correctCount = score()
            const totalCount = scenario.validOrder.length

            let quality: "good" | "partial" | "bad" = "bad"
            if (correctCount === totalCount) {
                quality = "good"
            } else if (correctCount >= 4) {
                quality = "partial"
            }

            return { correctCount, totalCount, quality }
        }

        useImperativeHandle(ref, () => ({
            check,
            grade: computeGrade,
        }))

        return (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-5">
                    <div className="rounded-2xl border bg-white p-4 shadow">
                        <h3 className="font-semibold text-slate-800">
                            {scenario.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            {scenario.context}
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-800">
                            Producto esperado: {scenario.product}
                        </p>
                    </div>
                </div>

                <ol className="space-y-3">
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
                                }`}
                                draggable
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

                                <span className="rounded-full border border-[#c6dde2] px-3 py-1 text-xs font-semibold text-[#286575]">
                                    Arrastra
                                </span>
                            </li>
                        )
                    })}
                </ol>

                {feedback.kind !== "idle" && (
                    <div
                        role="status"
                        aria-live="assertive"
                        className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                            feedback.kind === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : feedback.kind === "warning"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        <p className="font-semibold">
                            Etapas correctas: {feedback.score}/{scenario.validOrder.length}
                        </p>
                        <p className="mt-1">{feedback.message}</p>
                    </div>
                )}
            </div>
        )
    }
)

ProgrammingExerciseI2.displayName = "ProgrammingExerciseI2"

export default ProgrammingExerciseI2