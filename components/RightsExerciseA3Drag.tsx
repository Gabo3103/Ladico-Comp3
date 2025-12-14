"use client";

import React, { useMemo, useState } from "react";

// ===== Types =====
export type CatId =
    | "CC_BY_4"
    | "CC_BY_SA_4"
    | "CC_BY_NC"
    | "CC0"
    | "COPYRIGHT"
    | "IMG_ADULTO"
    | "IMG_MENOR"
    | "CC_BY_ND_NC"   
    | "GPL";          

export type CaseId =
    | "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9";

export type Category = { id: CatId; title: string; hint?: string };
export type CaseCard = { id: CaseId; text: string; correctFor: CatId };

export type RightsExerciseA3DragProps = {
    categories: Category[]; 
    cases: CaseCard[];      
    onEvaluate?: (point: 0 | 1) => void;
    };

    const DRAG_TYPE = "application/ladico-cat-id";


    function draggableCat(id: CatId) {
    return {
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.setData(DRAG_TYPE, id as string);
        e.dataTransfer.effectAllowed = "move"; 
        },
    };
    }

    function droppableCase(onDropCat: (catId: CatId) => void) {
    return {
        onDragOver: (e: React.DragEvent) => {
        if (e.dataTransfer.types.includes(DRAG_TYPE)) e.preventDefault();
        },
        onDrop: (e: React.DragEvent) => {
        const raw = e.dataTransfer.getData(DRAG_TYPE);
        if (raw) onDropCat(raw as CatId);
        },
    };
    }

    export default function RightsExerciseA3Drag({
    categories,
    cases,
    onEvaluate,
    }: RightsExerciseA3DragProps) {
    const [pool, setPool] = useState<CatId[]>(() => categories.map((c) => c.id));

    const [assign, setAssign] = useState<Record<CaseId, CatId | null>>(
        () =>
        cases.reduce((acc, c) => {
            acc[c.id] = null;
            return acc;
        }, {} as Record<CaseId, CatId | null>)
    );

    const catMap = useMemo(
        () => Object.fromEntries(categories.map((c) => [c.id, c])) as Record<CatId, Category>,
        [categories]
    );
    const caseMap = useMemo(
        () => Object.fromEntries(cases.map((c) => [c.id, c])) as Record<CaseId, CaseCard>,
        [cases]
    );

    // Coloca una licencia en un caso (consume del pool y libera la anterior si había)
    const setCaseCat = (caseId: CaseId, catId: CatId) => {
        setAssign((prev) => {
        const prevCat = prev[caseId];
        if (prevCat) {
            setPool((p) => (p.includes(prevCat) ? p : [...p, prevCat]));
        }
        return { ...prev, [caseId]: catId };
        });
        setPool((p) => p.filter((id) => id !== catId));
    };
    const clearCase = (caseId: CaseId) => {
        setAssign((prev) => {
        const prevCat = prev[caseId];
        if (prevCat) {
            setPool((p) => (p.includes(prevCat) ? p : [...p, prevCat]));
        }
        return { ...prev, [caseId]: null };
        });
    };

    const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
    const check = () => {
        let okAll = true;
        const rows: React.ReactNode[] = [];

        for (const c of cases) {
        const picked = assign[c.id];
        const ok = picked === c.correctFor;
        if (!ok) okAll = false;
        rows.push(
            <li key={c.id}>
            {/* No mostramos la respuesta correcta para no dar pistas */}
            {picked ? "❌ Revisa este caso." : "⚠️ Sin licencia asignada."}
            </li>
        );
        }

        setFeedback(
        <div className={`mt-4 rounded-2xl p-3 ${okAll ? "bg-green-50" : "bg-red-50"}`}>
            {okAll ? (
            <p className="text-green-700">✅ ¡Excelente! Todas las asignaciones son coherentes.</p>
            ) : (
            <div className="text-red-700">
                ❌ Aún hay errores o casos sin asignar:
                <ul className="list-disc pl-5 mt-2 text-sm">{rows}</ul>
            </div>
            )}
        </div>
        );

        onEvaluate?.(okAll ? 1 : 0);
        return okAll;
    };

    return (
        <section>
        <div className="mb-6 rounded-2xl border p-4 bg-white">
            <h3 className="font-semibold text-slate-800 mb-2">Licencias y Normas</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 min-h-[56px]">
            {pool.length === 0 && (
                <li className="text-sm text-slate-400 italic">No quedan licencias disponibles.</li>
            )}
            {pool.map((id) => (
                <li
                key={id}
                className="p-2.5 rounded-xl border text-sm bg-white hover:bg-slate-50 cursor-grab active:cursor-grabbing"
                {...draggableCat(id)}
                title={catMap[id].hint ?? catMap[id].title}
                >
                <span className="font-medium text-slate-800">{catMap[id].title}</span>
                {catMap[id].hint && (
                    <span className="block text-xs text-slate-500">{catMap[id].hint}</span>
                )}
                </li>
            ))}
            </ul>
        </div>

        <div className="space-y-4">

            {cases.map((c) => {
            const picked = assign[c.id];
            return (
                <div
                key={c.id}
                className={`rounded-2xl p-3 border-2 ${
                    picked ? "bg-blue-50 border-blue-400" : "bg-white border-dashed border-slate-200"
                }`}
                {...droppableCase((catId) => setCaseCat(c.id, catId))}
                >
                <p className="text-sm text-slate-700">{c.text}</p>
                <div className="mt-3 min-h-[56px]">
                    {!picked ? (
                    <p className="text-xs text-slate-400 italic">
                        Suelta aquí la licencia/norma.
                    </p>
                    ) : (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl border bg-white">
                        <div>
                        <div className="text-sm font-medium">
                            {catMap[picked].title}
                        </div>
                        {catMap[picked].hint && (
                            <div className="text-xs text-slate-500">
                            {catMap[picked].hint}
                            </div>
                        )}
                        </div>
                        <button
                            type="button"
                            onClick={() => clearCase(c.id)}
                            className="rounded-md hover:bg-slate-100 px-2 py-1 text-xs text-slate-600"
                            aria-label="Quitar"
                            title="Quitar licencia"
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

        <div className="mt-6 flex gap-3 justify-end">
            <button
            className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
            onClick={check}
            >
            Comprobar
            </button>
        </div>

        {feedback}
        </section>
    );
}
