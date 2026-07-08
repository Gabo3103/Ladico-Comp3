"use client";

import React, {
    forwardRef,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

export type DevelopExerciseI2Handle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
};

type Step = { id: string; text: string };
type Scenario = {
    id: string;
    title: string;
    description: string;
    steps: Step[];
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    countScenarios?: number;
    seed?: number;
};

const BANK: Scenario[] = [
    {
        id: "S_VIDEO",
        title: "Video breve para redes",
        description:
            "Debes crear un video informativo corto y usar ayudas digitales para acelerar subtítulos, cortes y revisión final",
        steps: [
            { id: "v1", text: "Definir objetivo, audiencia, duración y formato del video" },
            { id: "v2", text: "Preparar guion breve, clips, imágenes y recursos visuales necesarios" },
            { id: "v3", text: "Editar el video usando cortes, títulos y subtítulos sugeridos por la herramienta" },
            { id: "v4", text: "Revisar manualmente claridad, datos, subtítulos y adecuación al público" },
            { id: "v5", text: "Exportar en formato adecuado y publicar en la plataforma destino" },
        ],
    },
    {
        id: "S_PRESENTATION",
        title: "Presentación para clase",
        description:
            "Debes crear una presentación clara, combinando contenido propio con sugerencias automáticas de diseño",
        steps: [
            { id: "p1", text: "Definir tema, público objetivo y mensaje principal de la presentación" },
            { id: "p2", text: "Organizar las ideas en una estructura de inicio, desarrollo y cierre" },
            { id: "p3", text: "Diseñar diapositivas con texto breve, imágenes y sugerencias visuales de la herramienta" },
            { id: "p4", text: "Revisar coherencia, legibilidad, fuentes y pertinencia de los recursos usados" },
            { id: "p5", text: "Exportar en .pptx o .pdf y compartir la versión final" },
        ],
    },
    {
        id: "S_REPORT",
        title: "Informe digital",
        description:
            "Debes producir un informe breve y usar herramientas de apoyo para ordenar, revisar y mejorar la redacción",
        steps: [
            { id: "r1", text: "Definir propósito, destinatario y estructura del informe" },
            { id: "r2", text: "Reunir información, registrar fuentes y preparar un primer borrador" },
            { id: "r3", text: "Usar apoyo digital para revisar redacción, organización y posibles errores" },
            { id: "r4", text: "Comprobar datos, citas, coherencia y formato antes de cerrar el documento" },
            { id: "r5", text: "Guardar o exportar como .pdf y enviarlo por el canal solicitado" },
        ],
    },
    {
        id: "S_INFOGRAPHIC",
        title: "Infografía educativa",
        description:
            "Debes crear una infografía usando plantillas, recursos visuales y revisión asistida para comunicar datos clave",
        steps: [
            { id: "g1", text: "Definir tema, datos principales y objetivo comunicativo" },
            { id: "g2", text: "Elegir tamaño, plantilla, paleta y estilo visual apropiado" },
            { id: "g3", text: "Integrar textos, iconos, gráficos y sugerencias visuales de la herramienta" },
            { id: "g4", text: "Revisar exactitud de datos, jerarquía visual y comprensión del mensaje" },
            { id: "g5", text: "Exportar como imagen o PDF según el uso final" },
        ],
    },
    {
        id: "S_GUIDE",
        title: "Guía paso a paso",
        description:
            "Debes crear una guía digital para explicar un procedimiento y apoyarte en herramientas de edición y revisión",
        steps: [
            { id: "d1", text: "Definir qué procedimiento se explicará y quién usará la guía" },
            { id: "d2", text: "Dividir el procedimiento en pasos breves y ordenados" },
            { id: "d3", text: "Agregar capturas, ejemplos y mejoras de redacción sugeridas por la herramienta" },
            { id: "d4", text: "Probar si otra persona puede seguir la guía sin perderse" },
            { id: "d5", text: "Corregir detalles, exportar y compartir la versión final" },
        ],
    },
    {
        id: "S_POSTER",
        title: "Afiche digital",
        description:
            "Debes diseñar un afiche para una campaña escolar usando recursos visuales y apoyo automático de composición",
        steps: [
            { id: "a1", text: "Definir mensaje, público y llamado a la acción del afiche" },
            { id: "a2", text: "Seleccionar imágenes, colores, tipografías y recursos permitidos" },
            { id: "a3", text: "Componer el diseño usando plantillas o sugerencias automáticas de la plataforma" },
            { id: "a4", text: "Revisar legibilidad, contraste, permisos de recursos y claridad del mensaje" },
            { id: "a5", text: "Exportar en el formato requerido para impresión o publicación digital" },
        ],
    },
];

