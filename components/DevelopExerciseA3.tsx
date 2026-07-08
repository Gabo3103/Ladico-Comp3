"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type DevelopExerciseA3Handle = {
    check: (opts?: { silent?: boolean }) => boolean;
    isReady: () => boolean;
    reset: () => void;
};

type StructureId = "structure-a" | "structure-b" | "structure-c";
type WeaknessId = "too-dense" | "not-audience-fit" | "no-clear-action" | "off-goal";

type Choice<T extends string> = {
    id: T;
    label: string;
};

type DraftStructure = {
    id: StructureId;
    tone: string;
    imageUse: string;
    outline: string[];
    weaknesses?: [WeaknessId, WeaknessId]; // solo aplica a estructuras no-correctas
};

type Scenario = {
    id: string;
    title: string;
    audience: string;
    goal: string;
    format: string;
    context: string;
    structures: [DraftStructure, DraftStructure, DraftStructure];
    expected: StructureId;
    rationale: string;
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
    seed?: number;
};

// Contraparte positiva de cada debilidad, para cuando se elige la estructura correcta
// y hay que justificar sus fortalezas frente a lo que las otras 2 no logran.
const STRENGTH_OPTIONS: Choice<WeaknessId>[] = [
    { id: "too-dense", label: "Entrega solo la información necesaria para la tarea, sin sobrecargar" },
    { id: "not-audience-fit", label: "Usa un lenguaje y nivel de detalle adecuado para la audiencia" },
    { id: "no-clear-action", label: "Deja clara una acción o guía práctica que se puede seguir de inmediato" },
    { id: "off-goal", label: "Se enfoca directamente en lo que pide el objetivo comunicativo" },
];

const WEAKNESS_OPTIONS: Choice<WeaknessId>[] = [
    { id: "too-dense", label: "Incluye más contenido o contexto del que la audiencia necesita para esta tarea" },
    { id: "not-audience-fit", label: "Usa un tono o nivel de detalle que no calza con quién va a leerlo" },
    { id: "no-clear-action", label: "No deja una acción o guía clara que se pueda seguir de inmediato" },
    { id: "off-goal", label: "Se desvía del objetivo comunicativo principal del encargo" },
];

