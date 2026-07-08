"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type DevelopExerciseA2Handle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
};

type ToolId = "tool-a" | "tool-b";
type AnswerId = ToolId;
type Dimension = "capacidad" | "etica" | "limitacion";

type Tool = {
    id: ToolId;
    name: string;
    description: string;
    functions: string[];
};

type Decision = {
    id: string;
    dimension: Dimension;
    title: string;
    prompt: string;
    expected: AnswerId;
};

type Scenario = {
    id: string;
    title: string;
    context: string;
    tools: [Tool, Tool];
    decisions: [Decision, Decision, Decision];
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
    seed?: number;
};

const ANSWER_LABELS: Record<AnswerId, string> = {
    "tool-a": "Herramienta A",
    "tool-b": "Herramienta B",
};

const ANSWER_ORDER: AnswerId[] = ["tool-a", "tool-b"];

// 3 escenarios curados (calidad sobre cantidad). Cada uno mide explícitamente las 3
// dimensiones de CS3.1.12 mediante decisiones situacionales (no preguntas fijas de
// opción múltiple): Capacidad (elegir la herramienta adecuada a la tarea), Ética
// (priorizar verificación/aprobación responsable aunque sea más lento) y Limitación
// (reconocer un problema que emergió y resolverlo con la herramienta correcta).
const SCENARIOS: Scenario[] = [
    {
        id: "fake-news-carousel",
        title: "Carrusel sobre una noticia viral",
        context:
            "El centro de estudiantes quiere publicar hoy un carrusel sobre una noticia de salud que se volvió viral. El contenido debe advertir sin amplificar información dudosa y orientar a revisar antes de compartir.",
        tools: [
            {
                id: "tool-a",
                name: "🔧 Herramienta A",
                description:
                    "Espacio de revisión documental. Sirve para reunir antecedentes, comparar versiones y preparar notas de respaldo antes de escribir el mensaje.",
                functions: [
                    "Registrar enlaces, fechas y autores consultados",
                    "Guardar observaciones sobre dudas o inconsistencias",
                    "Redactar una advertencia breve basada en lo revisado",
                ],
            },
            {
                id: "tool-b",
                name: "🔧 Herramienta B",
                description:
                    "Editor de publicaciones. Sirve para convertir un mensaje en piezas para redes y probar cómo se leerá en formato carrusel.",
                functions: [
                    "Distribuir información en láminas breves",
                    "Aplicar jerarquía visual, íconos y llamados de atención",
                    "Exportar versiones para historia, feed o afiche digital",
                ],
            },
        ],
        decisions: [
            {
                id: "before-writing",
                dimension: "capacidad",
                title: "Antes de escribir",
                prompt: "Necesitas decidir si la noticia puede usarse como ejemplo o si solo conviene presentarla como información no verificada. ¿Qué usarías?",
                expected: "tool-a",
            },
            {
                id: "publish-now-or-verify",
                dimension: "etica",
                title: "Decisión antes de publicar",
                prompt:
                    "Podrías publicar el carrusel hoy mismo dejando una advertencia genérica, en vez de esperar a terminar de revisar la fuente original. ¿Qué usarías para decidir cómo proceder?",
                expected: "tool-a",
            },
            {
                id: "post-publication-check",
                dimension: "limitacion",
                title: "Un dato quedó desactualizado",
                prompt:
                    "El carrusel ya está armado visualmente, pero alguien del equipo comenta que la fuente original fue actualizada y ahora contradice uno de los datos usados. ¿Qué usarías para resolver esto antes de publicar?",
                expected: "tool-a",
            },
        ],
    },
    {
        id: "cybersecurity-guide",
        title: "Guía de ciberseguridad básica",
        context:
            "Debes crear una guía para estudiantes que usarán por primera vez varias plataformas institucionales. La guía debe explicar riesgos comunes y dejar pasos aplicables.",
        tools: [
            {
                id: "tool-a",
                name: "🔧 Herramienta A",
                description:
                    "Asistente de borrador. Ayuda a generar explicaciones iniciales, ejemplos y alternativas de redacción para distintos niveles de conocimiento.",
                functions: [
                    "Proponer ejemplos de situaciones frecuentes",
                    "Reformular instrucciones en lenguaje más simple",
                    "Sugerir preguntas para detectar dudas del usuario",
                ],
            },
            {
                id: "tool-b",
                name: "🔧 Herramienta B",
                description:
                    "Constructor de guía. Permite ordenar instrucciones, agregar capturas y revisar el recorrido paso a paso antes de publicarlo.",
                functions: [
                    "Dividir el proceso en secciones y checklist",
                    "Anotar capturas o pantallas necesarias",
                    "Probar que cada paso tenga una acción verificable",
                ],
            },
        ],
        decisions: [
            {
                id: "first-draft",
                dimension: "capacidad",
                title: "Punto de partida",
                prompt: "Aún no tienes ejemplos ni una primera redacción para explicar el tema. ¿Qué usarías primero?",
                expected: "tool-a",
            },
            {
                id: "publish-untested-or-verify",
                dimension: "etica",
                title: "Decisión antes de publicar",
                prompt:
                    "Podrías publicar la guía ahora indicando que los pasos 'siempre funcionan', aunque todavía no se han probado con un estudiante real. ¿Qué usarías para decidir si es correcto publicarla así?",
                expected: "tool-b",
            },
            {
                id: "post-publication-check",
                dimension: "limitacion",
                title: "Una explicación no se entendió",
                prompt:
                    "La guía ya tiene todos los pasos ordenados y con capturas, pero un estudiante de prueba no entendió una de las explicaciones iniciales y pide un ejemplo más simple. ¿Qué usarías para resolver esto?",
                expected: "tool-a",
            },
        ],
    },
    {
        id: "school-campaign",
        title: "Campaña de convivencia digital",
        context:
            "Debes preparar una campaña escolar con afiche, publicación y guía breve. El equipo docente quiere revisar los mensajes antes de que las piezas salgan publicadas.",
        tools: [
            {
                id: "tool-a",
                name: "🔧 Herramienta A",
                description:
                    "Espacio colaborativo. Sirve para revisar mensajes, dejar comentarios y conservar acuerdos del equipo durante la producción.",
                functions: [
                    "Registrar versiones y observaciones",
                    "Asignar comentarios a integrantes del equipo",
                    "Aprobar textos antes de pasarlos a diseño",
                ],
            },
            {
                id: "tool-b",
                name: "🔧 Herramienta B",
                description:
                    "Sistema de diseño. Sirve para crear piezas consistentes y adaptar una misma línea gráfica a distintos formatos.",
                functions: [
                    "Duplicar estilos entre afiche, historia y publicación",
                    "Mantener tipografías, colores y espaciados comunes",
                    "Exportar piezas en tamaños diferentes",
                ],
            },
        ],
        decisions: [
            {
                id: "team-agreement",
                dimension: "capacidad",
                title: "Acuerdo del equipo",
                prompt: "Antes de diseñar, el equipo debe acordar mensajes y corregir frases sensibles. ¿Qué usarías?",
                expected: "tool-a",
            },
            {
                id: "publish-without-approval-or-wait",
                dimension: "etica",
                title: "Decisión antes de publicar",
                prompt:
                    "Los textos ya están escritos y podrías pasar directo a diseño para ganar tiempo, aunque el equipo docente todavía no los ha aprobado. ¿Qué usarías para decidir cómo proceder?",
                expected: "tool-a",
            },
            {
                id: "post-publication-check",
                dimension: "limitacion",
                title: "Un formato no se ve bien",
                prompt:
                    "Las piezas ya tienen el mismo estilo visual, pero una de las versiones exportadas no se ve bien en pantallas de celular, aunque en el computador se ve perfecta. ¿Qué usarías para corregir esto antes de publicar?",
                expected: "tool-b",
            },
        ],
    },
];