function shuffle<T>(arr: T[], seed = Math.random()): T[] {
    // Generador mulberry32: el LCG anterior (a*s+c)%m estaba sesgado para arreglos
    // pequeños (ej. 3 elementos), haciendo que ciertas opciones casi nunca salieran.
    let a = Math.floor(seed * 1e9) | 0;
    const rand = () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const out = [...arr];

    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }

    return out;
}

const DND_TYPE = "application/ladico-develop-step";

function reorderByIds<T extends { id: string }>(items: T[], draggedId: string, targetId: string) {
    if (draggedId === targetId) return items;

    const next = [...items];
    const from = next.findIndex((item) => item.id === draggedId);
    const to = next.findIndex((item) => item.id === targetId);

    if (from < 0 || to < 0) return items;

    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}

function disorderSteps(steps: Step[]) {
    const validOrder = steps.map((step) => step.id);

    for (let attempt = 0; attempt < 30; attempt++) {
        const candidate = shuffle(steps, Math.random());
        const misplaced = candidate.filter((step, index) => step.id !== validOrder[index]).length;

        if (misplaced >= Math.max(3, validOrder.length - 1)) return candidate;
    }

    return [...steps.slice(1), steps[0]];
}

type FeedbackTier = "success" | "partial" | "low";

const DevelopExerciseI2Core = forwardRef<
    { check: () => boolean },
    { scenario: Scenario; onEvaluate?: (point: 0 | 1) => void }
