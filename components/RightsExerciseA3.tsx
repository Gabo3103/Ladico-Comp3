"use client";

import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";

export type CatId =
    | "VERIFY_SOURCE_AND_LICENSE"
    | "FOLLOW_OPEN_LICENSE_TERMS"
    | "REQUEST_COPYRIGHT_PERMISSION"
    | "AVOID_UNAUTHORIZED_DERIVATIVE"
    | "REVIEW_AI_OUTPUT_BEFORE_USE"
    | "PROTECT_PRIVACY_AND_CONFIDENTIALITY";

export type CaseId = string;

export type Category = { id: CatId; title: string; hint?: string };
export type CaseCard = { id: CaseId; text: string; correctFor: CatId };
type CaseGroup = "ai" | "image" | "complex";
type BankCase = CaseCard & { group: CaseGroup };

export type RightsExerciseA3Props = {
    onEvaluate?: (point: 0 | 1) => void;
};

export type RightsExerciseA3Handle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
};

const DRAG_TYPE = "application/ladico-cat-id";

const CATEGORIES: Category[] = [
    {
        id: "VERIFY_SOURCE_AND_LICENSE",
        title: "Comprobar origen y permisos",
        hint: "Verificar de dónde viene el contenido antes de usarlo.",
    },
    {
        id: "FOLLOW_OPEN_LICENSE_TERMS",
        title: "Respetar condiciones de reutilización",
        hint: "Cumplir lo que la licencia exige al reutilizar.",
    },
    {
        id: "REQUEST_COPYRIGHT_PERMISSION",
        title: "Solicitar autorización de uso",
        hint: "Pedir permiso cuando no hay licencia clara.",
    },
    {
        id: "AVOID_UNAUTHORIZED_DERIVATIVE",
        title: "Evitar transformación indebida",
        hint: "No publicar versiones que copian demasiado de otra obra.",
    },
    {
        id: "REVIEW_AI_OUTPUT_BEFORE_USE",
        title: "Validar contenido antes de usarlo",
        hint: "Revisar lo generado por IA antes de confiar en ello.",
    },
    {
        id: "PROTECT_PRIVACY_AND_CONFIDENTIALITY",
        title: "Proteger privacidad y confidencialidad",
        hint: "Cuidar la imagen o los datos de otras personas.",
    },
];

const CASE_BANK: BankCase[] = [
    {
        id: "IMG1",
        group: "image",
        text:
            "Un estudiante recibe en un chat cerrado una imagen personal y sensible de un compañero, y piensa reenviarla a otro grupo sin haberle pedido autorización.",
        correctFor: "PROTECT_PRIVACY_AND_CONFIDENTIALITY",
    },
    {
        id: "IMG2",
        group: "image",
        text:
            "Un curso prepara una publicación con una fotografía tomada en una actividad interna; una estudiante aparece de frente y no participó en la revisión del material.",
        correctFor: "PROTECT_PRIVACY_AND_CONFIDENTIALITY",
    },
    {
        id: "IMG3",
        group: "image",
        text:
            "Un colegio diseña un afiche con fotos de estudiantes menores de edad y detecta que el registro de consentimientos no está completo.",
        correctFor: "PROTECT_PRIVACY_AND_CONFIDENTIALITY",
    },
    {
        id: "AI1",
        group: "ai",
        text:
            "Un asistente digital entrega cifras y referencias para una publicación escolar; el texto se copiaría tal como aparece, sin revisar documentos originales.",
        correctFor: "REVIEW_AI_OUTPUT_BEFORE_USE",
    },
    {
        id: "AI2",
        group: "ai",
        text:
            "Una persona genera recomendaciones de salud con una herramienta automática y las publica como orientación práctica para otras personas.",
        correctFor: "REVIEW_AI_OUTPUT_BEFORE_USE",
    },
    {
        id: "AI3",
        group: "ai",
        text:
            "Una persona crea una imagen nueva, pero conserva composición, personajes y rasgos visuales centrales de una ilustración comercial conocida.",
        correctFor: "AVOID_UNAUTHORIZED_DERIVATIVE",
    },
    {
        id: "CX1",
        group: "complex",
        text:
            "Una cuenta prepara una denuncia pública a partir de una captura reenviada; no se conoce la publicación original ni quién la produjo.",
        correctFor: "VERIFY_SOURCE_AND_LICENSE",
    },
    {
        id: "CX2",
        group: "complex",
        text:
            "Un creador modifica colores y detalles de una obra digital ajena, pero la estructura y los elementos principales siguen siendo reconocibles.",
        correctFor: "AVOID_UNAUTHORIZED_DERIVATIVE",
    },
    {
        id: "CX3",
        group: "complex",
        text:
            "Un equipo usa una imagen de un repositorio abierto; la ficha exige mencionar creador, enlace y mantener las mismas reglas al adaptar.",
        correctFor: "FOLLOW_OPEN_LICENSE_TERMS",
    },
    {
        id: "CX4",
        group: "complex",
        text:
            "Una marca quiere incorporar en una campaña pagada una ilustración encontrada en un blog personal, donde no aparecen condiciones de reutilización.",
        correctFor: "REQUEST_COPYRIGHT_PERMISSION",
    },
];

