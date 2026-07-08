"use client"

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react"

type StepId = string

type Step = {
    id: StepId
    label: string
}

type Scenario = {
    id: string
    title: string
    language: string
    goal: string
    preview: string
    steps: Step[]
    validOrders: StepId[][]
}

const SCENARIOS: Scenario[] = [
    {
        id: "js-sum",
        title: "Suma de valores recibidos como texto",
        language: "JavaScript",
        goal:
            "Un asistente de código dejó instrucciones mezcladas. Ordena solo las necesarias para convertir dos textos numéricos, sumarlos y mostrar el resultado correcto",
        preview: `let a = "7";
let b = "5";
// Resultado esperado: 12`,
        steps: [
            { id: "read", label: "Leer las variables a y b" },
            { id: "parse", label: "Convertir a y b a número" },
            { id: "sum", label: "Calcular resultado = a + b" },
            { id: "print", label: "Mostrar resultado en consola" },
            { id: "concat", label: "Unir a y b como texto" },
            { id: "compare", label: "Comparar si a y b son iguales" },
        ],
        validOrders: [["read", "parse", "sum", "print"]],
    },
    {
        id: "python-sum",
        title: "Suma de entradas recibidas como texto",
        language: "Python",
        goal:
            "Un asistente sugirió pasos posibles. Ordena la secuencia que transforma los datos de entrada, calcula la suma y muestra el resultado",
        preview: `a = "8"
b = "4"
# Resultado esperado: 12`,
        steps: [
            { id: "read", label: "Leer las variables a y b" },
            { id: "parse", label: "Convertir a y b a entero con int()" },
            { id: "sum", label: "Calcular resultado = a + b" },
            { id: "print", label: "Mostrar resultado con print" },
            { id: "concat", label: "Unir a y b como texto" },
            { id: "multiply", label: "Multiplicar a por b" },
        ],
        validOrders: [["read", "parse", "sum", "print"]],
    },
    {
        id: "php-total",
        title: "Total de productos recibidos como texto",
        language: "PHP",
        goal:
            "Revisa una secuencia sugerida automáticamente y ordena las instrucciones para convertir dos precios, calcular el total y mostrarlo",
        preview: `$precioA = "2500";
$precioB = "3500";
// Total esperado: 6000`,
        steps: [
            { id: "read", label: "Leer precioA y precioB" },
            { id: "parse", label: "Convertir precioA y precioB a número" },
            { id: "sum", label: "Calcular total = precioA + precioB" },
            { id: "print", label: "Mostrar total en pantalla" },
            { id: "join", label: "Juntar ambos precios como texto" },
            { id: "discount", label: "Aplicar descuento antes de sumar" },
        ],
        validOrders: [["read", "parse", "sum", "print"]],
    },
    {
        id: "java-average",
        title: "Promedio de dos notas recibidas como texto",
        language: "Java",
        goal:
            "Una herramienta de apoyo propuso operaciones mezcladas. Ordena las que permiten convertir dos notas, calcular el promedio y mostrarlo",
        preview: `String nota1 = "6.0";
String nota2 = "5.0";
// Promedio esperado: 5.5`,
        steps: [
            { id: "read", label: "Leer nota1 y nota2" },
            { id: "parse", label: "Convertir nota1 y nota2 a número decimal" },
            { id: "average", label: "Calcular promedio = (nota1 + nota2) / 2" },
            { id: "print", label: "Mostrar promedio en consola" },
            { id: "sumOnly", label: "Mostrar solo la suma de las notas" },
            { id: "compare", label: "Comparar si las notas son iguales" },
        ],
        validOrders: [["read", "parse", "average", "print"]],
    },
]

function shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5)
}

export type ProgrammingQuality = "good" | "partial" | "bad"

export type ProgrammingExerciseI1Grade = {
    score: number
    maxScore: number
    quality: ProgrammingQuality
}

export type ProgrammingExerciseI1Handle = {
    check: () => boolean
    grade: () => ProgrammingExerciseI1Grade
}

const SELECT_STYLE =
    "w-full appearance-none rounded-2xl border px-4 py-3 pr-10 text-sm font-semibold leading-relaxed shadow-sm outline-none transition border-slate-200 bg-white text-slate-950 hover:border-[#286575]/40 focus:border-[#286575] focus:ring-2 focus:ring-[#286575]/20"