const SCENARIOS: Scenario[] = [
    {
        id: "phishing-students",
        title: "Guía sobre correos sospechosos",
        audience: "Estudiantes de primer año con poca experiencia identificando fraudes",
        goal: "Ayudarles a reconocer señales de riesgo antes de abrir enlaces o responder mensajes",
        format: "Ficha visual breve para compartir en aula virtual",
        context:
            "El recurso será revisado rápidamente antes de una actividad práctica. Debe ser claro, accionable y fácil de recordar.",
        expected: "structure-b",
        rationale:
            "La estructura B usa lenguaje escolar directo, imagen funcional y una secuencia de señales y acciones que se adapta mejor a estudiantes principiantes.",
        structures: [
            {
                id: "structure-a",
                tone: "Formal técnico",
                imageUse: "Captura decorativa de una bandeja de entrada sin marcas explicativas",
                outline: [
                    "Definición de phishing e ingeniería social",
                    "Tipos de ataque: correo, SMS y formularios falsos",
                    "Recomendación general: revisar antes de responder",
                ],
                weaknesses: ["not-audience-fit", "too-dense"],
            },
            {
                id: "structure-b",
                tone: "Escolar directo",
                imageUse: "Captura simulada con flechas sobre remitente, enlace y urgencia del mensaje",
                outline: [
                    "Situación inicial: recibes un correo que pide entrar a un enlace",
                    "Tres señales: remitente extraño, urgencia y enlace no coincidente",
                    "Acción final: no hacer clic, verificar por canal oficial y reportar",
                ],
            },
            {
                id: "structure-c",
                tone: "Informal de redes",
                imageUse: "Meme sobre correos falsos como imagen principal",
                outline: [
                    "Frase llamativa para captar atención",
                    "Lista breve de consejos mezclados con humor",
                    "Cierre: 'no caigas' y comparte con tus compañeros",
                ],
                weaknesses: ["no-clear-action", "off-goal"],
            },
        ],
    },
    {
        id: "work-report",
        title: "Resumen para equipo de trabajo",
        audience: "Equipo laboral que debe tomar una decisión rápida en una reunión",
        goal: "Comunicar avances, problema principal y próximos pasos",
        format: "Diapositiva única para reunión interna",
        context:
            "La audiencia ya conoce el proyecto. Necesita distinguir prioridades, no leer antecedentes extensos.",
        expected: "structure-c",
        rationale:
            "La estructura C usa lenguaje de trabajo, datos priorizados e imagen analítica, por lo que facilita decisión rápida en reunión.",
        structures: [
            {
                id: "structure-a",
                tone: "Narrativo detallado",
                imageUse: "Fotografía general del equipo trabajando",
                outline: [
                    "Contexto completo del proyecto",
                    "Actividades realizadas durante el mes",
                    "Comentario final sobre desafíos pendientes",
                ],
                weaknesses: ["too-dense", "no-clear-action"],
            },
            {
                id: "structure-b",
                tone: "Motivacional informal",
                imageUse: "Ilustración positiva con frases de logro",
                outline: [
                    "Mensaje de ánimo al equipo",
                    "Lista de tareas completadas",
                    "Cierre con frase inspiradora",
                ],
                weaknesses: ["off-goal", "not-audience-fit"],
            },
            {
                id: "structure-c",
                tone: "Profesional ejecutivo",
                imageUse: "Mini gráfico con avance, riesgo y decisión requerida",
                outline: [
                    "Estado actual en una frase",
                    "Problema que bloquea el avance",
                    "Decisión requerida y próximos dos pasos",
                ],
            },
        ],
    },
    {
        id: "recycling-school",
        title: "Guía digital sobre reciclaje",
        audience: "Comunidad escolar que debe separar residuos en espacios comunes",
        goal: "Reducir errores al elegir contenedor",
        format: "Afiche digital para pasillos y grupos de curso",
        context:
            "El recurso se verá de pie, con poco tiempo, cerca de los contenedores. Debe funcionar incluso sin explicación oral.",
        expected: "structure-b",
        rationale:
            "La estructura B conecta residuo, contenedor e imagen en una lectura rápida, adecuada para espacios comunes.",
        structures: [
            {
                id: "structure-a",
                tone: "Informativo general",
                imageUse: "Fotografía grande de naturaleza como fondo",
                outline: [
                    "Importancia ambiental del reciclaje",
                    "Beneficios de reducir residuos",
                    "Invitación a colaborar con el colegio",
                ],
                weaknesses: ["no-clear-action", "off-goal"],
            },
            {
                id: "structure-b",
                tone: "Instructivo directo",
                imageUse: "Íconos de residuos reales junto al color de cada contenedor",
                outline: [
                    "Pregunta: ¿dónde va este residuo?",
                    "Tabla visual: residuo frecuente, contenedor y excepción",
                    "Recordatorio: si está sucio o mezclado, revisar antes de depositar",
                ],
            },
            {
                id: "structure-c",
                tone: "Escolar motivacional",
                imageUse: "Mascota del colegio reciclando",
                outline: [
                    "Frase de campaña ecológica",
                    "Lista amplia de materiales reciclables",
                    "Cierre con llamado a cuidar el planeta",
                ],
                weaknesses: ["too-dense", "not-audience-fit"],
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

type Step2Setup = {
    heading: string;
    options: Choice<WeaknessId>[];
    correctIds: WeaknessId[];
};

// El paso 2 depende del recorrido elegido, igual que en A1: si se escoge la
// estructura correcta, se pide justificar sus 2 fortalezas (frente a las 2
// debilidades reales de las otras estructuras). Si se escoge una incorrecta, se
// pide identificar SU debilidad específica entre distractores curados.
function buildStep2(scenario: Scenario, structureId: StructureId): Step2Setup {
    const chosen = scenario.structures.find((s) => s.id === structureId)!;
    const others = scenario.structures.filter((s) => s.id !== structureId);

    if (structureId === scenario.expected) {
        // La debilidad "primaria" (posición 0) de cada estructura incorrecta define
        // las 2 fortalezas de la estructura correcta.
        const correctIds = others.map((s) => s.weaknesses![0]);
        const correctOptions = STRENGTH_OPTIONS.filter((o) => correctIds.includes(o.id));
        const distractorOptions = STRENGTH_OPTIONS.filter((o) => !correctIds.includes(o.id));

        return {
            heading: "2. Marca las dos razones que explican mejor por qué esta estructura es la más adecuada",
            options: [...correctOptions, ...distractorOptions],
            correctIds,
        };
    }

    // La estructura incorrecta tiene sus 2 debilidades propias (no las de las otras),
    // con distractores curados a partir de las debilidades que NO tiene.
    const correctIds = chosen.weaknesses!;
    const correctOptions = WEAKNESS_OPTIONS.filter((o) => correctIds.includes(o.id));
    const distractorOptions = WEAKNESS_OPTIONS.filter((o) => !correctIds.includes(o.id));

    return {
        heading: "2. Marca las dos razones que explican mejor las limitaciones de esta estructura",
        options: [...correctOptions, ...distractorOptions],
        correctIds,
    };
}

const STRUCTURE_LETTERS = ["Estructura A", "Estructura B", "Estructura C"];

const DevelopExerciseA3 = forwardRef<DevelopExerciseA3Handle, Props>(
    function DevelopExerciseA3({ onEvaluate, onReadyChange, seed }, ref) {
        const scenario = useMemo(() => pickScenario(seed), [seed]);
        const structures = useMemo(
            () =>
                shuffle(scenario.structures, seed === undefined ? undefined : seed + 0.21).map(
                    (item, index) => ({ ...item, displayTitle: STRUCTURE_LETTERS[index] })
                ),
            [scenario, seed]
        );
        const [selected, setSelected] = useState<StructureId | null>(null);
        const [picked, setPicked] = useState<Record<string, boolean>>({});
        const [feedback, setFeedback] = useState<{
            kind: "idle" | "success" | "warning" | "error";
            score?: number;
            message?: string;
        }>({ kind: "idle" });

        const step2 = useMemo(
            () => (selected ? buildStep2(scenario, selected) : null),
            [scenario, selected]
        );

        const step2Options = useMemo(
            () => (step2 ? shuffle(step2.options, seed === undefined ? undefined : seed + 0.63) : []),
            [step2, seed]
        );

        const pickedIds = useMemo(
            () =>
                Object.entries(picked)
                    .filter(([, value]) => value)
                    .map(([id]) => id as WeaknessId),
            [picked]
        );

        const isReady = !!selected && !!step2 && pickedIds.length === step2.correctIds.length;

        useEffect(() => {
            onReadyChange?.(isReady);
        }, [isReady, onReadyChange]);

        function choose(id: StructureId) {
            setSelected(id);
            setPicked({}); // el set de alternativas cambia según la estructura: se limpia la selección previa
            setFeedback({ kind: "idle" });
        }

        function toggle(id: WeaknessId) {
            if (!step2) return;

            setPicked((prev) => {
                const isPicked = !!prev[id];
                const selectedCount = Object.values(prev).filter(Boolean).length;

                if (!isPicked && selectedCount >= step2.correctIds.length) {
                    return prev;
                }

                return { ...prev, [id]: !isPicked };
            });
            setFeedback({ kind: "idle" });
        }

        // Puntaje (máx 4): Estructura correcta (2 puntos, combinado) +
        // 1 punto por cada justificación correcta (2 si es la ruta correcta con sus
        // 2 fortalezas, 1 si es la ruta incorrecta con su única debilidad) — se anula
        // si se marca algún distractor. Aprueba con 3 o más.
        function score() {
            if (!step2) return 0;

            const structureOk = selected === scenario.expected;
            const structureScore = structureOk ? 2 : 0;

            // Cada justificación correcta suma su punto de forma independiente: si
            // acierta una y falla la otra, no se le descuenta la que sí logró. El tope
            // de selección (máx 2, igual que step2.correctIds.length) ya evita marcar
            // todas las alternativas para "asegurar" puntos.
            const justificationScore = step2.correctIds.filter((id) => pickedIds.includes(id)).length;

            return structureScore + justificationScore;
        }

        function evaluate(opts?: { silent?: boolean }) {
            const result = score();
            const ok = result >= 3;

            if (opts?.silent) {
                onEvaluate?.(ok ? 1 : 0);
                return ok;
            }

            if (result === 4) {
                setFeedback({
                    kind: "success",
                    score: result,
                    message: scenario.rationale,
                });
                onEvaluate?.(1);
            } else if (ok) {
                setFeedback({
                    kind: "success",
                    score: result,
                    message:
                        "Aprobado. Revisa igual si alguna razón marcada corresponde del todo a lo que esta estructura logra.",
                });
                onEvaluate?.(1);
            } else if (result >= 1) {
                setFeedback({
                    kind: "warning",
                    score: result,
                    message:
                        selected === scenario.expected
                            ? "La estructura elegida es la más adecuada, pero revisa si la razón que marcaste corresponde realmente a lo que esta estructura logra."
                            : "Revisa si la estructura elegida realmente se adapta al objetivo y a la audiencia del caso.",
                });
                onEvaluate?.(0);
            } else {
                setFeedback({
                    kind: "error",
                    score: result,
                    message:
                        "Revisa si la estructura calza con la audiencia, el propósito, el tono y el uso de imagen solicitado.",
                });
                onEvaluate?.(0);
            }

            return ok;
        }

        useImperativeHandle(ref, () => ({
            check: evaluate,
            isReady: () => isReady,
            reset: () => {
                setSelected(null);
                setPicked({});
                setFeedback({ kind: "idle" });
                onEvaluate?.(0);
                onReadyChange?.(false);
            },
        }));

        return (
            <section className="space-y-5">
                <div className="rounded-2xl border bg-white p-4 shadow">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                        Selección de estructura
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-800">
                        {scenario.title}
                    </h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl bg-[#f3fbfb] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                                Audiencia
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">
                                {scenario.audience}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-[#f3fbfb] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                                Objetivo
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">
                                {scenario.goal}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-[#f3fbfb] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                                Formato
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">
                                {scenario.format}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <h4 className="font-semibold text-slate-800">1. Elige el mejor borrador</h4>
                    <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {structures.map((structure) => {
                            const isPicked = selected === structure.id;

                            return (
                                <button
                                    key={structure.id}
                                    type="button"
                                    onClick={() => choose(structure.id)}
                                    className={`flex h-full min-h-[430px] flex-col rounded-2xl border p-4 text-left shadow-sm transition ${
                                        isPicked
                                            ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                            : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-md"
                                    }`}
                                >
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <h4 className="font-semibold text-slate-800">
                                            {structure.displayTitle}
                                        </h4>
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#286575] shadow-sm">
                                            Borrador
                                        </span>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Lenguaje
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {structure.tone}
                                        </p>
                                    </div>

                                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Imagen
                                        </p>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-700">
                                            {structure.imageUse}
                                        </p>
                                    </div>

                                    <div className="mt-3 flex-1 rounded-2xl border border-slate-200 bg-[#fffdf8] p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Estructura propuesta
                                        </p>
                                        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                                            {structure.outline.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: selected && step2 ? "1fr" : "0fr" }}
                    >
                        <div className="overflow-hidden">
                            {step2 && (
                                <div className="mt-5 border-t-2 border-slate-200 pt-5">
                                    <h4 className="font-semibold text-slate-800">{step2.heading}</h4>
                                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {step2Options.map((item) => {
                                            const isPicked = !!picked[item.id];

                                            return (
                                                <label
                                                    key={item.id}
                                                    className={`flex cursor-pointer select-none items-start gap-3 rounded-2xl border p-3 text-sm transition ${
                                                        isPicked
                                                            ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                                            : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-sm"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isPicked}
                                                        onChange={() => toggle(item.id)}
                                                        className="mt-1 h-5 w-5 shrink-0 rounded accent-[#286575]"
                                                    />
                                                    <span className="font-medium leading-relaxed text-slate-800">
                                                        {item.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {feedback.kind !== "idle" && (
                    <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                            feedback.kind === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : feedback.kind === "warning"
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-rose-200 bg-rose-50 text-rose-800"
                        }`}
                    >
                        <b>{feedback.score}/4 puntos.</b> {feedback.message}
                    </div>
                )}
            </section>
        );
    }
);

DevelopExerciseA3.displayName = "DevelopExerciseA3";

export default DevelopExerciseA3;