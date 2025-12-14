"use client"

import React, {
    useMemo,
    useState,
    forwardRef,
    useImperativeHandle,
    useEffect,
} from "react"

type YesNo = "SI" | "NO"
type Rule =
    | "CC_BY_SA"
    | "DOMINIO_PUBLICO"
    | "NO_PERMISO"
    | "CREACION_PROPIA"

type ResourceKey = "wikimedia" | "marca" | "canva" | "noticia"
type Answer = { canUse?: YesNo; rule?: Rule }

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

    const RULE_LABEL: Record<Rule, string> = {
    CC_BY_SA: "Licencia Creative Commons (CC BY-SA)",
    DOMINIO_PUBLICO: "Dominio público",
    NO_PERMISO: "No se puede usar sin permiso del propietario",
    CREACION_PROPIA: "Creación propia",
    }

    const RESOURCES: Record<
    ResourceKey,
    {
        title: string
        description: string
        correct: { canUse: YesNo; rule: Rule }
        hint?: string
    }
    > = {
    wikimedia: {
        title: "Imagen de Wikimedia Commons",
        description: "La imagen indica CC Atribución-CompartirIgual",
        correct: { canUse: "SI", rule: "CC_BY_SA" },
    },
    marca: {
        title: "Foto de sitio web de una marca",
        description: "Derechos reservados",
        correct: { canUse: "NO", rule: "NO_PERMISO" },
    },
    canva: {
        title: "Gráfico creado por ti en Canva",
        description: "Asume creación propia original",
        correct: { canUse: "SI", rule: "CREACION_PROPIA" },
    },
    noticia: {
        title: "Imagen de una noticia en su página web",
        description: "Sin mención de derechos de uso",
        correct: { canUse: "NO", rule: "NO_PERMISO" },
    },
    }

    const fieldStyle =
    "px-2 py-1 rounded-md border text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#286575] w-full text-sm font-inherit"

    const RightsExerciseI1 = forwardRef<RightsExerciseI1Handle, Props>(
    function RightsExerciseI1({ onReadyChange }, ref) {
        const [answers, setAnswers] = useState<Record<ResourceKey, Answer>>({
        wikimedia: {},
        marca: {},
        canva: {},
        noticia: {},
        })
        const [checked, setChecked] = useState(false)

        const allAnswered = useMemo(
        () =>
            (Object.keys(answers) as ResourceKey[]).every(
            (k) => answers[k].canUse && answers[k].rule
            ),
        [answers]
        )

        useEffect(() => {
        onReadyChange?.(allAnswered)
        }, [allAnswered, onReadyChange])

        const isCorrectResource = (key: ResourceKey) => {
        const sel = answers[key]
        const corr = RESOURCES[key].correct
        return sel.canUse === corr.canUse && sel.rule === corr.rule
        }

        const computeGrade = (): RightsExerciseI1Grade => {
        let correctCount = 0
        let totalCount = 0

        ;(Object.keys(RESOURCES) as ResourceKey[]).forEach((key) => {
            const sel = answers[key]
            const corr = RESOURCES[key].correct

            if (sel.canUse !== undefined) {
            totalCount += 1
            if (sel.canUse === corr.canUse) correctCount += 1
            }

            if (sel.rule !== undefined) {
            totalCount += 1
            if (sel.rule === corr.rule) correctCount += 1
            }
        })

        let quality: ExerciseQuality = "bad"

        if (totalCount > 0 && correctCount === totalCount) {
            quality = "good"
        } else if (correctCount >= 6) {
            quality = "partial"
        } else {
            quality = "bad"
        }

        return { correctCount, totalCount, quality }
        }

        const setCanUse = (key: ResourceKey, v: YesNo) =>
        setAnswers((prev) => ({ ...prev, [key]: { ...prev[key], canUse: v } }))

        const setRule = (key: ResourceKey, v: Rule) =>
        setAnswers((prev) => ({ ...prev, [key]: { ...prev[key], rule: v } }))

        useImperativeHandle(ref, () => ({
        check() {
            if (allAnswered) setChecked(true)
        },
        isReady() {
            return allAnswered
        },
        reset() {
            setAnswers({ wikimedia: {}, marca: {}, canva: {}, noticia: {} })
            setChecked(false)
            onReadyChange?.(false)
        },
        grade() {
            const result = computeGrade()
            if (allAnswered) {
            setChecked(true)
            }
            return result
        },
        }))

        return (
        <div className="rounded-2xl border bg-white p-6">
            <div className="space-y-4 text-sm text-gray-700">
            {(Object.keys(RESOURCES) as ResourceKey[]).map((key) => {
                const R = RESOURCES[key]
                const sel = answers[key]
                const correctNow = checked ? isCorrectResource(key) : null

                return (
                <div key={key} className="rounded-xl border p-4">
                    <div className="mb-2">
                    <div className="font-semibold">{R.title}</div>
                    <div className="opacity-80">{R.description}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[160px,1fr] items-center gap-2 mb-2">
                    <span>¿Uso libre?</span>
                    <select
                        className={fieldStyle}
                        value={sel.canUse ?? ""}
                        onChange={(e) =>
                        setCanUse(key, (e.target.value as YesNo) || undefined)
                        }
                        disabled={checked}
                    >
                        <option value="">Selecciona…</option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                    </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[160px,1fr] items-center gap-2">
                    <span>Norma</span>
                    <select
                        className={fieldStyle}
                        value={sel.rule ?? ""}
                        onChange={(e) =>
                        setRule(key, (e.target.value as Rule) || undefined)
                        }
                        disabled={checked}
                    >
                        <option value="">Selecciona…</option>
                        {(Object.keys(RULE_LABEL) as Rule[]).map((r) => (
                        <option key={r} value={r}>
                            {RULE_LABEL[r]}
                        </option>
                        ))}
                    </select>
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
                        <p>¡Correcto!</p>
                        ) : (
                        <div>
                            <p className="font-medium">Revisa:</p>
                            <ul className="list-disc list-inside">
                            <li>
                                Debe coincidir:{" "}
                                <strong>
                                {RESOURCES[key].correct.canUse === "SI"
                                    ? "Sí"
                                    : "No"}
                                </strong>{" "}
                                y{" "}
                                <strong>
                                {RULE_LABEL[RESOURCES[key].correct.rule]}
                                </strong>
                                .
                            </li>
                            {R.hint && <li>{R.hint}</li>}
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

export default RightsExerciseI1
