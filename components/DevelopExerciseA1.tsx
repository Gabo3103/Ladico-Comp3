"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type DevelopExerciseA1Handle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
};

type ProposalId = "balanced" | "dense" | "long-video";
type WeaknessId =
    | "too-dense"
    | "weak-visual-support"
    | "not-audience-fit"
    | "missing-action"
    | "too-long"
    | "too-technical"
    | "weak-verification";

// Elementos/formatos que puede combinar una propuesta (dimensión "Combinación de
// recursos" del Excel: identificar integración de texto, imagen, video y síntesis).
type ElementId = "text" | "image" | "video" | "question" | "closing";

// Cada propuesta no-correcta trae su propia limitación específica (ligada a su
// contenido real) y sus propios distractores curados a mano (ids que son claramente
// falsos para esa descripción, no un sorteo genérico que podría solapar con algo
// también verdadero), evitando ambigüedad entre "correcto" y "distractor".
type Proposal = {
    id: ProposalId;
    description: string;
    elements: ElementId[]; // formatos que realmente combina esta propuesta
    weaknesses?: [WeaknessId, WeaknessId]; // solo aplica a propuestas no-correctas
    distractors?: WeaknessId[]; // 2 ids, solo aplica a propuestas no-correctas
};

type Scenario = {
    id: string;
    title: string;
    context: string;
    criteria: string[];
    proposals: Proposal[];
    expectedProposal: ProposalId;
    strengthDistractors: WeaknessId[]; // 2 ids claramente falsos para la propuesta correcta
};

type Choice<T extends string> = {
    id: T;
    label: string;
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
    seed?: number;
};

const ELEMENT_OPTIONS: Choice<ElementId>[] = [
    { id: "text", label: "Texto explicativo" },
    { id: "image", label: "Imagen o captura" },
    { id: "video", label: "Video" },
    { id: "question", label: "Pregunta o actividad interactiva" },
    { id: "closing", label: "Cierre o síntesis final" },
];

const WEAKNESS_OPTIONS: Choice<WeaknessId>[] = [
    { id: "too-dense", label: "Incluye demasiadas ideas para una primera revisión del tema" },
    { id: "weak-visual-support", label: "No usa apoyos visuales o ejemplos suficientes para transmitir la idea central" },
    { id: "not-audience-fit", label: "No ajusta lenguaje, profundidad o ejemplos a la audiencia indicada" },
    { id: "missing-action", label: "No deja claro qué debe hacer la persona después de revisar el contenido" },
    { id: "too-long", label: "Demanda más tiempo o atención de lo necesario para el objetivo del caso" },
    { id: "too-technical", label: "Usa criterios o vocabulario técnico antes de explicar lo esencial" },
    { id: "weak-verification", label: "No muestra cómo revisar la confiabilidad de la información antes de compartirla" },
];

// Contraparte positiva de cada WeaknessId, para cuando se elige la propuesta correcta
// y hay que justificar por qué es la más adecuada (en vez de repetir las limitaciones).
const STRENGTH_OPTIONS: Choice<WeaknessId>[] = [
    { id: "too-dense", label: "Resume las ideas necesarias para una primera revisión, sin sobrecargar" },
    { id: "weak-visual-support", label: "Usa apoyos visuales o ejemplos suficientes para transmitir la idea central" },
    { id: "not-audience-fit", label: "Ajusta lenguaje, profundidad y ejemplos a la audiencia indicada" },
    { id: "missing-action", label: "Deja claro qué debe hacer la persona después de revisar el contenido" },
    { id: "too-long", label: "Usa el tiempo justo para lograr el objetivo del caso" },
    { id: "too-technical", label: "Explica lo esencial antes de usar vocabulario o criterios técnicos" },
    { id: "weak-verification", label: "Muestra cómo revisar la confiabilidad de la información antes de compartirla" },
];

