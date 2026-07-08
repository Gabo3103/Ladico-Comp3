"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type ExerciseQuality = "good" | "partial" | "bad";

export type IntegrationExerciseA1AuditGrade = {
    formatScore: number;
    justificationScore: number;
    elementsScore: number;
    total: number;
    quality: ExerciseQuality;
};

export type IntegrationExerciseA1AuditHandle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
    grade: () => IntegrationExerciseA1AuditGrade;
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
};

type FormatId = "document" | "presentation" | "video" | "infographic";

type FailureOption = {
    id: string;
    text: string;
};

type FormatOption = {
    id: FormatId;
    label: string;
    description: string;
    // Solo aplica a formatos NO correctos: diagnóstico de qué requisito no cumplen.
    failureOptions?: FailureOption[];
    correctFailureId?: string;
};

type Justification = {
    id: string;
    text: string;
};

type Step3Element = {
    id: string;
    label: string;
};

type Scenario = {
    id: string;
    topic: string;
    audience: string;
    requirements: string[];
    formats: FormatOption[];
    expectedFormat: FormatId;
    justifications: Justification[];
    expectedJustification: string;
    // Paso 3: Integración multimodal — 3 alternativas propias del caso, 2 correctas.
    step3Elements: [Step3Element, Step3Element, Step3Element];
    step3CorrectIds: [string, string];
};

const FORMAT_LABEL: Record<FormatId, string> = {
    document: "Documento",
    presentation: "Presentación",
    video: "Video",
    infographic: "Infografía",
};

