"use client";

import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";

export type DevelopExerciseI1Handle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
    };

    export type Mode = "image" | "text";

    type Option = {
    id: string;
    label: string;
    isCorrect: boolean;
    };

    type Props = {
    mode: Mode;               
    onEvaluate?: (point: 0 | 1) => void;
    };

    const BANK_IMAGE: ReadonlyArray<Option> = [
    { id: "jpg",  label: "jpg",  isCorrect: true  },
    { id: "mp3",  label: "mp3",  isCorrect: false },
    { id: "png",  label: "png",  isCorrect: true  },
    { id: "gif",  label: "gif",  isCorrect: true  },
    { id: "csv",  label: "csv",  isCorrect: false },
    { id: "avi",  label: "avi",  isCorrect: false },
    { id: "pdf",  label: "pdf",  isCorrect: false },
    { id: "bmp",  label: "bmp",  isCorrect: true  },
    { id: "webp", label: "webp", isCorrect: true  },
    ];

    const BANK_TEXT: ReadonlyArray<Option> = [
    { id: "txt",  label: "txt",  isCorrect: true  },
    { id: "jpg",  label: "jpg",  isCorrect: false },
    { id: "mp4",  label: "mp4",  isCorrect: false },
    { id: "md",   label: "md",   isCorrect: true  },
    { id: "docx", label: "docx", isCorrect: true  },
    { id: "pdf",  label: "pdf",  isCorrect: true  },
    { id: "png",  label: "png",  isCorrect: false },
    { id: "odt",  label: "odt",  isCorrect: true  },
    { id: "webp",  label: "webp",  isCorrect: false },
    ];

    const DevelopExerciseI1 = forwardRef<DevelopExerciseI1Handle, Props>(
    function DevelopExerciseI1({ mode, onEvaluate }, ref) {
        const options = useMemo(() => (mode === "image" ? BANK_IMAGE : BANK_TEXT), [mode]);

        const [selected, setSelected] = useState<Record<string, boolean>>({});
        const [feedback, setFeedback] = useState<{ kind: "idle" | "success" | "error"; message?: string }>({ kind: "idle" });

        const correctIds = useMemo(() => options.filter(o => o.isCorrect).map(o => o.id), [options]);

        function toggle(id: string) {
        setSelected(prev => ({ ...prev, [id]: !prev[id] }));
        }

        function evaluate() {
        const chosen = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
        const missing = correctIds.filter(id => !chosen.includes(id));
        const wrong = chosen.filter(id => !correctIds.includes(id));
        const ok = missing.length === 0 && wrong.length === 0 && chosen.length > 0;

        if (ok) {
            setFeedback({ kind: "success", message: "¡Muy bien! Selección correcta." });
            onEvaluate?.(1);
        } else {
            const msgParts: string[] = [];
            setFeedback({
            kind: "error",
            message:
                (mode === "image"
                ? "Recuerda: formatos de imagen típicos."
                : "Recuerda: formatos de texto o documento.") +
                (msgParts.length ? ` (${msgParts.join(" · ")})` : ""),
            });
            onEvaluate?.(0);
        }
        return ok;
        }

        useImperativeHandle(ref, () => ({
        check: evaluate,
        isReady: () => Object.values(selected).some(Boolean),
        reset: () => {
            setSelected({});
            setFeedback({ kind: "idle" });
            onEvaluate?.(0);
        },
        }));

        return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {options.map(opt => {
                const isChecked = !!selected[opt.id];
                return (
                <label
                    key={opt.id}
                    className={`flex items-center gap-3 rounded-2xl border p-3 shadow transition hover:shadow-lg cursor-pointer select-none ${
                    isChecked ? "border-emerald-500 ring-2 ring-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                    }`}
                >
                    <input
                    type="checkbox"
                    className="h-5 w-5 accent-emerald-600 rounded"
                    checked={isChecked}
                    onChange={() => toggle(opt.id)}
                    />
                    <span className="font-medium text-slate-800">.{opt.label}</span>
                </label>
                );
            })}
            </div>

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
        </div>
        );
    }
);

export default DevelopExerciseI1;
