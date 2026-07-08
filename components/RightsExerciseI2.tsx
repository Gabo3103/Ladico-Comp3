"use client"

import React, {
    useState,
    useMemo,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react"

export type I2Quality = "good" | "partial" | "bad"

export type RightsExerciseI2Grade = {
    correctCount: number
    totalCount: number
    quality: I2Quality
}

export type RightsExerciseI2Handle = {
    check: () => void
    isReady: () => boolean
    reset: () => void
    grade: () => RightsExerciseI2Grade
}

type UseOption = "FREE" | "ATTR" | "NO" | "REVIEW"

const useLabel: Record<UseOption, string> = {
    FREE: "Se puede publicar libremente",
    ATTR: "Se puede publicar con atribución al autor",
    NO: "No se debe publicar sin permiso",
    REVIEW: "Debe revisarse la licencia, el origen y la atribución antes de compartir",
}

type Props = { onReadyChange?: (ready: boolean) => void }

const fieldStyle =
    "w-full max-w-[420px] appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-11 font-inherit text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-[#286575]/40 focus:border-[#286575] focus:ring-2 focus:ring-[#286575]/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"

const RightsExerciseI2 = forwardRef<RightsExerciseI2Handle, Props>(
    function RightsExerciseI2({ onReadyChange }, ref) {
        const [q1, setQ1] = useState<UseOption | "">("")
        const [q2, setQ2] = useState<UseOption | "">("")
        const [q3, setQ3] = useState<UseOption | "">("")
        const [q4, setQ4] = useState<string | "">("")

        const [checked, setChecked] = useState(false)

        const corr1: UseOption = "FREE"
        const corr2: UseOption = "ATTR"
        const corr3: UseOption = "NO"
        const corr4 =
            "Debe revisarse la licencia, el origen y la atribución antes de compartir"

        const allAnswered = useMemo(() => !!q1 && !!q2 && !!q3 && !!q4, [q1, q2, q3, q4])

        useEffect(() => {
            onReadyChange?.(allAnswered)
        }, [allAnswered, onReadyChange])

        // 3 dimensiones del Excel (Aplicación de pautas de uso / Atribución en
        // contexto / Uso ético de herramientas IA) se reflejan en las 4 preguntas,
        // pero el puntaje final es por conteo puro: no exige que un ítem específico
        // esté correcto para dar crédito parcial por los demás. Aprueba con 3 o 4
        // de 4 (Medio o Alto); con 0-2 no aprueba.
        const computeGrade = (): RightsExerciseI2Grade => {
            const results = [q1 === corr1, q2 === corr2, q3 === corr3, q4 === corr4]
            const correctCount = results.filter(Boolean).length
            const totalCount = results.length

            let quality: I2Quality = "bad"
            if (correctCount === 4) {
                quality = "good" // 4 puntos: Alto
            } else if (correctCount === 3) {
                quality = "partial" // 3 puntos: Medio, aprueba
            } // 0-2 puntos: Bajo, no aprueba

            return { correctCount, totalCount, quality }
        }

        useImperativeHandle(ref, () => ({
            check() {
                if (allAnswered) setChecked(true)
            },
            isReady() {
                return allAnswered
            },
            reset() {
                setQ1("")
                setQ2("")
                setQ3("")
                setQ4("")
                setChecked(false)
                onReadyChange?.(false)
            },
            grade() {
                const result = computeGrade()
                if (allAnswered) setChecked(true)
                return result
            },
        }))

        const feedbackBox = (ok: boolean, expected: string) => (
            <div
                className={`mt-1 rounded-xl border p-2 text-xs ${
                    ok
                        ? "border-emerald-500/40 text-emerald-600"
                        : "border-rose-500/40 text-rose-600"
                }`}
            >
                {ok ? "¡Correcto!" : `Revisa: ${expected}`}
            </div>
        )

        return (
            <div className="space-y-5 rounded-2xl border bg-white p-6">
                <p className="text-sm leading-relaxed text-gray-600">
                    Usar cada recurso significa incorporarlo directamente
                    al post que vas a publicar: por eso, las condiciones de la licencia
                    aplican desde que decides usarlo, no solo al momento de compartirlo.
                </p>

                <div className="rounded-xl border p-4">
                    <div className="mb-3">
                        <h3 className="font-semibold text-sm text-gray-800">
                            Foto con licencia CC0
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[280px,1fr] sm:items-start">
                        <p className="text-sm leading-relaxed text-gray-600 sm:min-h-[48px]">
                            Encuentras una foto con licencia CC0 para usarla como imagen
                            principal del post.
                        </p>
                        <div className="relative w-full max-w-[420px]">
                            <select
                                className={`${fieldStyle} ${
                                    q1
                                        ? "border-[#286575] bg-[#e4f3f5] text-slate-950 ring-2 ring-[#286575]/20"
                                        : "text-slate-500"
                                }`}
                                value={q1}
                                disabled={checked}
                                onChange={(e) => setQ1(e.target.value as UseOption)}
                            >
                                <option value="" className="text-slate-500">
                                    Selecciona...
                                </option>
                                {(["FREE", "ATTR", "NO"] as UseOption[]).map((v) => (
                                    <option key={v} value={v} className="font-semibold text-slate-950">
                                        {useLabel[v]}
                                    </option>
                                ))}
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
                        {checked && feedbackBox(q1 === corr1, useLabel[corr1])}
                    </div>
                </div>

                <div className="rounded-xl border p-4">
                    <div className="mb-3">
                        <h3 className="font-semibold text-sm text-gray-800">
                            Ícono con licencia CC BY
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[280px,1fr] sm:items-start">
                        <p className="text-sm leading-relaxed text-gray-600 sm:min-h-[48px]">
                            Quieres usar un ícono descargado de una plataforma que indica
                            licencia CC BY.
                        </p>
                        <div className="relative w-full max-w-[420px]">
                            <select
                                className={`${fieldStyle} ${
                                    q2
                                        ? "border-[#286575] bg-[#e4f3f5] text-slate-950 ring-2 ring-[#286575]/20"
                                        : "text-slate-500"
                                }`}
                                value={q2}
                                disabled={checked}
                                onChange={(e) => setQ2(e.target.value as UseOption)}
                            >
                                <option value="" className="text-slate-500">
                                    Selecciona...
                                </option>
                                {(["FREE", "ATTR", "NO"] as UseOption[]).map((v) => (
                                    <option key={v} value={v} className="font-semibold text-slate-950">
                                        {useLabel[v]}
                                    </option>
                                ))}
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
                        {checked && feedbackBox(q2 === corr2, useLabel[corr2])}
                    </div>
                </div>

                <div className="rounded-xl border p-4">
                    <div className="mb-3">
                        <h3 className="font-semibold text-sm text-gray-800">
                            Imagen de una noticia
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[280px,1fr] sm:items-start">
                        <p className="text-sm leading-relaxed text-gray-600 sm:min-h-[48px]">
                            Ves una imagen publicada en una noticia, pero no aparece ninguna
                            licencia abierta de reutilización.
                        </p>
                        <div className="relative w-full max-w-[420px]">
                            <select
                                className={`${fieldStyle} ${
                                    q3
                                        ? "border-[#286575] bg-[#e4f3f5] text-slate-950 ring-2 ring-[#286575]/20"
                                        : "text-slate-500"
                                }`}
                                value={q3}
                                disabled={checked}
                                onChange={(e) => setQ3(e.target.value as UseOption)}
                            >
                                <option value="" className="text-slate-500">
                                    Selecciona...
                                </option>
                                {(["FREE", "ATTR", "NO"] as UseOption[]).map((v) => (
                                    <option key={v} value={v} className="font-semibold text-slate-950">
                                        {useLabel[v]}
                                    </option>
                                ))}
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
                        {checked && feedbackBox(q3 === corr3, useLabel[corr3])}
                    </div>
                </div>

                <div className="rounded-xl border p-4">
                    <div className="mb-3">
                        <h3 className="font-semibold text-sm text-gray-800">
                            Recurso visual editado con IA
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[280px,1fr] sm:items-start">
                        <p className="text-sm leading-relaxed text-gray-600 sm:min-h-[48px]">
                            Una herramienta de diseño con IA te sugiere una versión editada
                            de una imagen y la deja lista para publicar.
                        </p>
                        <div className="relative w-full max-w-[420px]">
                            <select
                                className={`${fieldStyle} ${
                                    q4
                                        ? "border-[#286575] bg-[#e4f3f5] text-slate-950 ring-2 ring-[#286575]/20"
                                        : "text-slate-500"
                                }`}
                                value={q4}
                                disabled={checked}
                                onChange={(e) => setQ4(e.target.value)}
                            >
                                <option value="" className="text-slate-500">
                                    Selecciona...
                                </option>
                                <option className="font-semibold text-slate-950">{corr4}</option>
                                <option className="font-semibold text-slate-950">
                                    Se puede publicar directamente porque la herramienta ya la validó
                                </option>
                                <option className="font-semibold text-slate-950">
                                    Toda imagen editada con IA pasa a ser de libre uso
                                </option>
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
                        {checked && feedbackBox(q4 === corr4, corr4)}
                    </div>
                </div>
            </div>
        )
    }
)

export default RightsExerciseI2