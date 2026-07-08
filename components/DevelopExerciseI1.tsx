"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type DevelopExerciseI1Handle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
};

type Dimension = "benefit" | "limitation" | "ethics" | "distractor";

type Option = {
    id: string;
    label: string;
    isCorrect: boolean;
    dimension: Dimension;
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
};

// Fiel a la tabla de indicadores CS3.1.08 del Excel, pero con un banco de opciones
// por dimensión (en vez de una única alternativa fija) para variar el contenido
// entre sesiones sin perder la estructura: siempre 2 beneficios, 1 limitación,
// 1 ética y 2 distractores → se respeta el mínimo por dimensión en cualquier combinación.
const BENEFIT_BANK: ReadonlyArray<Option> = [
    {
        id: "ideas-fast",
        label: "Permite generar ideas o borradores rápidamente",
        isCorrect: true,
        dimension: "benefit",
    },
    {
        id: "creative-support",
        label: "Puede apoyar el proceso creativo si se usa adecuadamente",
        isCorrect: true,
        dimension: "benefit",
    },
    {
        id: "structure-content",
        label: "Puede sugerir estructuras, títulos o secciones para organizar mejor un contenido",
        isCorrect: true,
        dimension: "benefit",
    },
    {
        id: "adapt-audience",
        label: "Puede ayudar a adaptar un contenido a una audiencia específica, si luego se revisa",
        isCorrect: true,
        dimension: "benefit",
    },
];

const LIMITATION_BANK: ReadonlyArray<Option> = [
    {
        id: "may-have-errors",
        label: "Puede presentar errores o información inexacta",
        isCorrect: true,
        dimension: "limitation",
    },
    {
        id: "bias-risk",
        label: "Puede reproducir sesgos presentes en sus datos o en la forma en que se solicita la tarea",
        isCorrect: true,
        dimension: "limitation",
    },
];

const ETHICS_BANK: ReadonlyArray<Option> = [
    {
        id: "human-review",
        label: "Requiere revisión humana para asegurar calidad y contexto",
        isCorrect: true,
        dimension: "ethics",
    },
    {
        id: "source-check",
        label: "Exige verificar fuentes cuando incluye datos, citas o afirmaciones importantes",
        isCorrect: true,
        dimension: "ethics",
    },
];

const DISTRACTOR_BANK: ReadonlyArray<Option> = [
    {
        id: "always-correct",
        label: "Siempre entrega información completamente correcta",
        isCorrect: false,
        dimension: "distractor",
    },
    {
        id: "no-ethics",
        label: "Se puede usar sin considerar aspectos éticos o de autoría",
        isCorrect: false,
        dimension: "distractor",
    },
    {
        id: "no-authority-needed",
        label: "La responsabilidad principal del contenido final recae en la herramienta que generó el borrador",
        isCorrect: false,
        dimension: "distractor",
    },
    {
        id: "replaces-creator",
        label: "Cuando la IA entrega una propuesta completa, la revisión humana es opcional si el tiempo es limitado",
        isCorrect: false,
        dimension: "distractor",
    },
];

function shuffle<T>(items: ReadonlyArray<T>) {
    return [...items].sort(() => Math.random() - 0.5);
}

function pickOptions() {
    const benefits = shuffle(BENEFIT_BANK).slice(0, 2); // slot fijo: 2 beneficios
    const limitation = shuffle(LIMITATION_BANK).slice(0, 1); // slot fijo: 1 limitación
    const ethics = shuffle(ETHICS_BANK).slice(0, 1); // slot fijo: 1 ética
    const distractors = shuffle(DISTRACTOR_BANK).slice(0, 1); // slot fijo: 1 distractor (5 alternativas en total)

    return shuffle([...benefits, ...limitation, ...ethics, ...distractors]);
}

