"use client"

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react"
import alasql from "alasql/dist/alasql.min.js"

type FlowerRow = { id: number; nombre: string; precio: number }

export type ProgrammingExerciseA2Handle = {
    finish: (opts?: { silent?: boolean }) => boolean
    check: (opts?: { silent?: boolean }) => boolean
    isReady: () => boolean
}

type Props = {
    onFinish?: (point: 0 | 1) => void
    onReadyChange?: (ready: boolean) => void
    seed?: number
}

type PromptOption = {
    id: string
    label: string
}

type OutputOption = {
    id: string
    query: string
}

type RoutineCase = {
    id: string
    title: string
    routine: string
    initialPrompt: string
    expectedPrompt: string
    expectedOutput: string
    promptOptions: PromptOption[]
    outputOptions: OutputOption[]
    predicate: (row: FlowerRow) => boolean
}

const DATASET_FILES = [
    "/datasets/flores_dataset_1.csv",
    "/datasets/flores_dataset_2.csv",
    "/datasets/flores_dataset_3.csv",
]

const ROUTINE_CASES: RoutineCase[] = [
    {
        id: "premium-report",
        title: "Reporte semanal de productos premium",
        routine:
            "Cada viernes se debe preparar una lista de flores cuyo precio sea estrictamente mayor a 15 para enviarla al equipo de ventas.",
        initialPrompt: "Haz una consulta para ver las flores caras.",
        expectedPrompt: "specific-price-over-15",
        expectedOutput: "sql-price-over-15",
        predicate: (row) => row.precio > 15,
        promptOptions: [
            {
                id: "specific-price-over-15",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, nombre y precio de flores con precio mayor a 15.",
            },
            {
                id: "specific-price-from-15",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, nombre y precio de flores con precio desde 15.",
            },
            {
                id: "ordered-premium",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, nombre y precio ordenados por precio descendente.",
            },
            {
                id: "missing-column-premium",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva nombre y precio de flores con precio mayor a 15.",
            },
        ],
        outputOptions: [
            {
                id: "sql-price-over-15",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio > 15",
            },
            {
                id: "sql-price-at-least-15",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio >= 15",
            },
            {
                id: "sql-price-all-order",
                query: "SELECT id, nombre, precio FROM FLORES ORDER BY precio DESC",
            },
            {
                id: "sql-price-over-15-limited",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio > 15 LIMIT 10",
            },
        ],
    },
    {
        id: "budget-list",
        title: "Lista de alternativas económicas",
        routine:
            "Antes de actualizar el catálogo, se necesita obtener automáticamente las flores cuyo precio sea menor o igual a 10.",
        initialPrompt: "Saca las flores baratas de la tabla.",
        expectedPrompt: "specific-price-under-10",
        expectedOutput: "sql-price-under-10",
        predicate: (row) => row.precio <= 10,
        promptOptions: [
            {
                id: "specific-price-under-10",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, nombre y precio cuando el precio sea menor o igual a 10.",
            },
            {
                id: "specific-price-less-10",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, nombre y precio cuando el precio sea menor que 10.",
            },
            {
                id: "lowest-five",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, nombre y precio ordenados de menor a mayor, limitando a cinco filas.",
            },
            {
                id: "missing-column-budget",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id y precio cuando el precio sea menor o igual a 10.",
            },
        ],
        outputOptions: [
            {
                id: "sql-price-under-10",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio <= 10",
            },
            {
                id: "sql-price-less-10",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio < 10",
            },
            {
                id: "sql-lowest-five",
                query: "SELECT id, nombre, precio FROM FLORES ORDER BY precio ASC LIMIT 5",
            },
            {
                id: "sql-price-under-10-limited",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio <= 10 LIMIT 5",
            },
        ],
    },
    {
        id: "midrange-selection",
        title: "Selección para promoción intermedia",
        routine:
            "Para una campaña mensual se requiere automatizar una lista de flores con precio entre 10 y 20, incluyendo ambos valores.",
        initialPrompt: "Prepara una consulta para una promoción de precio medio.",
        expectedPrompt: "specific-between-10-20",
        expectedOutput: "sql-between-10-20",
        predicate: (row) => row.precio >= 10 && row.precio <= 20,
        promptOptions: [
            {
                id: "specific-between-10-20",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, nombre y precio para flores con precio entre 10 y 20 inclusive.",
            },
            {
                id: "exclusive-between-10-20",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, nombre y precio para flores con precio mayor que 10 y menor que 20.",
            },
            {
                id: "outside-range",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, nombre y precio para flores con precio menor o igual a 10 o mayor o igual a 20.",
            },
            {
                id: "missing-upper-bound",
                label:
                    "Genera una consulta SELECT sobre FLORES que devuelva id, precio y nombre para flores con precio mayor o igual a 10.",
            },
        ],
        outputOptions: [
            {
                id: "sql-between-10-20",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio >= 10 AND precio <= 20",
            },
            {
                id: "sql-between-exclusive",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio > 10 AND precio < 20",
            },
            {
                id: "sql-two-conditions-or",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio <= 10 OR precio >= 20",
            },
            {
                id: "sql-between-10-20-limited",
                query: "SELECT id, nombre, precio FROM FLORES WHERE precio >= 10 AND precio <= 20 LIMIT 8",
            },
        ],
    },
]

