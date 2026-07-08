"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type ExerciseQuality = "good" | "partial" | "bad";

export type IntegrationExerciseA2SimulatorGrade = {
    selectiveUse: boolean;
    transparency: boolean;
    qualityControl: boolean;
    criticalJudgment: boolean;
    total: number;
    quality: ExerciseQuality;
};

export type IntegrationExerciseA2SimulatorHandle = {
    check: (opts?: { silent?: boolean }) => boolean;
    isReady: () => boolean;
    reset: () => void;
    grade: () => IntegrationExerciseA2SimulatorGrade;
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
    seed?: number;
};

type OptionRole = "selective" | "transparency" | "quality" | "exclude";

type Option = {
    id: string;
    label: string;
    role: OptionRole;
};

type Scenario = {
    id: string;
    context: string;
    exampleVisual: { image: string; alt: string; title: string; caption: string };
    options: Option[];
};

const SCENARIOS: Scenario[] = [
    {
        id: "digital-responsibility-guide",
        context:
            "Estás actualizando una guía digital sobre responsabilidad digital para estudiantes universitarios. Para ello utilizas: una herramienta que propone resúmenes automáticos, una función de mejora de redacción, un generador de imágenes y recursos provenientes de distintas fuentes.",
        exampleVisual: {
            image: "/img/01-guia-responsabilidad-digital.png",
            alt: "Ilustración de un estudiante usando el celular con un ícono de escudo",
            title: "Ilustración para la guía digital",
            caption: "Estudiante usando su celular, con apoyo de un ícono de seguridad",
        },
        options: [
            {
                id: "review-summaries",
                label: "Revisar y adaptar las sugerencias automáticas antes de incorporarlas al documento",
                role: "quality",
            },
            {
                id: "images-when-relevant",
                label: "Utilizar imágenes generadas digitalmente solo cuando aportan valor y son pertinentes para el contexto",
                role: "selective",
            },
            {
                id: "verify-sources",
                label: "Verificar la información obtenida de distintas fuentes antes de integrarla",
                role: "quality",
            },
            {
                id: "disclose-support",
                label: "Informar cuando una parte del contenido fue elaborada con apoyo de herramientas digitales, si el contexto lo requiere",
                role: "transparency",
            },
            {
                id: "prioritize-automatic",
                label: "Priorizar siempre el contenido generado automáticamente por sobre las fuentes originales",
                role: "exclude",
            },
        ],
    },
    {
        id: "coexistence-manual",
        context:
            "Estás actualizando un manual de convivencia escolar digital, apoyándote en una herramienta que resume secciones, corrige redacción, genera íconos y trae datos de otras fuentes.",
        exampleVisual: {
            image: "/img/02-manual-convivencia-escolar.png",
            alt: "Set de íconos simples para cada sección del manual",
            title: "Set de íconos para el manual",
            caption: "Representan respeto, seguridad y participación",
        },
        options: [
            {
                id: "review-summaries",
                label: "Revisar y ajustar los resúmenes automáticos antes de incorporarlos al manual",
                role: "quality",
            },
            {
                id: "icons-when-relevant",
                label: "Usar los íconos generados solo cuando ayudan a identificar claramente cada sección del manual",
                role: "selective",
            },
            {
                id: "verify-regulation",
                label: "Confirmar que los datos citados de otras fuentes correspondan efectivamente a la normativa vigente",
                role: "quality",
            },
            {
                id: "disclose-sections",
                label: "Señalar en el manual qué apartados fueron redactados con apoyo de herramientas digitales",
                role: "transparency",
            },
            {
                id: "prioritize-generated",
                label: "Dar preferencia al contenido generado automáticamente por sobre la normativa original del colegio",
                role: "exclude",
            },
        ],
    },
    {
        id: "email-safety-guide",
        context:
            "Estás actualizando un instructivo digital sobre uso seguro del correo institucional, con apoyo de una herramienta que sugiere ejemplos, mejora la redacción, genera diagramas y reúne información de distintos manuales.",
        exampleVisual: {
            image: "/img/03-instructivo-correo-seguro.png",
            alt: "Diagrama de flujo con los pasos para identificar un correo sospechoso",
            title: "Diagrama de flujo del instructivo",
            caption: "Pasos para identificar un correo sospechoso",
        },
        options: [
            {
                id: "review-examples",
                label: "Revisar que los ejemplos sugeridos correspondan a situaciones reales del contexto institucional antes de usarlos",
                role: "quality",
            },
            {
                id: "diagrams-when-relevant",
                label: "Usar los diagramas generados solo cuando facilitan entender un paso del proceso, no como simple adorno",
                role: "selective",
            },
            {
                id: "verify-consistency",
                label: "Verificar que la información reunida desde distintos manuales no se contradiga entre sí antes de integrarla",
                role: "quality",
            },
            {
                id: "disclose-diagrams",
                label: "Aclarar en el instructivo qué diagramas fueron generados con apoyo de una herramienta digital",
                role: "transparency",
            },
            {
                id: "prioritize-examples",
                label: "Priorizar los ejemplos generados automáticamente por sobre los procedimientos oficiales del colegio",
                role: "exclude",
            },
        ],
    },
];

function shuffle<T>(items: readonly T[]) {
    return [...items].sort(() => Math.random() - 0.5);
}

function pickScenario(seed?: number) {
    return SCENARIOS[Math.floor((seed ?? Math.random()) * SCENARIOS.length)];
}