>(function DevelopExerciseI2Core({ scenario, onEvaluate }, ref) {
    const initial = useMemo(() => disorderSteps(scenario.steps), [scenario.id]);
    const [order, setOrder] = useState<Step[]>(initial);
    const [dragId, setDragId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<null | { tier: FeedbackTier; msg: string; correctCount: number; total: number }>(null);

    // Cuenta cuántos pasos quedaron en su posición correcta (puntaje parcial),
    // en lugar de exigir coincidencia exacta de las 5 posiciones.
    const countCorrectPositions = (arr: Step[]) => {
        const validOrder = scenario.steps.map((step) => step.id);
        return arr.reduce(
            (count, step, index) => (step.id === validOrder[index] ? count + 1 : count),
            0
        );
    };

    const onDragStart = (id: string, e: React.DragEvent) => {
        setDragId(id);
        e.dataTransfer.setData(DND_TYPE, id);
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragEnter = (targetId: string) => {
        setOverId(targetId);
        setOrder((current) => (dragId ? reorderByIds(current, dragId, targetId) : current));
        setFeedback(null);
    };

    const onDragOver = (e: React.DragEvent) => {
        if (e.dataTransfer.types.includes(DND_TYPE)) e.preventDefault();
    };

    const onDragEnd = () => {
        setDragId(null);
        setOverId(null);
    };

    const check = () => {
        const total = scenario.steps.length;
        const correctCount = countCorrectPositions(order);

        // Bandas: 5/5 y 4/5 éxito pleno, 3/5 aprueba perdonando un desliz que invierte
        // dos pasos adyacentes (2 posiciones mal ubicadas) sin romper el flujo esencial,
        // 2/5 o menos no aprueba.
        let tier: FeedbackTier;
        let msg: string;

        if (correctCount === total) {
            tier = "success";
            msg = "Excelente. La secuencia permite crear el contenido de forma eficiente y responsable.";
        } else if (correctCount === total - 1) {
            tier = "success";
            msg = "Buen trabajo. El flujo es correcto en general; hay un paso que podría ubicarse mejor, pero la lógica de planificación, producción, revisión y publicación está bien aplicada.";
        } else if (correctCount === total - 2) {
            tier = "success";
            msg = "Aprobado. Hay un desliz que invirtió dos pasos, pero no rompe el flujo esencial de planificación, producción, revisión y publicación.";
        } else if (correctCount >= 1) {
            tier = "partial";
            msg = "El orden aún no refleja el flujo de creación de contenido. Piensa en la secuencia general: primero se planifica, luego se produce, después se revisa y por último se exporta y publica.";
        } else {
            tier = "low";
            msg = "El orden actual no refleja el flujo de creación de contenido. Piensa en la secuencia general: primero se planifica, luego se produce, después se revisa y por último se exporta y publica.";
        }

        const approved = correctCount >= total - 2; // 3/5, 4/5 o 5/5 aprueban

        setFeedback({ tier, msg, correctCount, total });
        onEvaluate?.(approved ? 1 : 0);
        return approved;
    };

    useImperativeHandle(ref, () => ({ check }));

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-4 shadow">
                <h3 className="font-semibold text-slate-800">{scenario.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{scenario.description}</p>
            </div>

            <ol className="space-y-3">
                {order.map((step, idx) => {
                    const isDragging = dragId === step.id;
                    const isTarget = overId === step.id && dragId !== step.id;

                    return (
                        <li
                            key={step.id}
                            className={`group flex cursor-grab items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition-all duration-200 ease-out active:cursor-grabbing ${
                                isDragging
                                    ? "rotate-1 scale-[1.015] border-[#286575] bg-[#e4f3f5] opacity-80 shadow-xl"
                                    : isTarget
                                    ? "-rotate-1 border-[#9fc5cd] bg-[#f3fbfb] shadow-md"
                                    : "hover:-rotate-[0.35deg] hover:shadow-lg"
                            }`}
                            draggable
                            onDragStart={(e) => onDragStart(step.id, e)}
                            onDragEnter={() => onDragEnter(step.id)}
                            onDragOver={onDragOver}
                            onDragEnd={onDragEnd}
                        >
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#286575] font-semibold text-white">
                                {idx + 1}
                            </span>

                            <div className="flex-1 text-sm font-medium leading-relaxed text-slate-800">
                                {step.text}
                            </div>

                            <span className="rounded-full border border-[#c6dde2] px-3 py-1 text-xs font-semibold text-[#286575]">
                                Arrastra
                            </span>
                        </li>
                    );
                })}
            </ol>

            {feedback && (
                <div
                    role="status"
                    aria-live="assertive"
                    className={`rounded-xl border px-4 py-3 text-sm shadow ${
                        feedback.tier === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : feedback.tier === "partial"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                >
                    <p className="font-semibold">
                        Posiciones correctas: {feedback.correctCount}/{feedback.total}
                    </p>
                    <p className="mt-1">{feedback.msg}</p>
                </div>
            )}
        </div>
    );
});

function pickScenarios(count: number, seed?: number): Scenario[] {
    const n = Math.max(1, Math.min(count, BANK.length));
    return shuffle([...BANK], seed).slice(0, n);
}

const DevelopExerciseI2 = forwardRef<DevelopExerciseI2Handle, Props>(
    function DevelopExerciseI2({ onEvaluate, countScenarios = 1, seed }, ref) {
        const scenarios = useMemo(
            () => pickScenarios(countScenarios, seed),
            [countScenarios, seed]
        );
        const scenarioRefs = useRef<Record<string, { check: () => boolean }>>({});

        useImperativeHandle(ref, () => ({
            check: () => {
                let allOk = true;
                scenarios.forEach((scenario) => {
                    const refCore = scenarioRefs.current[scenario.id];
                    if (!refCore) return;

                    const ok = refCore.check();
                    if (!ok) allOk = false;
                });
                onEvaluate?.(allOk ? 1 : 0);
                return allOk;
            },
            isReady: () => true,
            reset: () => {
                onEvaluate?.(0);
            },
        }));

        return (
            <div className="space-y-8">
                {scenarios.map((scenario) => (
                    <DevelopExerciseI2Core
                        key={scenario.id}
                        scenario={scenario}
                        ref={(el) => {
                            if (el) scenarioRefs.current[scenario.id] = el;
                        }}
                    />
                ))}
            </div>
        );
    }
);

DevelopExerciseI2.displayName = "DevelopExerciseI2";

export default DevelopExerciseI2;