const SCENARIOS: Scenario[] = [
    {
        id: "social-networks",
        title: "Uso responsable de redes sociales",
        context:
            "Debes crear un recurso para estudiantes de primer año que recién comienzan a usar redes académicas y personales con mayor autonomía.",
        criteria: [
            "Debe priorizar ejemplos cercanos y acciones concretas.",
            "Debe explicar pocas ideas por pieza para facilitar la retención.",
            "Debe transmitir el mensaje con apoyo visual y lenguaje directo.",
        ],
        expectedProposal: "balanced",
        strengthDistractors: ["weak-verification", "too-technical"],
        proposals: [
            {
                id: "dense",
                description:
                    "Documento en PDF con explicaciones completas, ejemplos escritos, enlaces de consulta y desarrollo continuo del tema.",
                elements: ["text"],
                weaknesses: ["too-dense", "weak-visual-support"],
                distractors: ["weak-verification", "too-technical"],
            },
            {
                id: "balanced",
                description:
                    "Presentación breve con ideas resumidas, situaciones cotidianas, apoyos visuales y un resumen final para distinguir conductas adecuadas.",
                elements: ["text", "image", "closing"],
            },
            {
                id: "long-video",
                description:
                    "Video explicativo con varios ejemplos, narración guiada y recomendaciones distribuidas durante toda la explicación.",
                elements: ["video"],
                weaknesses: ["too-long", "missing-action"],
                distractors: ["weak-verification", "too-technical"],
            },
        ],
    },
    {
        id: "fake-news",
        title: "Detección de noticias falsas",
        context:
            "Debes diseñar un recurso para una comunidad escolar que necesita reconocer señales básicas de desinformación en mensajes, imágenes y titulares.",
        criteria: [
            "Debe mostrar señales observables sin depender de teoría compleja.",
            "Debe ayudar a comparar la noticia con fuentes confiables.",
            "Debe indicar cómo comunicar la duda sin afirmar algo no verificado.",
        ],
        expectedProposal: "balanced",
        strengthDistractors: ["not-audience-fit", "missing-action"],
        proposals: [
            {
                id: "dense",
                description:
                    "Artículo con definiciones precisas, referencias y criterios especializados de verificación de información.",
                elements: ["text"],
                weaknesses: ["too-technical", "too-dense"],
                distractors: ["weak-verification", "not-audience-fit"],
            },
            {
                id: "balanced",
                description:
                    "Guía visual con titulares comparados, preguntas de revisión y ejemplos de cómo escribir una advertencia responsable.",
                elements: ["image", "question", "text"],
            },
            {
                id: "long-video",
                description:
                    "Video con varios casos comentados, explicación oral y recomendaciones distribuidas durante el recorrido.",
                elements: ["video"],
                weaknesses: ["weak-visual-support", "missing-action"],
                distractors: ["too-technical", "not-audience-fit"],
            },
        ],
    },
    {
        id: "cyberbullying",
        title: "Prevención del ciberacoso",
        context:
            "Debes preparar un recurso para adolescentes que necesitan reconocer situaciones de riesgo y saber dónde pedir ayuda.",
        criteria: [
            "Debe usar situaciones reconocibles para la audiencia.",
            "Debe mostrar señales de alerta sin normalizar la agresión.",
            "Debe indicar canales o pasos de ayuda con claridad.",
        ],
        expectedProposal: "balanced",
        strengthDistractors: ["weak-verification", "missing-action"],
        proposals: [
            {
                id: "dense",
                description:
                    "Texto formal con normas de convivencia, lenguaje institucional y orientación general para actuar.",
                elements: ["text"],
                weaknesses: ["not-audience-fit", "missing-action"],
                distractors: ["weak-verification", "too-technical"],
            },
            {
                id: "balanced",
                description:
                    "Recurso visual con casos breves, señales de alerta y pasos para pedir apoyo en el entorno escolar.",
                elements: ["image", "text", "closing"],
            },
            {
                id: "long-video",
                description:
                    "Audio explicativo con recomendaciones, ejemplos narrados y orientaciones para reconocer situaciones de riesgo.",
                elements: ["text"],
                weaknesses: ["weak-visual-support", "too-long"],
                distractors: ["weak-verification", "too-technical"],
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
    maxSelect: number;
    options: Choice<WeaknessId>[];
    correctIds: WeaknessId[];
};

// El paso 2 depende del recorrido elegido: si se escoge la propuesta correcta, se
// pide justificar sus 2 fortalezas (frente a las limitaciones reales de las otras
// dos propuestas). Si se escoge una propuesta incorrecta, se pide identificar SU
// limitación específica entre distractores — nunca la misma lista fija para todos.
function buildStep2(scenario: Scenario, proposalId: ProposalId, seed?: number): Step2Setup {
    const chosen = scenario.proposals.find((p) => p.id === proposalId)!;
    const others = scenario.proposals.filter((p) => p.id !== proposalId);

    // Encabezado único: no debe delatar si la propuesta elegida es la correcta o
    // no, ya que las 2 alternativas correctas debajo cambian de sentido (fortalezas
    // o debilidades) según el camino, pero la pregunta en sí se ve igual siempre.
    const heading = "2. Marca las dos razones que mejor describen esta propuesta frente al caso";

    if (proposalId === scenario.expectedProposal) {
        // La debilidad "primaria" (posición 0) de cada propuesta incorrecta define
        // las 2 fortalezas de la propuesta correcta.
        const correctIds = others.map((p) => p.weaknesses![0]);
        const correctOptions = STRENGTH_OPTIONS.filter((o) => correctIds.includes(o.id));
        // Los 2 distractores se mezclan en tono (uno positivo, uno negativo) para
        // que el set completo no se delate por polaridad: si las 4 alternativas
        // fueran siempre positivas, bastaría con "ver el tono" para saber que se
        // eligió la propuesta correcta, sin necesidad de leer el contenido.
        const distractorOptions = scenario.strengthDistractors.map((id, index) =>
            index % 2 === 0
                ? STRENGTH_OPTIONS.find((o) => o.id === id)!
                : WEAKNESS_OPTIONS.find((o) => o.id === id)!
        );

        return {
            heading,
            maxSelect: 2,
            options: shuffle([...correctOptions, ...distractorOptions], seed === undefined ? undefined : seed + 0.73),
            correctIds,
        };
    }

    // La propuesta incorrecta tiene sus 2 debilidades propias (no las de las
    // otras), con distractores curados a partir de las debilidades que NO tiene.
    const correctIds = chosen.weaknesses!;
    const correctOptions = WEAKNESS_OPTIONS.filter((o) => correctIds.includes(o.id));
    // Mismo criterio: 1 distractor negativo + 1 positivo, para que el set no
    // quede "todo negativo" y delate que se eligió una propuesta incorrecta.
    const distractorOptions = (chosen.distractors ?? []).map((id, index) =>
        index % 2 === 0
            ? WEAKNESS_OPTIONS.find((o) => o.id === id)!
            : STRENGTH_OPTIONS.find((o) => o.id === id)!
    );

    return {
        heading,
        maxSelect: 2,
        options: shuffle([...correctOptions, ...distractorOptions], seed === undefined ? undefined : seed + 0.89),
        correctIds,
    };
}

type Step3Setup = {
    heading: string;
    options: Choice<ElementId>[];
    correctIds: ElementId[];
};

// Paso 3: siempre 3 alternativas totales. Los elementos reales de la propuesta
// elegida son las opciones correctas; se completa hasta 3 con elementos que esa
// propuesta NO tiene (distractor objetivamente verificable, no interpretativo).
function buildStep3(proposal: Proposal, seed?: number): Step3Setup {
    const correctIds = proposal.elements;
    const correctOptions = ELEMENT_OPTIONS.filter((o) => correctIds.includes(o.id));
    const otherOptions = ELEMENT_OPTIONS.filter((o) => !correctIds.includes(o.id));
    // Siempre 4 alternativas en total (no solo "rellenar hasta 3"), para que la
    // propuesta correcta también tenga al menos 1 distractor a descartar — antes,
    // si tenía sus 3 elementos reales, las 3 opciones mostradas eran todas
    // correctas (bastaba con "marcar todo"), delatando el camino sin necesidad de
    // razonar, a diferencia de las incorrectas que sí exigían discernir.
    const TARGET_TOTAL = 4;
    const neededDistractors = Math.min(otherOptions.length, TARGET_TOTAL - correctOptions.length);
    const distractorOptions = shuffle(
        otherOptions,
        seed === undefined ? undefined : seed + 0.61
    ).slice(0, neededDistractors);

    return {
        heading: "3. Marca qué elementos combina esta propuesta",
        options: shuffle([...correctOptions, ...distractorOptions], seed === undefined ? undefined : seed + 0.17),
        correctIds,
    };
}

const PROPOSAL_LETTERS = ["Propuesta A", "Propuesta B", "Propuesta C"];

const DevelopExerciseA1 = forwardRef<DevelopExerciseA1Handle, Props>(
    function DevelopExerciseA1({ onEvaluate, onReadyChange, seed }, ref) {
        const scenario = useMemo(() => pickScenario(seed), [seed]);
        const proposals = useMemo(
            () =>
                shuffle(scenario.proposals, seed === undefined ? undefined : seed + 0.13).map(
                    (item, index) => ({ ...item, displayTitle: PROPOSAL_LETTERS[index] })
                ),
            [scenario, seed]
        );
        const [proposal, setProposal] = useState<ProposalId | null>(null);
        const [picked, setPicked] = useState<Record<string, boolean>>({});
        const [pickedElements, setPickedElements] = useState<Record<string, boolean>>({});
        const [feedback, setFeedback] = useState<{
            kind: "idle" | "success" | "warning" | "error";
            score?: number;
            message?: string;
        }>({ kind: "idle" });

        const step2 = useMemo(
            () => (proposal ? buildStep2(scenario, proposal, seed) : null),
            [scenario, proposal, seed]
        );

        const chosenProposal = useMemo(
            () => (proposal ? scenario.proposals.find((p) => p.id === proposal) ?? null : null),
            [scenario, proposal]
        );

        const step3 = useMemo(
            () => (chosenProposal ? buildStep3(chosenProposal, seed) : null),
            [chosenProposal, seed]
        );

        const pickedIds = useMemo(
            () =>
                Object.entries(picked)
                    .filter(([, value]) => value)
                    .map(([id]) => id as WeaknessId),
            [picked]
        );

        const pickedElementIds = useMemo(
            () =>
                Object.entries(pickedElements)
                    .filter(([, value]) => value)
                    .map(([id]) => id as ElementId),
            [pickedElements]
        );

        // El paso 3 solo aparece una vez que el paso 2 está completo (revelado progresivo).
        const step2Done = !!step2 && pickedIds.length === step2.maxSelect;

        const isReady =
            !!proposal &&
            !!step2 &&
            !!step3 &&
            pickedIds.length === step2.maxSelect &&
            pickedElementIds.length > 0;

        useEffect(() => {
            onReadyChange?.(isReady);
        }, [isReady, onReadyChange]);

        function pickProposal(id: ProposalId) {
            setProposal(id);
            setPicked({}); // el set de alternativas cambia según la propuesta: se limpia la selección previa
            setPickedElements({});
            setFeedback({ kind: "idle" });
        }

        function toggleOption(id: WeaknessId) {
            if (!step2) return;

            setPicked((prev) => {
                const isPicked = !!prev[id];
                const selectedCount = Object.values(prev).filter(Boolean).length;

                if (!isPicked && selectedCount >= step2.maxSelect) {
                    return prev;
                }

                return { ...prev, [id]: !isPicked };
            });
            setFeedback({ kind: "idle" });
        }

        function toggleElement(id: ElementId) {
            setPickedElements((prev) => ({ ...prev, [id]: !prev[id] }));
            setFeedback({ kind: "idle" });
        }

        // Puntaje ponderado (máx 4.0):
        // Propuesta: 2 puntos (binario)
        // Justificación: 0.5 por cada ítem correcto marcado (máx 1.0) — se anula si hay extras
        // Elementos combinados: 0.33 por cada uno correcto marcado (máx ~1.0) — se anula si hay extras
        function score() {
            if (!step2 || !step3 || !chosenProposal) return 0;

            const proposalOk = proposal === scenario.expectedProposal;
            const proposalScore = proposalOk ? 2 : 0;

            // No se resta por marcar una alternativa incorrecta: cada acierto suma
            // su punto de forma independiente (el tope de selección ya evita marcar
            // todas las alternativas para "asegurar" puntos).
            const correctPicked = step2.correctIds.filter((id) => pickedIds.includes(id)).length;
            const justificationScore = correctPicked * 0.5;

            const correctElements = chosenProposal.elements;
            const elementsCorrectPicked = correctElements.filter((id) =>
                pickedElementIds.includes(id)
            ).length;
            const elementsScore = elementsCorrectPicked * 0.33;

            return Math.round((proposalScore + justificationScore + elementsScore) * 100) / 100;
        }

        function evaluate() {
            const result = score();
            const ok = result >= 2.5;

            if (result >= 3.5) {
                setFeedback({
                    kind: "success",
                    score: result,
                    message:
                        "Excelente. Elegiste una propuesta coherente, justificaste bien tu elección y reconociste qué elementos combina.",
                });
                onEvaluate?.(1);
            } else if (ok) {
                setFeedback({
                    kind: "success",
                    score: result,
                    message:
                        "Aprobado. Revisa igual si algún detalle de la justificación o los elementos podría afinarse.",
                });
                onEvaluate?.(1);
            } else if (result >= 1) {
                setFeedback({
                    kind: "warning",
                    score: result,
                    message:
                        "Vas bien. Revisa si la razón que marcaste, o los elementos que identificaste, corresponden realmente a la propuesta que elegiste.",
                });
                onEvaluate?.(0);
            } else {
                setFeedback({
                    kind: "error",
                    score: result,
                    message:
                        "Revisa primero qué necesita lograr el contenido, qué opción transmite la idea con menos carga para la audiencia y qué formatos combina realmente.",
                });
                onEvaluate?.(0);
            }

            return ok;
        }

        useImperativeHandle(ref, () => ({
            check: evaluate,
            isReady: () => isReady,
            reset: () => {
                setProposal(null);
                setPicked({});
                setPickedElements({});
                setFeedback({ kind: "idle" });
                onEvaluate?.(0);
                onReadyChange?.(false);
            },
        }));

        return (
            <section className="space-y-5">
                <div className="rounded-2xl border bg-white p-4 shadow">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                        Auditoría comparativa
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-800">
                        {scenario.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {scenario.context}
                    </p>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-800">
                            Criterios para decidir:
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
                            {scenario.criteria.map((criterion) => (
                                <li key={criterion}>{criterion}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <h4 className="font-semibold text-slate-800">1. Elige la mejor propuesta</h4>
                    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                        {proposals.map((item) => {
                            const isPicked = proposal === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => pickProposal(item.id)}
                                    className={`h-full min-h-[80px] w-full rounded-2xl border p-4 text-left transition ${
                                        isPicked
                                            ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                            : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-sm"
                                    }`}
                                >
                                    <p className="font-semibold text-slate-800">{item.displayTitle}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {item.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: proposal && step2 ? "1fr" : "0fr" }}
                    >
                        <div className="overflow-hidden">
                            {step2 && (
                                <div className="mt-5 border-t-2 border-slate-200 pt-5">
                                    <h4 className="font-semibold text-slate-800">{step2.heading}</h4>
                                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {step2.options.map((item) => {
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
                                                        onChange={() => toggleOption(item.id)}
                                                        className="mt-1 h-5 w-5 shrink-0 rounded accent-[#286575]"
                                                    />
                                                    <span className="font-medium leading-relaxed text-slate-800">
                                                        {item.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <div
                                        className="grid transition-all duration-300 ease-in-out"
                                        style={{ gridTemplateRows: step2Done && step3 ? "1fr" : "0fr" }}
                                    >
                                        <div className="overflow-hidden">
                                            {step3 && (
                                                <div className="mt-5 border-t-2 border-slate-200 pt-5">
                                                    <h4 className="font-semibold text-slate-800">
                                                        {step3.heading}
                                                    </h4>
                                                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                                                        {step3.options.map((item, index) => {
                                                            const isPicked = !!pickedElements[item.id];
                                                            const isLastOnOwnRow = index === step3.options.length - 1 && step3.options.length % 2 !== 0;

                                                            return (
                                                                <label
                                                                    key={item.id}
                                                                    className={`flex cursor-pointer select-none items-start gap-3 rounded-2xl border p-3 text-sm transition ${
                                                                        isPicked
                                                                            ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                                                            : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-sm"
                                                                    } ${isLastOnOwnRow ? "md:col-span-2 md:mx-auto md:w-[calc(50%-0.25rem)]" : ""}`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isPicked}
                                                                        onChange={() => toggleElement(item.id)}
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
                            )}
                        </div>
                    </div>
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
                        <p className="font-semibold">Puntaje: {feedback.score}/4</p>
                        <p className="mt-1">{feedback.message}</p>
                    </div>
                )}
            </section>
        );
    }
);

DevelopExerciseA1.displayName = "DevelopExerciseA1";

export default DevelopExerciseA1;