const SCENARIOS: Scenario[] = [
    {
        id: "social-media-impact",
        topic: "Impacto del uso de redes sociales en estudiantes de primer año",
        audience: "Estudiantes de primer año de universidad",
        requirements: [
            "Ser claro y atractivo",
            "Integrar información de distintas fuentes",
            "Incluir texto explicativo, datos estadísticos, una cita relevante y elementos visuales",
            "Presentar la información de forma organizada y comprensible",
        ],
        formats: [
            {
                id: "document",
                label: "Documento",
                description:
                    "Organizado en secciones, integra texto y citas, incorpora los datos dentro del contenido, pero con apoyo visual limitado.",
                correctFailureId: "no-visual",
                failureOptions: [
                    { id: "no-visual", text: "No incorpora apoyo visual, un requisito explícito del caso" },
                    { id: "no-sources", text: "No integra información proveniente de distintas fuentes" },
                    { id: "no-quote", text: "No incluye ninguna cita relevante" },
                    { id: "more-depth-doc", text: "Porque desarrolla el tema con mayor profundidad textual que otros formatos" },
                ],
            },
            {
                id: "presentation",
                label: "Presentación",
                description:
                    "Ideas clave resumidas, gráficos e imágenes de apoyo, y una cita destacada.",
            },
            {
                id: "video",
                label: "Video",
                description:
                    "Explicativo con ejemplos y apoyo visual, donde los datos y la cita se mencionan de forma general.",
                correctFailureId: "vague-data",
                failureOptions: [
                    { id: "vague-data", text: "Los datos y la cita se presentan sin el detalle necesario" },
                    { id: "no-attractive", text: "No resulta claro ni atractivo para la audiencia" },
                    { id: "no-visual-support", text: "No ofrece ningún apoyo visual" },
                    { id: "dynamic-video", text: "Porque resulta atractivo y dinámico para captar la atención de la audiencia" },
                ],
            },
            {
                id: "infographic",
                label: "Infografía",
                description:
                    "Con varias imágenes y gráficos llamativos, pero con escasa explicación textual y sin contextualizar bien la información de las fuentes.",
                correctFailureId: "no-context",
                failureOptions: [
                    { id: "no-context", text: "Tiene escasa explicación textual y no contextualiza la información" },
                    { id: "no-visuals", text: "No incluye suficientes elementos visuales" },
                    { id: "wrong-audience", text: "No es adecuada para estudiantes de primer año" },
                    { id: "highlight-visual", text: "Porque destaca visualmente los elementos más relevantes del tema" },
                ],
            },
        ],
        expectedFormat: "presentation",
        expectedJustification: "balances-all",
        justifications: [
            {
                id: "balances-all",
                text: "Porque combina el formato, los datos y la cita que pide el caso",
            },
            {
                id: "visual-impact",
                text: "Porque prioriza el impacto visual inmediato, lo que capta mejor la atención de estudiantes de primer año",
            },
            {
                id: "more-depth",
                text: "Porque permite explicar el tema con mayor extensión y profundidad que otros formatos",
            },
            {
                id: "less-detail",
                text: "No profundiza en cada dato citado con el mismo detalle que ofrecería un documento extenso",
            },
        ],
        step3Elements: [
            { id: "text-summary", label: "Texto resumido con las ideas clave" },
            { id: "visual-support", label: "Apoyo visual (gráficos e imágenes)" },
            { id: "testimonials", label: "Testimonios narrados de estudiantes" },
        ],
        step3CorrectIds: ["text-summary", "visual-support"],
    },
    {
        id: "ai-grading-report",
        topic: "Uso de inteligencia artificial en la corrección de evaluaciones escolares",
        audience: "Comité docente que debe tomar una decisión informada",
        requirements: [
            "Fundamentar cada afirmación con evidencia citada",
            "Permitir revisar el detalle de cada fuente",
            "Mantener un desarrollo extenso del tema",
            "Integrar datos, texto explicativo y citas de forma trazable",
        ],
        formats: [
            {
                id: "document",
                label: "Documento",
                description:
                    "Organizado en secciones, integra explicación extensa, datos y citas trazables, con apoyo visual moderado.",
            },
            {
                id: "presentation",
                label: "Presentación",
                description:
                    "Ideas clave resumidas y gráficos de apoyo, mencionando las fuentes principales.",
                correctFailureId: "no-traceable",
                failureOptions: [
                    { id: "no-traceable", text: "Resume las ideas sin permitir revisar el detalle de cada fuente" },
                    { id: "no-graphics", text: "No incluye gráficos de apoyo" },
                    { id: "wrong-committee", text: "No resulta adecuada para presentar ante un comité docente" },
                    { id: "clear-summary", text: "Porque resume claramente las ideas clave para una exposición breve" },
                ],
            },
            {
                id: "infographic",
                label: "Infografía",
                description:
                    "Con los datos más relevantes destacados visualmente y textos breves.",
                correctFailureId: "no-depth",
                failureOptions: [
                    { id: "no-depth", text: "Los textos breves no permiten trazar el detalle de cada fuente" },
                    { id: "no-highlight", text: "No destaca visualmente los datos relevantes" },
                    { id: "not-clear", text: "No es visualmente clara para el comité" },
                    { id: "highlight-data", text: "Porque destaca visualmente los datos más relevantes de un vistazo" },
                ],
            },
            {
                id: "video",
                label: "Video",
                description:
                    "Explicativo que resume los hallazgos principales con ejemplos.",
                correctFailureId: "no-depth-video",
                failureOptions: [
                    { id: "no-depth-video", text: "Resume los hallazgos sin trazar el detalle de cada fuente" },
                    { id: "no-examples", text: "No incluye ejemplos que ilustren los hallazgos" },
                    { id: "no-findings", text: "No explica los hallazgos principales" },
                    { id: "engaging-video", text: "Porque presenta los hallazgos de forma cercana y fácil de seguir" },
                ],
            },
        ],
        expectedFormat: "document",
        expectedJustification: "traceable-depth",
        justifications: [
            {
                id: "traceable-depth",
                text: "Porque el comité necesita revisar cada fuente, y el formato permite esa trazabilidad",
            },
            {
                id: "faster-reading",
                text: "Porque incluye gráficos que facilitan una lectura más rápida del contenido",
            },
            {
                id: "memorable-images",
                text: "Porque resume la información en imágenes que se recuerdan con facilidad",
            },
            {
                id: "less-visual",
                text: "No resulta tan visualmente atractivo como una presentación o infografía",
            },
        ],
        step3Elements: [
            { id: "extensive-text", label: "Explicación textual extensa" },
            { id: "traceable-data", label: "Datos y citas trazables a su fuente" },
            { id: "video-demo", label: "Video demostrativo del proceso" },
        ],
        step3CorrectIds: ["extensive-text", "traceable-data"],
    },
    {
        id: "sleep-before-test",
        topic: "Beneficios de dormir bien antes de rendir una prueba",
        audience: "Estudiantes que verán el recurso en un panel del pasillo, por pocos segundos",
        requirements: [
            "Mostrar dos o tres datos clave de forma inmediata",
            "Ser legible de un vistazo",
            "No requerir detenerse a leer un texto extenso",
        ],
        formats: [
            {
                id: "document",
                label: "Documento",
                description: "Con explicación detallada y los datos incorporados en el texto.",
                correctFailureId: "not-instant",
                failureOptions: [
                    { id: "not-instant", text: "Requiere leer el texto, sin ofrecer una lectura inmediata" },
                    { id: "no-data", text: "No incluye los datos clave del tema" },
                    { id: "not-for-panel", text: "No puede exhibirse en un panel del pasillo" },
                    { id: "thorough-doc", text: "Porque explica el tema con el detalle y rigor que un documento permite" },
                ],
            },
            {
                id: "presentation",
                label: "Presentación",
                description: "Con varias diapositivas que desarrollan el tema paso a paso.",
                correctFailureId: "not-glance",
                failureOptions: [
                    { id: "not-glance", text: "Desarrolla el tema en varias diapositivas, sin captarlo de un vistazo" },
                    { id: "no-key-data", text: "No muestra ningún dato clave" },
                    { id: "not-legible", text: "No es legible el contenido de las diapositivas" },
                    { id: "progressive-slides", text: "Porque desarrolla el tema de forma ordenada y progresiva" },
                ],
            },
            {
                id: "infographic",
                label: "Infografía",
                description: "Con los datos clave destacados visualmente y textos breves.",
            },
            {
                id: "video",
                label: "Video",
                description: "Explicativo, con testimonios y ejemplos.",
                correctFailureId: "not-instant-video",
                failureOptions: [
                    { id: "not-instant-video", text: "Requiere verlo completo, sin ofrecer una lectura inmediata" },
                    { id: "no-testimonials", text: "No incluye testimonios ni ejemplos" },
                    { id: "not-explanatory", text: "No resulta explicativo sobre el tema" },
                    { id: "close-video", text: "Porque resulta más dinámico y cercano gracias a los testimonios" },
                ],
            },
        ],
        expectedFormat: "infographic",
        expectedJustification: "instant-read",
        justifications: [
            {
                id: "instant-read",
                text: "Porque el panel se observa por segundos, y el formato prioriza una lectura inmediata",
            },
            {
                id: "more-extension",
                text: "Porque permite desarrollar el tema con mayor extensión que otros formatos",
            },
            {
                id: "testimonials",
                text: "Porque incorpora testimonios que hacen el contenido más cercano a la audiencia",
            },
            {
                id: "less-depth",
                text: "No permite profundizar en los fundamentos científicos del tema",
            },
        ],
        step3Elements: [
            { id: "visual-highlight", label: "Datos destacados visualmente" },
            { id: "quick-icons", label: "Íconos o gráficos de lectura rápida" },
            { id: "written-references", label: "Referencias bibliográficas escritas" },
        ],
        step3CorrectIds: ["visual-highlight", "quick-icons"],
    },
    {
        id: "two-factor-setup",
        topic: "Cómo configurar el doble factor de autenticación en el correo institucional",
        audience: "Funcionarios que revisarán el recurso de forma autónoma, sin apoyo en vivo",
        requirements: [
            "Mostrar la secuencia exacta de pasos en pantalla",
            "Permitir replicar cada paso sin ayuda adicional",
            "Explicar el proceso mientras se muestra",
        ],
        formats: [
            {
                id: "document",
                label: "Documento",
                description: "Con instrucciones escritas paso a paso.",
                correctFailureId: "no-onscreen",
                failureOptions: [
                    { id: "no-onscreen", text: "No muestra la secuencia en pantalla, solo la describe por escrito" },
                    { id: "no-steps", text: "No incluye instrucciones paso a paso" },
                    { id: "not-repeatable", text: "No permite repetir el proceso más de una vez" },
                    { id: "written-reference", text: "Porque queda disponible como referencia escrita para revisar cuando se necesite" },
                ],
            },
            {
                id: "infographic",
                label: "Infografía",
                description: "Con los pasos representados mediante iconos.",
                correctFailureId: "no-explanation",
                failureOptions: [
                    { id: "no-explanation", text: "Representa los pasos con íconos, pero no los explica" },
                    { id: "no-sequence", text: "No muestra la secuencia de pasos" },
                    { id: "not-clear-visual", text: "No es clara visualmente para quien la revisa" },
                    { id: "clear-summary-steps", text: "Porque resume visualmente los pasos de forma clara y ordenada" },
                ],
            },
            {
                id: "video",
                label: "Video",
                description:
                    "Explicativo que muestra la secuencia de pasos directamente en pantalla, con narración.",
            },
            {
                id: "presentation",
                label: "Presentación",
                description: "Con una diapositiva para cada paso del proceso.",
                correctFailureId: "static-no-sync",
                failureOptions: [
                    { id: "static-no-sync", text: "Muestra cada paso en una diapositiva estática, sin explicación simultánea" },
                    { id: "no-order", text: "No organiza los pasos en el orden correcto" },
                    { id: "not-reviewable", text: "No permite revisar el proceso más adelante" },
                    { id: "clear-slide-per-step", text: "Porque organiza cada paso en una diapositiva independiente y clara" },
                ],
            },
        ],
        expectedFormat: "video",
        expectedJustification: "shows-sequence",
        justifications: [
            {
                id: "shows-sequence",
                text: "Porque muestra la secuencia en pantalla, permitiendo repetir cada paso de forma autónoma",
            },
            {
                id: "essential-steps",
                text: "Porque reduce el contenido a los pasos esenciales sin texto adicional",
            },
            {
                id: "independent-units",
                text: "Porque organiza cada paso en una unidad independiente y fácil de repasar",
            },
            {
                id: "not-referenceable",
                text: "No queda disponible como texto de referencia para revisar más adelante",
            },
        ],
        step3Elements: [
            { id: "onscreen-sequence", label: "Secuencia mostrada en pantalla" },
            { id: "narration", label: "Narración explicativa" },
            { id: "written-reference", label: "Documento de referencia escrita" },
        ],
        step3CorrectIds: ["onscreen-sequence", "narration"],
    },
];