const IntegrationExerciseA2Simulator = forwardRef<
    IntegrationExerciseA2SimulatorHandle,
    Props
>(function IntegrationExerciseA2Simulator({ onEvaluate, onReadyChange, seed }, ref) {
    const scenario = useMemo(() => pickScenario(seed), [seed]);
    const options = useMemo(() => shuffle(scenario.options), [scenario]);
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [checked, setChecked] = useState(false);

    const chosenCount = Object.values(selected).filter(Boolean).length;
    const isReady = chosenCount > 0;

    useEffect(() => {
        onReadyChange?.(isReady);
    }, [isReady, onReadyChange]);

    function toggle(id: string) {
        setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
        setChecked(false);
    }

    function computeGrade(): IntegrationExerciseA2SimulatorGrade {
        const byRole = (role: OptionRole) =>
            scenario.options.filter((o) => o.role === role);

        const selectiveOption = byRole("selective")[0];
        const transparencyOption = byRole("transparency")[0];
        const qualityOptions = byRole("quality");
        const excludeOptions = byRole("exclude");

        const selectiveUse = !!selected[selectiveOption.id];
        const transparency = !!selected[transparencyOption.id];
        const qualityControl = qualityOptions.every((o) => selected[o.id]);
        const criticalJudgment = excludeOptions.every((o) => !selected[o.id]);

        let total =
            Number(selectiveUse) +
            Number(transparency) +
            Number(qualityControl) +
            Number(criticalJudgment);

        // Penalización: si marca todas las alternativas del caso (estrategia de
        // "marcar todo para asegurar puntos"), se resta 1 punto.
        const markedAll = Object.values(selected).filter(Boolean).length === scenario.options.length;
        if (markedAll) {
            total = Math.max(0, total - 1);
        }

        let quality: ExerciseQuality = "bad";
        if (total === 4) quality = "good";
        else if (total >= 2) quality = "partial";

        return { selectiveUse, transparency, qualityControl, criticalJudgment, total, quality };
    }

    function evaluate(opts?: { silent?: boolean }) {
        if (!isReady) return false;
        const result = computeGrade();
        // Aprobación estricta: solo el puntaje máximo (4/4) aprueba.
        const ok = result.quality === "good";
        if (!opts?.silent) setChecked(true);
        onEvaluate?.(ok ? 1 : 0);
        return ok;
    }

    useImperativeHandle(ref, () => ({
        check: evaluate,
        isReady: () => isReady,
        grade: computeGrade,
        reset: () => {
            setSelected({});
            setChecked(false);
            onEvaluate?.(0);
            onReadyChange?.(false);
        },
    }));

    const grade = checked ? computeGrade() : null;

    return (
        <section className="space-y-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                    Caso
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{scenario.context}</p>

                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 p-3">
                    <img
                        src={scenario.exampleVisual.image}
                        alt={scenario.exampleVisual.alt}
                        style={{
                            display: "block",
                            margin: "0 auto",
                            maxHeight: "320px",
                            width: "auto",
                            maxWidth: "100%",
                        }}
                    />
                    <div className="mt-2">
                        <p className="text-sm font-semibold text-slate-800">
                            {scenario.exampleVisual.title}
                        </p>
                        <p className="text-xs leading-relaxed text-slate-500">
                            {scenario.exampleVisual.caption}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <h4 className="font-semibold text-slate-800">
                    Selecciona las acciones más adecuadas para mejorar e integrar el contenido
                    de manera ética, transparente y responsable
                </h4>

                <div className="mt-3 space-y-2">
                    {options.map((option) => {
                        const isPicked = !!selected[option.id];

                        return (
                            <label
                                key={option.id}
                                className={`flex min-h-[64px] cursor-pointer select-none items-center gap-4 rounded-2xl border px-5 py-4 shadow-sm transition ${
                                    isPicked
                                        ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                        : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-sm"
                                } ${checked ? "cursor-default opacity-90" : ""}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isPicked}
                                    onChange={() => toggle(option.id)}
                                    className="h-5 w-5 shrink-0 rounded accent-[#286575]"
                                />
                                <span className="text-sm font-medium leading-relaxed text-slate-800">
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {grade && (
                <div
                    role="status"
                    aria-live="assertive"
                    className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
                        grade.quality === "good"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : grade.quality === "partial"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                >
                    <p className="font-semibold">Puntaje: {grade.total}/4</p>
                    <ul className="mt-1 space-y-0.5 text-xs">
                        <li>{grade.selectiveUse ? "✓" : "✗"} Uso selectivo de tecnología</li>
                        <li>{grade.transparency ? "✓" : "✗"} Transparencia y ética</li>
                        <li>{grade.qualityControl ? "✓" : "✗"} Control de calidad</li>
                        <li>{grade.criticalJudgment ? "✓" : "✗"} Juicio crítico</li>
                    </ul>
                    <p className="mt-2">
                        {grade.quality === "good"
                            ? "Excelente. Mejoras el contenido complejo con uso ético, transparente y selectivo de las herramientas digitales."
                            : grade.quality === "partial"
                            ? "Aplicas varias decisiones correctas, pero no logras las 4 dimensiones a la vez. Revisa las marcadas con ✗ para aprobar."
                            : "Revisa el caso: no basta con usar las herramientas, hay que aplicarlas con criterio, transparencia y control de calidad."}
                    </p>
                </div>
            )}
        </section>
    );
});

IntegrationExerciseA2Simulator.displayName = "IntegrationExerciseA2Simulator";

export default IntegrationExerciseA2Simulator;