"use client"

import React, {
    useState,
    useMemo,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react"

export type RightsExerciseI2MiniHandle = {
    check: () => void
    isReady: () => boolean
    reset: () => void
    }

    type UseOption = "FREE" | "ATTR" | "NO"
    const UseLabel: Record<UseOption, string> = {
    FREE: "Se puede usar libremente",
    ATTR: "Se puede usar con atribución obligatoria",
    NO:   "No se puede usar / requiere permiso",
    }

    type Props = { onReadyChange?: (ready: boolean) => void }

    const fieldStyle =
    "px-2 py-1 rounded-md border text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#286575] w-full text-sm font-inherit"

    const RightsExerciseI2Mini = forwardRef<RightsExerciseI2MiniHandle, Props>(
    function RightsExerciseI2Mini({ onReadyChange }, ref) {
        // P1: Pixabay (CC0)
        const [q1, setQ1] = useState<UseOption | "">("")
        // P2: Flaticon (CC-BY)
        const [q2, setQ2] = useState<UseOption | "">("")
        // P3: Noticia (sin licencia)
        const [q3, setQ3] = useState<UseOption | "">("")
        // P4: Atribución en Instagram (texto)
        const [q4, setQ4] = useState<string | "">("")

        const [checked, setChecked] = useState(false)

        // Respuestas correctas
        const corr1: UseOption = "FREE"
        const corr2: UseOption = "ATTR"
        const corr3: UseOption = "NO"
        const corr4 = "En la descripción del post con enlace al autor."

        const allAnswered = useMemo(
        () => !!q1 && !!q2 && !!q3 && !!q4,
        [q1, q2, q3, q4]
        )

        useEffect(() => {
        onReadyChange?.(allAnswered)
        }, [allAnswered, onReadyChange])

        useImperativeHandle(ref, () => ({
        check() {
            if (allAnswered) setChecked(true)
        },
        isReady() {
            return allAnswered
        },
        reset() {
            setQ1(""); setQ2(""); setQ3(""); setQ4("")
            setChecked(false)
            onReadyChange?.(false)
        },
        }))

        const feedbackBox = (ok: boolean, expected: string) => (
        <div className={`rounded-xl border p-2 text-xs mt-1 ${
            ok ? "border-emerald-500/40 text-emerald-600" : "border-rose-500/40 text-rose-600"
        }`}>
            {ok ? "¡Correcto!" : `Revisa: ${expected}`}
        </div>
        )

        return (
        <div className="rounded-2xl border bg-white p-6 space-y-5">
            {/* P1 */}
            <div>
            <div className=" font-semibold space-y-4 text-sm text-gray-700">Fotos de una página con licencia CC0</div>
            <div className="grid grid-cols-1 sm:grid-cols-[260px,1fr] items-center gap-2">
                <span className="text-sm">¿Se puede usar?</span>
                <select
                className={fieldStyle}
                value={q1}
                disabled={checked}
                onChange={e => setQ1(e.target.value as UseOption)}
                >
                <option value="">Selecciona…</option>
                {(["FREE","ATTR","NO"] as UseOption[]).map(v =>
                    <option key={v} value={v}>{UseLabel[v]}</option>
                )}
                </select>
                {checked && feedbackBox(q1 === corr1, UseLabel[corr1])}
            </div>
            </div>

            {/* P2 */}
            <div>
            <div className=" font-semibold space-y-4 text-sm text-gray-700">Íconos con licencia CC-BY</div>
            <div className="grid grid-cols-1 sm:grid-cols-[260px,1fr] items-center gap-2">
                <span className="text-sm">¿Se puede usar?</span>
                <select
                className={fieldStyle}
                value={q2}
                disabled={checked}
                onChange={e => setQ2(e.target.value as UseOption)}
                >
                <option value="">Selecciona…</option>
                {(["FREE","ATTR","NO"] as UseOption[]).map(v =>
                    <option key={v} value={v}>{UseLabel[v]}</option>
                )}
                </select>
                {checked && feedbackBox(q2 === corr2, UseLabel[corr2])}
            </div>
            </div>

            {/* P3 */}
            <div>
            <div className=" font-semibold space-y-4 text-sm text-gray-700">Imagen de una noticia digital © </div>
            <div className="grid grid-cols-1 sm:grid-cols-[260px,1fr] items-center gap-2">
                <span className="text-sm">¿Se puede usar?</span>
                <select
                className={fieldStyle}
                value={q3}
                disabled={checked}
                onChange={e => setQ3(e.target.value as UseOption)}
                >
                <option value="">Selecciona…</option>
                {(["FREE","ATTR","NO"] as UseOption[]).map(v =>
                    <option key={v} value={v}>{UseLabel[v]}</option>
                )}
                </select>
                {checked && feedbackBox(q3 === corr3, UseLabel[corr3])}
            </div>
            </div>

            {/* P4 */}
            <div>
            <div className=" font-semibold space-y-4 text-sm text-gray-700">Al momento de publicar se deben atribuir los íconos e imagenes que lleven derechos de autor</div>
            <div className="grid grid-cols-1 sm:grid-cols-[260px,1fr] items-center gap-2">
                <span className="text-sm">¿Dónde la haces?</span>
                <select
                className={fieldStyle}
                value={q4}
                disabled={checked}
                onChange={e => setQ4(e.target.value)}
                >
                <option value="">Selecciona…</option>
                <option>En la descripción del post con enlace al autor</option>
                <option>En un comentario separado</option>
                <option>En la misma imagen</option>
                <option>Sin atribución</option>
                </select>
                {checked && feedbackBox(q4 === corr4, corr4)}
            </div>
            </div>
        </div>
        )
    }
)

export default RightsExerciseI2Mini