function pickScenario() {
    return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}

type Step2Option = { id: string; text: string };
type Step2Setup = {
    heading: string;
    options: Step2Option[];
    correctId: string;
};

// El paso 2 depende de qué formato se elige (igual que en DevelopExerciseA1 de
// 3.1): si es el correcto, se justifica por qué; si es incorrecto, se diagnostica
// específicamente qué requisito del caso NO logra cumplir esa opción concreta.
// El encabezado es el mismo en ambos casos para no delatar si el formato elegido
// es o no el correcto antes de leer las alternativas.
function buildStep2(scenario: Scenario, formatId: FormatId): Step2Setup {
    const heading = "2. Marca la afirmación que mejor describe esta opción frente al caso";

    if (formatId === scenario.expectedFormat) {
        return {
            heading,
            options: scenario.justifications,
            correctId: scenario.expectedJustification,
        };
    }

    const chosen = scenario.formats.find((f) => f.id === formatId)!;

    return {
        heading,
        options: chosen.failureOptions ?? [],
        correctId: chosen.correctFailureId ?? "",
    };
}

const IntegrationExerciseA1Audit = forwardRef<IntegrationExerciseA1AuditHandle, Props>(
    function IntegrationExerciseA1Audit({ onEvaluate, onReadyChange }, ref) {
        const scenario = useMemo(() => pickScenario(), []);
        const [format, setFormat] = useState<FormatId | null>(null);
        const [step2Choice, setStep2Choice] = useState<string | null>(null);
        const [pickedElements, setPickedElements] = useState<string[]>([]);
        const [checked, setChecked] = useState(false);

        const step2 = useMemo(
            () => (format ? buildStep2(scenario, format) : null),
            [scenario, format]
        );

        const isReady = format !== null && step2Choice !== null && pickedElements.length > 0;

        useEffect(() => {
            onReadyChange?.(isReady);
        }, [isReady, onReadyChange]);

        function chooseFormat(id: FormatId) {
            setFormat(id);
            setStep2Choice(null);
            setPickedElements([]);
            setChecked(false);
        }

        function chooseStep2(id: string) {
            setStep2Choice(id);
            setChecked(false);
        }

        function toggleElement(id: string) {
            setPickedElements((prev) => {
                const isPicked = prev.includes(id);
                if (!isPicked && prev.length >= 2) return prev;
                return isPicked ? prev.filter((x) => x !== id) : [...prev, id];
            });
            setChecked(false);
        }

        function computeGrade(): IntegrationExerciseA1AuditGrade {
            const formatOk = format === scenario.expectedFormat;
            const justificationOk = !!step2 && step2Choice === step2.correctId;

            const formatScore = formatOk ? 2 : 0;
            const justificationScore = justificationOk ? 2 : 0;

            // Paso 3 (Integración multimodal): 0.5 por cada correcta marcada, sin
            // descontar por marcar la incorrecta (no restar).
            const elementsCorrectPicked = scenario.step3CorrectIds.filter((id) =>
                pickedElements.includes(id)
            ).length;
            const elementsScore = elementsCorrectPicked * 0.5;

            const total = formatScore + justificationScore + elementsScore;

            let quality: ExerciseQuality = "bad";
            if (total === 5) quality = "good";
            else if (total >= 3) quality = "partial";

            return {
                formatScore,
                justificationScore,
                elementsScore,
                total,
                quality,
            };
        }

        function evaluate() {
            if (!isReady) return false;
            const result = computeGrade();
            const ok = result.quality === "good" || result.quality === "partial";
            setChecked(true);
            onEvaluate?.(ok ? 1 : 0);
            return ok;
        }

        useImperativeHandle(ref, () => ({
            check: evaluate,
            isReady: () => isReady,
            grade: computeGrade,
            reset: () => {
                setFormat(null);
                setStep2Choice(null);
                setPickedElements([]);
                setChecked(false);
                onEvaluate?.(0);
                onReadyChange?.(false);
            },
        }));

        const grade = checked ? computeGrade() : null;

        return (
            <section className="space-y-4">
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold" style={{ color: "#286575" }}>
                        {scenario.topic}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Dirigido a: {scenario.audience}
                    </p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
                        {scenario.requirements.map((req) => (
                            <li key={req}>{req}</li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <h4 className="font-semibold text-slate-800">
                        1. Elige la mejor forma de integrar los contenidos
                    </h4>
                    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {scenario.formats.map((item) => {
                            const isPicked = format === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    disabled={checked}
                                    onClick={() => chooseFormat(item.id)}
                                    className={`h-full w-full rounded-2xl border px-5 py-4 text-left transition ${
                                        isPicked
                                            ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                            : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-sm"
                                    } disabled:cursor-default`}
                                >
                                    <p className="font-semibold text-slate-800">{item.label}</p>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                        {item.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: format && step2 ? "1fr" : "0fr" }}
                    >
                        <div className="overflow-hidden">
                            {step2 && (
                                <div className="mt-4 border-t pt-4">
                                    <h4 className="font-semibold text-slate-800">
                                        {step2.heading}
                                    </h4>
                                    <div className="mt-3 space-y-2">
                                        {step2.options.map((item) => {
                                            const isPicked = step2Choice === item.id;

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    disabled={checked}
                                                    onClick={() => chooseStep2(item.id)}
                                                    className={`block w-full rounded-2xl border px-5 py-4 text-left text-sm font-medium leading-relaxed shadow-sm transition ${
                                                        isPicked
                                                            ? "border-[#286575] bg-[#e4f3f5] text-[#1d4f5c] ring-2 ring-[#286575]/20"
                                                            : "border-slate-200 bg-white text-slate-700 hover:border-[#286575]/40 hover:bg-slate-50"
                                                    } disabled:cursor-default`}
                                                >
                                                    {item.text}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div
                                        className="grid transition-all duration-300 ease-in-out"
                                        style={{ gridTemplateRows: step2Choice ? "1fr" : "0fr" }}
                                    >
                                        <div className="overflow-hidden">
                                            {step2Choice && (
                                                <div className="mt-5 border-t pt-4">
                                                    <h4 className="font-semibold text-slate-800">
                                                        3. Marca qué elementos combina este formato en el caso
                                                    </h4>
                                                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                        {scenario.step3Elements.map((el) => {
                                                            const isPicked = pickedElements.includes(el.id);

                                                            return (
                                                                <label
                                                                    key={el.id}
                                                                    className={`flex cursor-pointer select-none items-start gap-3 rounded-2xl border p-3 text-sm transition ${
                                                                        isPicked
                                                                            ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                                                            : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-sm"
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isPicked}
                                                                        disabled={checked}
                                                                        onChange={() => toggleElement(el.id)}
                                                                        className="mt-1 h-5 w-5 shrink-0 rounded accent-[#286575]"
                                                                    />
                                                                    <span className="font-medium leading-relaxed text-slate-800">
                                                                        {el.label}
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
                        <p className="font-semibold">
                            Puntaje: {grade.total}/5
                        </p>
                        <p className="mt-1">
                            {grade.quality === "good"
                                ? `Excelente. La ${FORMAT_LABEL[
                                      scenario.expectedFormat
                                  ].toLowerCase()} integra correctamente los requisitos del caso, y la justificación describe bien por qué.`
                                : grade.quality === "partial"
                                ? "Aciertas en una parte de la decisión, pero revisa si el formato elegido y la justificación responden juntos a lo que pide el caso."
                                : `Revisa los requisitos del caso: la mejor opción era ${FORMAT_LABEL[
                                      scenario.expectedFormat
                                  ].toLowerCase()}, porque responde mejor a la audiencia y al propósito descritos.`}
                        </p>
                    </div>
                )}
            </section>
        );
    }
);

IntegrationExerciseA1Audit.displayName = "IntegrationExerciseA1Audit";

export default IntegrationExerciseA1Audit;