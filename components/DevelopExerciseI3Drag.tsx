"use client";

import React, { useMemo, useState, forwardRef, useImperativeHandle } from "react";

export type DevelopExerciseI3DragHandle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
    };

    type Target = {
    id: string;
    title: string;
    description: string;
    correctExt: string;
    };

    type Option = { id: string; label: string };

    type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    countTargets?: number;
    extraOptions?: ReadonlyArray<Option>;
    seed?: number;
    };

    // =============================
    // BANCO DE CONTEXTOS
    // =============================
    const BANK_TARGETS: ReadonlyArray<Target> = [
    {
        id: "T1",
        title: "Crear un video para redes sociales",
        description: "Formato comprimido y compatible.",
        correctExt: ".mp4",
    },
    {
        id: "T2",
        title: "Guardar un informe final de lectura",
        description: "Debe conservar el diseño y ser fácil de distribuir.",
        correctExt: ".pdf",
    },
    {
        id: "T3",
        title: "Publicar un podcast educativo",
        description: "Audio comprimido estándar para streaming.",
        correctExt: ".mp3",
    },
    {
        id: "T4",
        title: "Presentar diapositivas en clase",
        description: "Formato editable y compatible",
        correctExt: ".pptx",
    },
    {
        id: "T5",
        title: "Redactar y editar un informe con tu equipo",
        description: "Debe ser editable y admitido por coorporación de oficina.",
        correctExt: ".docx",
    },
    {
        id: "T6",
        title: "Publicar una nota rápida de texto plano",
        description: "Formato ligero y universal para texto sin formato.",
        correctExt: ".txt",
    },
    {
        id: "T7",
        title: "Comprimir una carpeta con varios archivos",
        description: "Compresión rápida y reduzca tamaño digital",
        correctExt: ".zip",
    },
    {
    id: "T8",
    title: "Diseñar un logotipo o diagrama vectorial",
    description: "Formato vectorial que mantiene calidad al escalar e ideal para impresión.",
    correctExt: ".svg",
    },
    {
    id: "T9",
    title: "Compartir una hoja de cálculo con fórmulas",
    description: "Formato editable y ampliamente usado en entornos laborales y educativos.",
    correctExt: ".xlsx",
    }
    ];

    // =============================
    // BANCO DE DISTRACTORES
    // =============================
    const BASE_DISTRACTORS: ReadonlyArray<Option> = [
    { id: ".avi", label: ".avi" },
    { id: ".mov", label: ".mov" },
    { id: ".wav", label: ".wav" },
    { id: ".txt", label: ".txt" },
    { id: ".docx", label: ".docx" },
    { id: ".jpg", label: ".jpg" },
    ];
    const FALLBACK_DISTRACTORS: ReadonlyArray<Option> = [
    { id: ".svg", label: ".svg" },
    { id: ".xlsx", label: ".xlsx" },
    { id: ".csv", label: ".csv" },
    { id: ".json", label: ".json" },
    { id: ".zip", label: ".zip" },
    ];

    function shuffle<T>(arr: T[], seed = Math.random()): T[] {
    let s = Math.floor((seed * 1e9) % 2 ** 31);
    const a = 1103515245, c = 12345, m = 2 ** 31;
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        s = (a * s + c) % m;
        const j = s % (i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
    }

    const DND_TYPE = "application/ladico-ext";

    function draggable(id: string) {
    return {
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.setData(DND_TYPE, id);
        e.dataTransfer.effectAllowed = "move";
        },
    };
    }

    function droppable(onDrop: (id: string) => void) {
    return {
        onDragOver: (e: React.DragEvent) => {
        if (e.dataTransfer.types.includes(DND_TYPE)) e.preventDefault();
        },
        onDrop: (e: React.DragEvent) => {
        const raw = e.dataTransfer.getData(DND_TYPE);
        if (raw) onDrop(raw);
        },
    };
    }


    const DevelopExerciseI3Drag = forwardRef<DevelopExerciseI3DragHandle, Props>(
    function DevelopExerciseI3Drag({ onEvaluate, countTargets = 4, extraOptions, seed }, ref) {
        const targets = useMemo(
        () => shuffle([...BANK_TARGETS], seed).slice(0, Math.max(1, Math.min(countTargets, BANK_TARGETS.length))),
        [countTargets, seed]
        );
        const correctOptions: Option[] = targets.map(t => ({ id: t.correctExt, label: t.correctExt }));
        const correctIds = new Set(correctOptions.map(o => o.id));
        const needed = targets.length;
        const basePool = extraOptions ?? BASE_DISTRACTORS;
        let distractorCandidates = basePool.filter(o => !correctIds.has(o.id));

        if (distractorCandidates.length < needed) {
        const extra = FALLBACK_DISTRACTORS.filter(
            o => !correctIds.has(o.id) && !distractorCandidates.some(d => d.id === o.id)
        );
        distractorCandidates = [...distractorCandidates, ...extra];
        }

        if (distractorCandidates.length < needed) {
        const deficit = needed - distractorCandidates.length;
        distractorCandidates = [
            ...distractorCandidates,
            ...shuffle([...BASE_DISTRACTORS, ...FALLBACK_DISTRACTORS], seed).slice(0, deficit),
        ];
        }

        const distractors = shuffle(distractorCandidates, seed).slice(0, needed);
        const initialPoolAll = shuffle([...correctOptions, ...distractors], seed);
        const [pool, setPool] = useState<string[]>(() => initialPoolAll.map(o => o.id));
        const [assign, setAssign] = useState<Record<string, string | null>>(
        () => Object.fromEntries(targets.map(t => [t.id, null]))
        );
        const [feedback, setFeedback] = useState<{ kind: "idle" | "success" | "error"; message?: string }>({ kind: "idle" });

        const optionMap = useMemo(
        () => Object.fromEntries(initialPoolAll.map(o => [o.id, o])) as Record<string, Option>,
        [initialPoolAll]
        );

        const setTargetExt = (targetId: string, ext: string) => {
        setAssign(prev => {
            const prevExt = prev[targetId];
            if (prevExt) setPool(p => (p.includes(prevExt) ? p : [...p, prevExt]));
            return { ...prev, [targetId]: ext };
        });
        setPool(p => p.filter(id => id !== ext));
        setFeedback({ kind: "idle" });
        };

        const clearTarget = (targetId: string) => {
        setAssign(prev => {
            const prevExt = prev[targetId];
            if (prevExt) setPool(p => (p.includes(prevExt) ? p : [...p, prevExt]));
            return { ...prev, [targetId]: null };
        });
        setFeedback({ kind: "idle" });
        };

        const evaluate = () => {
        let okAll = true;
        const wrong: string[] = [];
        for (const t of targets) {
            const picked = assign[t.id];
            if (picked !== t.correctExt) {
            okAll = false;
            wrong.push(t.title);
            }
        }
        if (okAll) {
            setFeedback({ kind: "success", message: "¡Excelente! Todos los contextos tienen el formato correcto." });
            onEvaluate?.(1);
        } else {
            setFeedback({
            kind: "error",
            message: `Revisa: ${wrong.join(" · ")}.`,
            });
            onEvaluate?.(0);
        }
        return okAll;
        };

        useImperativeHandle(ref, () => ({
        check: evaluate,
        isReady: () => Object.values(assign).every(v => !!v),
        reset: () => {
            setPool(initialPoolAll.map(o => o.id));
            setAssign(Object.fromEntries(targets.map(t => [t.id, null])));
            setFeedback({ kind: "idle" });
            onEvaluate?.(0);
        },
        }));

        return (
        <section className="space-y-6">
            {/* Pool */}
            <div className="rounded-2xl border bg-white p-4 shadow">
            <h3 className="font-semibold text-slate-800 mb-2">Extensiones disponibles</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 min-h-[48px]">
                {pool.length === 0 && (
                <li className="text-sm text-slate-400 italic col-span-full">No quedan extensiones en el pool.</li>
                )}
                {pool.map(id => (
                <li
                    key={id}
                    className="px-3 py-2 rounded-xl border bg-white text-sm font-medium text-slate-800 cursor-grab active:cursor-grabbing hover:bg-slate-50"
                    {...draggable(id)}
                >
                    {optionMap[id]?.label ?? id}
                </li>
                ))}
            </ul>
            </div>

            {/* Targets */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {targets.map(t => {
                const picked = assign[t.id];
                return (
                <div
                    key={t.id}
                    className={`rounded-2xl p-4 border-2 transition ${
                    picked ? "bg-blue-50 border-blue-400" : "bg-white border-dashed border-slate-200"
                    }`}
                    {...droppable((ext) => setTargetExt(t.id, ext))}
                >
                    <h4 className="font-semibold text-slate-800 mb-1">{t.title}</h4>
                    <p className="text-sm text-slate-600 mb-3">{t.description}</p>

                    <div className="min-h-[48px]">
                    {!picked ? (
                        <p className="text-xs text-slate-400 italic">Suelta aquí la extensión.</p>
                    ) : (
                        <div className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
                        <span className="text-sm font-medium text-slate-800">{picked}</span>
                        <button
                            type="button"
                            onClick={() => clearTarget(t.id)}
                            className="text-xs rounded px-2 py-1 hover:bg-slate-100 text-slate-600"
                        >
                            Quitar
                        </button>
                        </div>
                    )}
                    </div>
                </div>
                );
            })}
            </div>

            {/* Feedback */}
            {feedback.kind !== "idle" && (
            <div
                role="status"
                aria-live="assertive"
                className={`rounded-xl px-4 py-3 text-sm shadow ${
                feedback.kind === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
            >
                {feedback.kind === "success" ? "✅ " : "❌ "}
                {feedback.message}
            </div>
            )}
        </section>
        );
    }
);

export default DevelopExerciseI3Drag;
