"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";

export type RightsExerciseA2Handle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
    };

    type Question = {
    id: string;
    title: string;                         
    expectedLicense: string;                
    usageOptions: ReadonlyArray<string>;    
    usageCorrect: string;                   
    };

    type Props = {
    pageUrl: string;
    questions: Question[];
    onEvaluate?: (point: 0 | 1) => void;
    };

    function normalize(s: string) {
    return s.toLowerCase().replace(/\s+/g, " ").replace(/[–—]/g, "-").trim();
    }

    const RightsExerciseA2 = forwardRef<RightsExerciseA2Handle, Props>(
    ({ pageUrl, questions, onEvaluate }, ref) => {
        const [licenses, setLicenses] = useState<Record<string, string>>({});
        const [picks, setPicks] = useState<Record<string, string | "">>({});
        const [result, setResult] = useState<{ ok: boolean; msg: React.ReactNode }>();

        useImperativeHandle(ref, () => ({
        check: () => handleCheck(),
        isReady: () => questions.length > 0,
        reset: () => {
            setLicenses({});
            setPicks({});
            setResult(undefined);
        },
        }));

        const handleCheck = () => {
        let allOk = true;
        const rows: React.ReactNode[] = [];

        for (const q of questions) {
            const typed = normalize(licenses[q.id] || "");
            const expected = normalize(q.expectedLicense);
            const typedOk = typed.includes(expected);

            const pick = picks[q.id] ?? "";
            const pickOk = normalize(pick) === normalize(q.usageCorrect);

            const ok = typedOk && pickOk;
            if (!ok) allOk = false;

            rows.push(
            <li key={q.id}>
                {q.title}: {ok ? "✅ Correcto" : "❌ Revisa"}{" "}
                {!typedOk && (
                <>· licencia real: <b>{q.expectedLicense}</b>{" "}</>
                )}
                {!pickOk && (
                <>· uso correcto: <b>{q.usageCorrect}</b></>
                )}
            </li>
            );
        }

        setResult({
            ok: allOk,
            msg: allOk ? (
            <p className="text-green-700">✅ Muy bien. Identificaste licencias y usos correctamente.</p>
            ) : (
            <div className="text-red-700">
                ❌ Algunas respuestas no coinciden. Comprueba la página de origen.
                <ul className="list-disc pl-5 mt-2 text-sm">{rows}</ul>
            </div>
            ),
        });

        onEvaluate?.(allOk ? 1 : 0);
        return allOk;
        };

        return (
        <section>
        {/* Enlace único */}
        <div className="mb-4 flex">
            <a
                href={pageUrl}
                target="_blank"
                rel="noreferrer"
                className="
                    inline-flex items-center gap-2
                    px-3 py-2 rounded-full border border-teal-700
                    bg-teal-50 text-teal-800 text-sm font-medium
                    shadow-sm
                    transition-all duration-200 ease-out
                    hover:bg-teal-100 hover:border-teal-800 hover:shadow-md
                    hover:scale-[1.03]
                "
            >
                Abrir recurso
                <svg width="16" height="16" viewBox="0 0 24 24" className="inline-block">
                    <path
                        d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h5V3H3v7h2V5z"
                        fill="currentColor"
                    />
                </svg>
            </a>
        </div>


            {/* Preguntas */}
            <div className="space-y-6">
            {questions.map((q) => (
                <div key={q.id} className="p-4 border rounded-2xl bg-white shadow-sm">
                <label className="block text-sm font-medium text-slate-800 mb-1">
                    {q.title}
                </label>

                {/* Texto licencia */}
                <input
                    type="text"
                    className="w-full rounded-xl border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="Escribe la atribución correcta aquí"
                    value={licenses[q.id] || ""}
                    onChange={(e) =>
                    setLicenses((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                />

                {/* Uso (dropdown por VALOR) */}
                <div className="mt-3">
                    <select
                    className="w-full rounded-xl border p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    value={(picks[q.id] as string | "") ?? ""}
                    onChange={(e) =>
                        setPicks((prev) => ({
                        ...prev,
                        [q.id]: e.target.value as string,
                        }))
                    }
                    >
                    <option value="">Selecciona cómo se puede usar…</option>
                    {q.usageOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>
                        {opt}
                        </option>
                    ))}
                    </select>
                </div>
                </div>
            ))}
            </div>

            {/* Feedback */}
            {result && (
            <div className={`mt-6 rounded-2xl p-3 ${result.ok ? "bg-green-50" : "bg-red-50"}`}>
                {result.msg}
            </div>
            )}
        </section>
        );
    }
);


export default RightsExerciseA2;