function shuffle<T>(items: ReadonlyArray<T>, seed = Math.random()) {
    // Generador mulberry32: el LCG anterior (a*s+c)%m estaba sesgado para arreglos
    // pequeños (ej. 3 elementos), haciendo que ciertas opciones casi nunca salieran.
    let a = Math.floor(seed * 1e9) | 0;
    const rand = () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const out = [...items];

    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }

    return out;
}

function pickScenario(seed?: number) {
    return shuffle(SCENARIOS, seed)[0];
}

const DevelopExerciseA2 = forwardRef<DevelopExerciseA2Handle, Props>(
    function DevelopExerciseA2({ onEvaluate, onReadyChange, seed }, ref) {
        const scenario = useMemo(() => pickScenario(seed), [seed]);
        const decisions = useMemo(
            () => shuffle(scenario.decisions, seed === undefined ? undefined : seed + 0.47),
            [scenario, seed]
        );
        const [answers, setAnswers] = useState<Partial<Record<string, AnswerId>>>({});
        const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
        const [current, setCurrent] = useState(0);
        const [feedback, setFeedback] = useState<{
            kind: "idle" | "success" | "warning" | "error";
            score?: number;
            message?: string;
        }>({ kind: "idle" });

        const isReady = scenario.decisions.every((decision) => !!answers[decision.id]);

        useEffect(() => {
            onReadyChange?.(isReady);
        }, [isReady, onReadyChange]);

        useEffect(() => {
            setCurrent(0);
        }, [scenario]);

        function toggleTool(toolId: string) {
            setExpandedTools((prev) => ({ ...prev, [toolId]: !prev[toolId] }));
        }

        function select(decisionId: string, answerId: AnswerId) {
            setAnswers((prev) => ({ ...prev, [decisionId]: answerId }));
            setFeedback({ kind: "idle" });

            if (current < decisions.length - 1) {
                setTimeout(() => {
                    setCurrent((c) => Math.min(decisions.length - 1, c + 1));
                }, 350);
            }
        }

        function totalCorrect() {
            return scenario.decisions.filter(
                (decision) => answers[decision.id] === decision.expected
            ).length;
        }

        function evaluate() {
            const correct = totalCorrect();
            const ok = correct === scenario.decisions.length;

            if (ok) {
                setFeedback({
                    kind: "success",
                    score: correct,
                    message:
                        "Excelente. Evalúas correctamente capacidades, uso ético y limitaciones al elegir entre herramientas.",
                });
                onEvaluate?.(1);
            } else if (correct === 2) {
                setFeedback({
                    kind: "warning",
                    score: correct,
                    message:
                        "Vas bien, con un error puntual. Revisa si la decisión pide elegir por capacidad de la tarea, por responsabilidad ética, o por una limitación que apareció.",
                });
                onEvaluate?.(0);
            } else {
                setFeedback({
                    kind: "error",
                    score: correct,
                    message:
                        "Revisa las 3 decisiones: cuál herramienta sirve para la tarea, cuál opción es la responsable aunque tome más tiempo, y cuál resuelve el problema que apareció después.",
                });
                onEvaluate?.(0);
            }

            return ok;
        }

        useImperativeHandle(ref, () => ({
            check: evaluate,
            isReady: () => isReady,
            reset: () => {
                setAnswers({});
                setFeedback({ kind: "idle" });
                onEvaluate?.(0);
                onReadyChange?.(false);
            },
        }));

        return (
            <section className="space-y-5">
                <div className="rounded-2xl border bg-white p-4 shadow">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                        Decisión de uso de herramientas
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-800">
                        {scenario.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {scenario.context}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {scenario.tools.map((tool) => {
                        const isExpanded = !!expandedTools[tool.id];

                        return (
                            <article key={tool.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                                <h4 className="font-semibold text-slate-800">{tool.name}</h4>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    {tool.description}
                                </p>
                                <div
                                    className="grid transition-all duration-300 ease-in-out"
                                    style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
                                >
                                    <div className="overflow-hidden">
                                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
                                            {tool.functions.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleTool(tool.id)}
                                    aria-expanded={isExpanded}
                                    className="mt-2 flex items-center gap-1 text-xs font-medium text-[#286575] hover:text-[#1d4f5c]"
                                >
                                    {isExpanded ? "Ocultar funciones" : "Ver funciones"}
                                    <span
                                        className="text-slate-400 transition-transform"
                                        style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                    >
                                        ▾
                                    </span>
                                </button>
                            </article>
                        );
                    })}
                </div>

                {/* Decisión activa */}
                {decisions.map((decision, index) => {
                    if (index !== current) return null;

                    return (
                        <div
                            key={decision.id}
                            className="animate-fade-in-up rounded-2xl border bg-white p-4 shadow-sm"
                            style={{ animationDuration: "0.3s" }}
                        >
                            {/* Puntos de navegación */}
                            <div className="mb-3 flex items-center justify-center gap-2">
                                {decisions.map((d, i) => {
                                    const isAnswered = !!answers[d.id];
                                    const isActive = i === current;

                                    return (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => setCurrent(i)}
                                            aria-label={`Ir a la decisión ${i + 1}`}
                                            className={`h-2.5 rounded-full transition-all duration-200 ${
                                                isActive
                                                    ? "w-7 bg-[#286575]"
                                                    : isAnswered
                                                    ? "w-2.5 bg-emerald-300 hover:bg-emerald-400"
                                                    : "w-2.5 bg-slate-200 hover:bg-slate-300"
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                            <h4 className="font-semibold text-slate-800">{decision.title}</h4>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                {decision.prompt}
                            </p>

                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {ANSWER_ORDER.map((answerId) => {
                                    const isPicked = answers[decision.id] === answerId;

                                    return (
                                        <button
                                            key={answerId}
                                            type="button"
                                            onClick={() => select(decision.id, answerId)}
                                            className={`rounded-2xl border px-4 py-3 text-center text-sm font-medium leading-relaxed transition ${
                                                isPicked
                                                    ? "border-[#286575] bg-[#e4f3f5] text-[#244f59] ring-2 ring-[#286575]/20"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-[#286575]/40 hover:shadow-sm"
                                            }`}
                                        >
                                            {ANSWER_LABELS[answerId]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navegación prev/next */}
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                                    disabled={current === 0}
                                    className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                                        current === 0
                                            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                            : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                                    }`}
                                >
                                    ← Anterior
                                </button>

                                <span className="text-xs text-slate-400">
                                    {Object.keys(answers).length}/{decisions.length} respondidas
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setCurrent((c) => Math.min(decisions.length - 1, c + 1))}
                                    disabled={current === decisions.length - 1}
                                    className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                                        current === decisions.length - 1
                                            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                            : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                                    }`}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </div>
                    );
                })}

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
            </section>
        );
    }
);

DevelopExerciseA2.displayName = "DevelopExerciseA2";

export default DevelopExerciseA2;