function parseCSV(text: string): FlowerRow[] {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length <= 1) return []
    const header = lines[0].split(",").map((s) => s.trim().toLowerCase())
    const iId = header.indexOf("id")
    const iNombre = header.indexOf("nombre")
    const iPrecio = header.indexOf("precio")

    return lines.slice(1).map((line) => {
        const cols = line.split(",")
        return {
            id: Number(cols[iId]),
            nombre: String(cols[iNombre]),
            precio: Number(cols[iPrecio]),
        }
    })
}

function shuffle<T>(items: readonly T[]) {
    return [...items].sort(() => Math.random() - 0.5)
}

const FORBIDDEN_SQL_TOKENS =
    /\b(insert|update|delete|drop|create|alter|truncate|replace|merge|union|join|into|exec|execute|attach|detach|pragma|script|declare|grant|revoke)\b/i

function sanitizeSqlInput(value: string) {
    return value
        .replace(/[;'"`\\[\]{}]/g, "")
        .replace(/--|\/\*|\*\//g, "")
        .replace(/[^\w\s*,().<>=-]/g, "")
        .slice(0, 220)
}

function validateSafeSelect(query: string) {
    const compact = sanitizeSqlInput(query).trim().replace(/\s+/g, " ")

    if (!compact) return compact
    if (FORBIDDEN_SQL_TOKENS.test(compact)) {
        throw new Error("La consulta contiene una palabra no permitida para este ejercicio")
    }
    if (!/^\s*select\b/i.test(compact)) {
        throw new Error("Solo se permiten consultas SELECT")
    }

    const safePattern =
        /^select\s+(?:\*|id\s*,\s*nombre\s*,\s*precio)\s+from\s+flores(?:\s+where\s+precio\s*(?:>=|<=|>|<|=)\s*\d+(?:\s+(?:and|or)\s+precio\s*(?:>=|<=|>|<|=)\s*\d+)?)?(?:\s+order\s+by\s+precio\s+(?:asc|desc))?(?:\s+limit\s+\d+)?$/i

    if (!safePattern.test(compact)) {
        throw new Error("Usa solo SELECT sobre FLORES con id, nombre, precio y condiciones simples sobre precio")
    }

    return compact
}

function sanitizeNumberInput(value: string) {
    return value.replace(/\D/g, "").slice(0, 3)
}

const ProgrammingExerciseA2 = forwardRef<ProgrammingExerciseA2Handle, Props>(
    function ProgrammingExerciseA2({ onFinish, onReadyChange, seed }, ref) {
        const s = seed ?? Math.random()
        const [datasetUrl] = useState(
            DATASET_FILES[Math.floor((((s + 0.31) % 1)) * DATASET_FILES.length)]
        )
        const [routine] = useState(
            () => ROUTINE_CASES[Math.floor(s * ROUTINE_CASES.length)]
        )
        const promptOptions = useMemo(() => shuffle(routine.promptOptions), [routine])
        const outputOptions = useMemo(() => shuffle(routine.outputOptions), [routine])

        const [rows, setRows] = useState<FlowerRow[]>([])
        const [filteredRows, setFilteredRows] = useState<FlowerRow[]>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)

        const [promptChoice, setPromptChoice] = useState<string | null>(null)
        const [outputChoice, setOutputChoice] = useState<string | null>(null)
        const [sql, setSql] = useState("")
        const [answer, setAnswer] = useState("")
        const [hasRun, setHasRun] = useState(false)
        const [feedback, setFeedback] = useState<{
            score: number
            kind: "success" | "warning" | "error"
            message: string
        } | null>(null)
        const [lastCorrect, setLastCorrect] = useState(false)
        const [openPanel, setOpenPanel] = useState<1 | 2 | 3>(1)

        const isReady = !!promptChoice && !!outputChoice && hasRun && answer !== ""

        useEffect(() => {
            onReadyChange?.(isReady)
        }, [isReady, onReadyChange])

        const expectedRows = useMemo(() => rows.filter(routine.predicate), [rows, routine])

        useEffect(() => {
            let cancelled = false

            const load = async () => {
                try {
                    setLoading(true)
                    setError(null)

                    const res = await fetch(datasetUrl, { cache: "no-store" })
                    if (!res.ok) throw new Error(`No se pudo cargar ${datasetUrl}`)
                    const text = await res.text()
                    const data = parseCSV(text)

                    if (cancelled) return
                    setRows(data)
                    setFilteredRows(data)

                    alasql("DROP TABLE IF EXISTS FLORES")
                    alasql("CREATE TABLE FLORES (id INT, nombre STRING, precio INT)")
                    alasql("INSERT INTO FLORES SELECT * FROM ?", [data])
                } catch (e: any) {
                    if (!cancelled) setError(e?.message || "Error al cargar el dataset")
                } finally {
                    if (!cancelled) setLoading(false)
                }
            }

            load()
            return () => {
                cancelled = true
            }
        }, [datasetUrl])

        function selectOutput(option: OutputOption) {
            setOutputChoice(option.id)
            setSql(option.query)
            setHasRun(false)
            setFeedback(null)
            setOpenPanel(3)
        }

        function selectPrompt(optionId: string) {
            setPromptChoice(optionId)
            setFeedback(null)
            setOpenPanel(2)
        }

        function runQuery() {
            try {
                if (loading) return
                const q = validateSafeSelect(sql)

                if (!q) {
                    setFilteredRows(rows)
                    setHasRun(false)
                    return
                }

                const out = alasql(q) as any[]
                const arr = Array.isArray(out) ? out : [out]
                const ids = new Set<number>(
                    arr.map((r: any) => Number(r?.id)).filter((v: number) => Number.isFinite(v))
                )
                const next = rows.filter((row) => ids.has(row.id))

                setFilteredRows(next)
                setHasRun(true)
                setFeedback(null)
            } catch (e: any) {
                setFilteredRows([])
                setHasRun(false)
                alert(e?.message || "Error al ejecutar la consulta")
            }
        }

        function resetTable() {
            setFilteredRows(rows)
            setSql("")
            setAnswer("")
            setOutputChoice(null)
            setHasRun(false)
            setFeedback(null)
            setLastCorrect(false)
        }

        function resultMatchesExpected() {
            if (!hasRun) return false
            if (filteredRows.length !== expectedRows.length) return false

            const actualIds = new Set(filteredRows.map((row) => row.id))
            return expectedRows.every((row) => actualIds.has(row.id))
        }

        function calculateScore() {
            const promptOk = promptChoice === routine.expectedPrompt
            const outputOk = outputChoice === routine.expectedOutput
            const resultOk = resultMatchesExpected()
            const countOk = Number(answer) === expectedRows.length

            const reasoningScore = Number(promptOk) + Number(outputOk)
            const validationScore = Number(resultOk) + Number(countOk)

            return {
                promptOk,
                outputOk,
                resultOk,
                countOk,
                reasoningScore,
                validationScore,
                total: reasoningScore + validationScore,
            }
        }

        function checkNow(opts?: { silent?: boolean }) {
            const { reasoningScore, validationScore, total, promptOk, outputOk, resultOk, countOk } = calculateScore()
            // El número de filas ingresado (countOk) es obligatorio siempre: es la
            // evidencia de que efectivamente ejecutó y leyó el resultado. Las otras
            // 3 dimensiones (instrucción, salida elegida, resultado exacto de la
            // consulta) admiten un error entre las tres.
            const otherCorrect = Number(promptOk) + Number(outputOk) + Number(resultOk)
            const ok = countOk && otherCorrect >= 2

            if (!opts?.silent) {
                setLastCorrect(ok)

                if (ok) {
                    setFeedback({
                        score: total,
                        kind: "success",
                        message:
                            "Excelente. La automatización queda bien definida, ejecutada y validada.",
                    })
                } else if (reasoningScore + validationScore >= 2) {
                    setFeedback({
                        score: total,
                        kind: "warning",
                        message:
                            reasoningScore < 2
                                ? "Revisa el razonamiento: la instrucción mejorada o la salida elegida todavía no son las más adecuadas para esta tarea."
                                : "El razonamiento está bien, pero falta validar correctamente: ejecuta la consulta y confirma el número de filas esperado.",
                    })
                } else {
                    setFeedback({
                        score: total,
                        kind: "error",
                        message:
                            "Revisa el flujo completo: automatizar no es solo generar una consulta, también hay que definir bien la tarea y validar la salida.",
                    })
                }
            }

            onFinish?.(ok ? 1 : 0)
            return ok
        }

        useImperativeHandle(ref, () => ({
            finish: checkNow,
            check: checkNow,
            isReady: () => isReady,
        }))

        const selectedPromptOption = promptOptions.find((o) => o.id === promptChoice)
        const selectedOutputOption = outputOptions.find((o) => o.id === outputChoice)

        const AccordionHeader = ({
            step,
            title,
            done,
            summary,
        }: {
            step: 1 | 2 | 3
            title: string
            done: boolean
            summary?: string
        }) => (
            <button
                type="button"
                onClick={() => setOpenPanel(step)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
                <div className="flex items-center gap-4">
                    <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                            done
                                ? "bg-emerald-100 text-emerald-700"
                                : openPanel === step
                                ? "bg-[#286575] text-white"
                                : "bg-slate-100 text-slate-400"
                        }`}
                    >
                        {done ? "✓" : step}
                    </span>
                    <div>
                        <p
                            className={`text-sm font-semibold ${
                                openPanel === step ? "text-slate-800" : "text-slate-600"
                            }`}
                        >
                            {title}
                        </p>
                        {openPanel !== step && summary && (
                            <p className="mt-0.5 text-xs text-slate-500">{summary}</p>
                        )}
                    </div>
                </div>
                <span
                    className={`flex shrink-0 items-center text-[#286575] transition-transform ${
                        openPanel === step ? "rotate-180" : ""
                    }`}
                    aria-hidden
                >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            </button>
        )

        return (
            <section className="w-full space-y-4">
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <p className="text-sm leading-relaxed text-slate-700">
                        {routine.routine}
                    </p>
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                            Prompt inicial
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                            "{routine.initialPrompt}"
                        </p>
                    </div>
                </div>

                {/* Panel 1: mejorar instrucción */}
                <div
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors duration-300 ${
                        openPanel === 1 ? "border-[#286575]/40" : "border-slate-200"
                    }`}
                >
                    <AccordionHeader
                        step={1}
                        title="Mejora la instrucción"
                        done={!!promptChoice}
                        summary={selectedPromptOption?.label}
                    />
                    <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: openPanel === 1 ? "1fr" : "0fr" }}
                    >
                        <div className="overflow-hidden">
                            <div className="border-t px-4 pb-4 pt-3">
                                <p className="mb-2 text-xs text-slate-500">
                                    Elige la versión que deja la tarea rutinaria lista para
                                    automatizar.
                                </p>
                                <div className="space-y-1.5">
                                    {promptOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => selectPrompt(option.id)}
                                            className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-medium leading-relaxed transition ${
                                                promptChoice === option.id
                                                    ? "border-[#286575] bg-[#e4f3f5] text-slate-950 ring-2 ring-[#286575]/20"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-[#286575]/40 hover:bg-[#f3fbfb]"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 2: evaluar salida */}
                <div
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors duration-300 ${
                        openPanel === 2 ? "border-[#286575]/40" : "border-slate-200"
                    }`}
                >
                    <AccordionHeader
                        step={2}
                        title="Evalúa la salida generada"
                        done={!!outputChoice}
                        summary={selectedOutputOption?.query}
                    />
                    <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: openPanel === 2 ? "1fr" : "0fr" }}
                    >
                        <div className="overflow-hidden">
                            <div className="border-t px-4 pb-4 pt-3">
                                <p className="mb-2 text-xs text-slate-500">
                                    Selecciona la consulta que realmente automatiza la tarea.
                                </p>
                                <div className="space-y-1.5">
                                    {outputOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => selectOutput(option)}
                                            className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                                                outputChoice === option.id
                                                    ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                                    : "border-slate-200 bg-white hover:border-[#286575]/40 hover:bg-[#f3fbfb]"
                                            }`}
                                        >
                                            <code
                                                className={`block rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                                                    outputChoice === option.id
                                                        ? "border-[#286575]/30 bg-white text-[#1d4f5c]"
                                                        : "border-[#286575]/10 bg-[#f3fbfb] text-[#286575]"
                                                }`}
                                            >
                                                {option.query}
                                            </code>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 3: ejecutar y validar */}
                <div
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors duration-300 ${
                        openPanel === 3 ? "border-[#286575]/40" : "border-slate-200"
                    }`}
                >
                    <AccordionHeader
                        step={3}
                        title="Ejecuta y valida"
                        done={lastCorrect}
                        summary={
                            hasRun
                                ? `${filteredRows.length} fila(s) obtenidas · respuesta: ${answer || "—"}`
                                : "Pendiente de ejecutar"
                        }
                    />
                    <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: openPanel === 3 ? "1fr" : "0fr" }}
                    >
                        <div className="overflow-hidden">
                        <p className="border-t px-4 pt-4 text-sm text-gray-600">
                            Presiona <b>Ejecutar</b> para correr tu consulta SQL sobre la tabla FLORES. El contador junto a "Tabla FLORES" se actualizará mostrando cuántas filas devolvió — escribe ese mismo número como respuesta abajo.
                        </p>
                        <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-2">
                            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b p-2.5">
                                    <h4 className="text-sm font-semibold text-slate-800">
                                        Tabla FLORES
                                    </h4>
                                    {loading ? (
                                        <span className="text-xs text-slate-500">Cargando...</span>
                                    ) : (
                                        <span className="text-sm">
                                            <b className="font-bold text-[#286575]">{filteredRows.length}</b>
                                            <span className="text-slate-500"> filas obtenidas</span>
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-[220px] overflow-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="sticky top-0 bg-slate-50">
                                            <tr>
                                                <th className="border-b px-3 py-2 text-left">id</th>
                                                <th className="border-b px-3 py-2 text-right">nombre</th>
                                                <th className="border-b px-3 py-2 text-right">precio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!loading &&
                                                filteredRows.map((row) => (
                                                    <tr
                                                        key={row.id}
                                                        className="odd:bg-white even:bg-slate-50"
                                                    >
                                                        <td className="border-b px-3 py-2">{row.id}</td>
                                                        <td className="border-b px-3 py-2 text-right">
                                                            {row.nombre}
                                                        </td>
                                                        <td className="border-b px-3 py-2 text-right">
                                                            {row.precio}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                                {error && (
                                    <div className="border-t border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col rounded-2xl border bg-white p-3 shadow-sm">
                                <div className="mb-2 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={runQuery}
                                        className="rounded-xl bg-[#286675] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#3a7d89] disabled:opacity-50"
                                        disabled={loading || !outputChoice}
                                    >
                                        Ejecutar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetTable}
                                        className="rounded-xl bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        Restablecer
                                    </button>
                                </div>

                                <textarea
                                    value={sql}
                                    onChange={(event) => {
                                        setSql(sanitizeSqlInput(event.target.value))
                                        setHasRun(false)
                                        setFeedback(null)
                                    }}
                                    spellCheck={false}
                                    maxLength={220}
                                    className="min-h-[90px] rounded-xl border p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[#286575]"
                                    placeholder="Ajusta aquí la consulta si lo necesitas"
                                />

                                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#f3fbfb] p-3">
                                    <p className="text-sm font-medium text-slate-700">
                                        ¿Cuántas filas debería entregar la automatización?
                                    </p>
                                    <input
                                        type="number"
                                        value={answer}
                                        onChange={(event) => {
                                            setAnswer(sanitizeNumberInput(event.target.value))
                                            setFeedback(null)
                                        }}
                                        className="w-20 shrink-0 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#286575]"
                                        placeholder="N°"
                                        min={0}
                                        max={999}
                                        maxLength={3}
                                    />
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                {feedback && (
                    <div
                        role="status"
                        aria-live="assertive"
                        className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
                            feedback.kind === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : feedback.kind === "warning"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        <p className="font-semibold">Decisiones correctas: {feedback.score}/4</p>
                        <p className="mt-1">{feedback.message}</p>
                    </div>
                )}
            </section>
        )
    }
)

ProgrammingExerciseA2.displayName = "ProgrammingExerciseA2"

export default ProgrammingExerciseA2