const ProgrammingExerciseI1 = forwardRef<ProgrammingExerciseI1Handle, {}>(
    function ProgrammingExerciseI1(_, ref) {
        const scenario = useMemo(() => shuffle(SCENARIOS)[0], [])
        const expectedLength = scenario.validOrders[0].length

        const [sequence, setSequence] = useState<(StepId | "")[]>(
            Array(expectedLength).fill("")
        )
        const [shuffledOptions, setShuffledOptions] = useState<Step[]>(scenario.steps)
        const [feedback, setFeedback] = useState<{
            kind: "idle" | "success" | "error"
            message?: string
        }>({ kind: "idle" })

        useEffect(() => {
            setShuffledOptions(shuffle(scenario.steps))
        }, [scenario])

        const availableOptions = (rowIndex: number) => {
            const selectedElsewhere = new Set(
                sequence
                    .map((step, index) => (index !== rowIndex ? step : ""))
                    .filter(Boolean) as StepId[]
            )
            const current = sequence[rowIndex]

            return shuffledOptions.filter(
                (step) => !selectedElsewhere.has(step.id) || step.id === current
            )
        }

        const onChange = (index: number, value: StepId | "") => {
            const next = [...sequence]
            next[index] = value
            setSequence(next)
            setFeedback({ kind: "idle" })
        }

        // Puntaje por posición (máx 4, uno por cada paso del algoritmo): 1 punto por
        // cada posición que coincide con la secuencia esperada. 4=Alto, 3=Medio
        // (aprueba), 0-2=Bajo (no aprueba).
        const computeGrade = (): ProgrammingExerciseI1Grade => {
            const expected = scenario.validOrders[0]
            const score = expected.reduce(
                (sum, id, index) => sum + (sequence[index] === id ? 1 : 0),
                0
            )

            let quality: ProgrammingQuality = "bad"
            if (score === expected.length) quality = "good"
            else if (score === expected.length - 1) quality = "partial"

            return { score, maxScore: expected.length, quality }
        }

        const check = () => {
            const complete = sequence.every(Boolean)

            if (!complete) {
                setFeedback({
                    kind: "error",
                    message: "Aún faltan pasos por seleccionar antes de comprobar la secuencia.",
                })
                return false
            }

            const grade = computeGrade()

            if (grade.quality === "good") {
                setFeedback({
                    kind: "success",
                    message:
                        "Secuencia correcta. Transformaste los datos y ordenaste las operaciones necesarias.",
                })
            } else if (grade.quality === "partial") {
                setFeedback({
                    kind: "error",
                    message: `Vas bien, pero hay un paso fuera de lugar. Puntaje: ${grade.score}/${grade.maxScore}.`,
                })
            } else {
                setFeedback({
                    kind: "error",
                    message:
                        "Revisa el orden: primero se leen y transforman los datos, luego se calcula y finalmente se muestra el resultado.",
                })
            }

            return grade.quality !== "bad"
        }

        useImperativeHandle(ref, () => ({
            check,
            grade: computeGrade,
        }))

        return (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-5 rounded-2xl bg-[#f3fbfb] p-4">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#e4f3f5] px-3 py-1 text-xs font-semibold text-[#286575]">
                            {scenario.language}
                        </span>
                        <h3 className="font-semibold text-slate-800">
                            {scenario.title}
                        </h3>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-slate-700">
                        {scenario.goal}
                    </p>
                    <pre className="overflow-x-auto rounded-xl border border-[#286575]/15 bg-white px-4 py-3 text-sm font-semibold leading-relaxed" style={{ color: "#286575" }}>
                        {scenario.preview}
                    </pre>
                </div>

                <div className="grid gap-3">
                    {sequence.map((value, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 items-center gap-2 md:grid-cols-[72px,1fr]"
                        >
                            <span className="text-sm font-semibold text-slate-700">
                                Paso {index + 1}
                            </span>
                            <div className="relative">
                                <select
                                    value={value}
                                    onChange={(event) =>
                                        onChange(index, event.target.value as StepId | "")
                                    }
                                    className={`${SELECT_STYLE} ${value ? "pr-16" : ""}`}
                                >
                                    <option value="" disabled className="text-slate-500">
                                        Selecciona una instrucción
                                    </option>
                                    {availableOptions(index).map((step) => (
                                        <option
                                            key={step.id}
                                            value={step.id}
                                            className="font-semibold text-slate-950"
                                        >
                                            {step.label}
                                        </option>
                                    ))}
                                </select>
                                {value ? (
                                    <button
                                        type="button"
                                        onClick={() => onChange(index, "")}
                                        aria-label={`Borrar paso ${index + 1}`}
                                        title="Borrar selección"
                                        className="absolute inset-y-0 right-3 flex items-center px-1 text-slate-400 transition-colors hover:text-rose-600"
                                    >
                                        <svg
                                            aria-hidden="true"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                        </svg>
                                    </button>
                                ) : (
                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#286575]">
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
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {feedback.kind !== "idle" && (
                    <div
                        role="status"
                        aria-live="assertive"
                        className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                            feedback.kind === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        {feedback.message}
                    </div>
                )}
            </div>
        )
    }
)

ProgrammingExerciseI1.displayName = "ProgrammingExerciseI1"

export default ProgrammingExerciseI1