const DevelopExerciseI1 = forwardRef<DevelopExerciseI1Handle, Props>(
    function DevelopExerciseI1({ onEvaluate, onReadyChange }, ref) {
        const options = useMemo(() => pickOptions(), []);
        const [selected, setSelected] = useState<Record<string, boolean>>({});
        const [feedback, setFeedback] = useState<{
            kind: "idle" | "success" | "warning" | "error";
            message?: string;
            score?: number;
        }>({ kind: "idle" });

        const chosen = useMemo(
            () =>
                Object.entries(selected)
                    .filter(([, value]) => value)
                    .map(([id]) => id),
            [selected]
        );

        useEffect(() => {
            onReadyChange?.(chosen.length > 0);
        }, [chosen, onReadyChange]);

        function toggle(id: string) {
            setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
            setFeedback({ kind: "idle" });
        }

        // Puntaje ponderado por dimensión (máx 3.0):
        // Beneficio: 0.5 por cada uno correcto (máx 2 = 1.0)
        // Ético: 1 punto (binario, único slot)
        // Limitación: 1 punto (binario, único slot)
        // Distractor: -0.5 por cada uno marcado
        function evaluateDimensions() {
            const benefitPicked = options.filter(
                (o) => o.dimension === "benefit" && chosen.includes(o.id)
            ).length;
            const limitationPicked = options.some(
                (o) => o.dimension === "limitation" && chosen.includes(o.id)
            );
            const ethicsPicked = options.some(
                (o) => o.dimension === "ethics" && chosen.includes(o.id)
            );
            const distractorsPicked = options.filter(
                (o) => o.dimension === "distractor" && chosen.includes(o.id)
            ).length;

            const meetsBenefit = benefitPicked >= 2; // "Reconoce al menos 2"
            const meetsLimitation = limitationPicked;
            const meetsEthics = ethicsPicked;

            const benefitScore = Math.min(benefitPicked, 2) * 0.5;
            const ethicsScore = meetsEthics ? 1 : 0;
            const limitationScore = meetsLimitation ? 1 : 0;
            const penalty = distractorsPicked * 0.5;

            const rawScore = benefitScore + ethicsScore + limitationScore - penalty;
            const score = Math.max(0, Math.round(rawScore * 2) / 2); // redondeo a 0.5

            return { meetsBenefit, meetsLimitation, meetsEthics, distractorsPicked, score };
        }

        function evaluate() {
            const { score, distractorsPicked } = evaluateDimensions();
            const ok = score >= 2.5 && distractorsPicked === 0;

            if (ok && score === 3) {
                setFeedback({
                    kind: "success",
                    score,
                    message:
                        "Excelente. Comprendes beneficios, limitaciones y uso ético de la IA en la creación de contenido.",
                });
                onEvaluate?.(1);
            } else if (ok) {
                setFeedback({
                    kind: "success",
                    score,
                    message:
                        "Buen trabajo. Comprendes las tres dimensiones, aunque revisa algún detalle para lograr el puntaje máximo.",
                });
                onEvaluate?.(1);
            } else if (distractorsPicked > 0) {
                setFeedback({
                    kind: "warning",
                    score,
                    message:
                        "Marcaste una afirmación que no es correcta. Revisa cuál de tus selecciones no describe realmente un beneficio, una limitación o el uso ético de la IA.",
                });
                onEvaluate?.(0);
            } else if (score >= 1.5) {
                setFeedback({
                    kind: "warning",
                    score,
                    message:
                        "Vas bien, pero revisa si faltó alguna idea clave sobre beneficios, limitaciones o ética.",
                });
                onEvaluate?.(0);
            } else {
                setFeedback({
                    kind: "error",
                    score,
                    message:
                        "Revisa qué afirmaciones son beneficios reales, cuáles son limitaciones y por qué siempre se requiere supervisión humana.",
                });
                onEvaluate?.(0);
            }

            return ok;
        }

        useImperativeHandle(ref, () => ({
            check: evaluate,
            isReady: () => chosen.length > 0,
            reset: () => {
                setSelected({});
                setFeedback({ kind: "idle" });
                onEvaluate?.(0);
                onReadyChange?.(false);
            },
        }));

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {options.map((option, index) => {
                        const isChecked = !!selected[option.id];
                        const isLastOnOwnRow = options.length % 2 !== 0 && index === options.length - 1;

                        return (
                            <label
                                key={option.id}
                                className={`flex min-h-[92px] cursor-pointer select-none items-start gap-3 rounded-2xl border p-4 shadow-sm transition-all ${
                                    isChecked
                                        ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                        : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-md"
                                } ${isLastOnOwnRow ? "md:col-span-2 md:mx-auto md:w-[calc(50%-0.375rem)]" : ""}`}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-1 h-5 w-5 shrink-0 rounded accent-[#286575]"
                                    checked={isChecked}
                                    onChange={() => toggle(option.id)}
                                />
                                <span className="text-sm font-medium leading-relaxed text-slate-800">
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
                </div>

                {feedback.kind !== "idle" && (
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
                        <p className="font-semibold">Puntaje: {feedback.score}/3</p>
                        <p className="mt-1">{feedback.message}</p>
                    </div>
                )}
            </div>
        );
    }
);

DevelopExerciseI1.displayName = "DevelopExerciseI1";

export default DevelopExerciseI1;