function pickRandomItems<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function pickExerciseCases(): CaseCard[] {
    const aiCase = pickRandomItems(CASE_BANK.filter((item) => item.group === "ai"), 1)[0];
    const imageCase = pickRandomItems(
        CASE_BANK.filter((item) => item.group === "image"),
        1
    )[0];

    // Evita que el caso "complex" quede con la misma norma correcta que el caso de IA
    // (ej. AI3 y CX2 comparten "AVOID_UNAUTHORIZED_DERIVATIVE") — si eso ocurriera,
    // el ejercicio sería irresoluble una vez que cada norma se usa una sola vez.
    const usedCategories = new Set<CatId>([aiCase.correctFor, imageCase.correctFor]);
    const complexPool = CASE_BANK.filter(
        (item) => item.group === "complex" && !usedCategories.has(item.correctFor)
    );
    const complexCase = pickRandomItems(complexPool, 1)[0];

    return [aiCase, imageCase, complexCase].sort(() => Math.random() - 0.5);
}

const RightsExerciseA3 = forwardRef<RightsExerciseA3Handle, RightsExerciseA3Props>(
    function RightsExerciseA3({ onEvaluate }, ref) {
        const [cases] = useState<CaseCard[]>(() => pickExerciseCases());
        const [dragging, setDragging] = useState<CatId | null>(null);
        const [dragOverCase, setDragOverCase] = useState<CaseId | null>(null);
        const [assign, setAssign] = useState<Record<CaseId, CatId | null>>(() =>
            cases.reduce((acc, c) => {
                acc[c.id] = null;
                return acc;
            }, {} as Record<CaseId, CatId | null>)
        );
        const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
        const [showHints, setShowHints] = useState(false);

        const catMap = useMemo(
            () =>
                Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
                    CatId,
                    Category
                >,
            []
        );

        const usedCatIds = useMemo(
            () => new Set(Object.values(assign).filter((v): v is CatId => !!v)),
            [assign]
        );
        const availableCategories = useMemo(
            () => CATEGORIES.filter((cat) => !usedCatIds.has(cat.id)),
            [usedCatIds]
        );

        function draggableCat(id: CatId) {
            return {
                draggable: true,
                onDragStart: (e: React.DragEvent) => {
                    e.dataTransfer.setData(DRAG_TYPE, id);
                    e.dataTransfer.effectAllowed = "copy";
                    setDragging(id);
                },
                onDragEnd: () => {
                    setDragging(null);
                    setDragOverCase(null);
                },
            };
        }

        function droppableCase(caseId: CaseId, onDropCat: (catId: CatId) => void) {
            return {
                onDragEnter: (e: React.DragEvent) => {
                    if (e.dataTransfer.types.includes(DRAG_TYPE)) {
                        e.preventDefault();
                        setDragOverCase(caseId);
                    }
                },
                onDragOver: (e: React.DragEvent) => {
                    if (e.dataTransfer.types.includes(DRAG_TYPE)) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "copy";
                        setDragOverCase(caseId);
                    }
                },
                onDragLeave: (e: React.DragEvent) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                        setDragOverCase((current) => (current === caseId ? null : current));
                    }
                },
                onDrop: (e: React.DragEvent) => {
                    const raw = e.dataTransfer.getData(DRAG_TYPE);
                    if (raw) onDropCat(raw as CatId);
                    setDragging(null);
                    setDragOverCase(null);
                },
            };
        }

        const setCaseCat = (caseId: CaseId, catId: CatId) => {
            setAssign((prev) => ({ ...prev, [caseId]: catId }));
        };

        const clearCase = (caseId: CaseId) => {
            setAssign((prev) => ({ ...prev, [caseId]: null }));
        };

        const check = () => {
            let correctCount = 0;
            const rows: React.ReactNode[] = [];

            for (const c of cases) {
                const picked = assign[c.id];
                const ok = picked === c.correctFor;
                if (ok) {
                    correctCount += 1;
                } else {
                    rows.push(
                        <li key={c.id}>
                            {picked ? "Revisa este caso." : "Caso sin directriz asignada."}
                        </li>
                    );
                }
            }

            // Bandas según la planilla (escala de 3, no de 5):
            // 3=Alto, 2=Medio (aprueba), 0-1=Bajo.
            const level: "Alto" | "Medio" | "Bajo" =
                correctCount === 3 ? "Alto" : correctCount === 2 ? "Medio" : "Bajo";
            const approved = correctCount >= 2;

            setFeedback(
                <div
                    className={`mt-4 rounded-2xl p-3 ${
                        approved ? "bg-green-50" : "bg-red-50"
                    }`}
                >
                    <p className={`font-medium ${approved ? "text-green-700" : "text-red-700"}`}>
                        Resultado: {correctCount} de {cases.length} — Nivel {level}
                    </p>
                    {level === "Alto" ? (
                        <p className="mt-1 text-green-700">
                            Excelente. Todas las asignaciones son coherentes.
                        </p>
                    ) : level === "Medio" ? (
                        <div className="mt-1 text-green-700">
                            Aprobado. Distingues la mayoría de los casos, revisa el detalle:
                            <ul className="list-disc pl-5 mt-2 text-sm">{rows}</ul>
                        </div>
                    ) : (
                        <div className="mt-1 text-red-700">
                            No aprobado. Aún hay casos por revisar:
                            <ul className="list-disc pl-5 mt-2 text-sm">{rows}</ul>
                        </div>
                    )}
                </div>
            );

            onEvaluate?.(approved ? 1 : 0);
            return approved;
        };

        useImperativeHandle(ref, () => ({
            check,
            isReady: () => cases.every((item) => !!assign[item.id]),
            reset: () => {
                setAssign(
                    cases.reduce((acc, item) => {
                        acc[item.id] = null;
                        return acc;
                    }, {} as Record<CaseId, CatId | null>)
                );
                setFeedback(null);
                onEvaluate?.(0);
            },
        }));

        return (
            <section>
                <div className="mb-6 rounded-2xl border bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-800">
                            Normas y acciones responsables
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowHints((v) => !v)}
                            className="text-xs font-medium text-[#286575] underline-offset-2 hover:underline"
                        >
                            {showHints ? "Ocultar descripciones" : "Ver descripciones"}
                        </button>
                    </div>
                    <ul className="grid min-h-[56px] grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {availableCategories.length === 0 && (
                            <li className="col-span-full py-2 text-center text-sm italic text-slate-400">
                                Ya asignaste una directriz a cada caso.
                            </li>
                        )}
                        {availableCategories.map((cat) => (
                            <li
                                key={cat.id}
                                className={`rounded-xl border bg-white p-2.5 text-sm transition-all duration-150 ${
                                    dragging === cat.id
                                        ? "scale-[1.02] border-[#286575] bg-[#e4f3f5] shadow-lg ring-2 ring-[#286575]/30"
                                        : "hover:-translate-y-0.5 hover:border-[#286575]/40 hover:bg-slate-50 hover:shadow-md"
                                } cursor-grab active:cursor-grabbing`}
                                {...draggableCat(cat.id)}
                            >
                                <span className="font-medium text-slate-800">
                                    {cat.title}
                                </span>
                                {showHints && cat.hint && (
                                    <span className="mt-0.5 block text-xs text-slate-500">
                                        {cat.hint}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-4">
                    {cases.map((c) => {
                        const picked = assign[c.id];
                        const isDropTarget = dragOverCase === c.id;

                        return (
                            <div
                                key={c.id}
                                className={`rounded-2xl border-2 p-3 transition-all duration-150 ${
                                    isDropTarget
                                        ? "border-[#286575] bg-[#e4f3f5] shadow-lg ring-2 ring-[#286575]/20"
                                        : picked
                                          ? "border-[#286575] bg-[#e4f3f5]"
                                          : dragging
                                            ? "border-dashed border-[#286575]/60 bg-white"
                                            : "border-dashed border-slate-200 bg-white"
                                }`}
                                {...droppableCase(c.id, (catId) => setCaseCat(c.id, catId))}
                            >
                                <p className="text-sm text-slate-700">{c.text}</p>
                                <div className="mt-3 min-h-[56px]">
                                    {!picked ? (
                                        <p
                                            className={`text-xs italic ${
                                                isDropTarget
                                                    ? "font-medium text-[#286575]"
                                                    : dragging
                                                      ? "text-[#286575]"
                                                      : "text-slate-400"
                                            }`}
                                        >
                                            {isDropTarget
                                                ? "Suelta aquí para asignar esta directriz"
                                                : dragging
                                                  ? "Este caso puede recibir la directriz arrastrada."
                                                  : "Suelta aquí la norma o directriz"}
                                        </p>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2 rounded-xl border bg-white p-2.5 shadow-sm">
                                            <div className="text-sm font-medium">
                                                {catMap[picked].title}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => clearCase(c.id)}
                                                className="rounded-full px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100"
                                                aria-label="Quitar"
                                                title="Quitar norma"
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

                {feedback}
            </section>
        );
    }
);

RightsExerciseA3.displayName = "RightsExerciseA3";

export default RightsExerciseA3;