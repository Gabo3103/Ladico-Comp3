"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type ExerciseQuality = "good" | "partial" | "bad";

export type IntegrationExerciseA3CarouselGrade = {
    correctCount: number;
    totalCount: number;
    quality: ExerciseQuality;
};

export type IntegrationExerciseA3CarouselHandle = {
    check: (opts?: { silent?: boolean }) => boolean;
    isReady: () => boolean;
    reset: () => void;
    grade: () => IntegrationExerciseA3CarouselGrade;
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
    seed?: number;
};

type QuestionId = "content" | "structure" | "visual" | "tools";

type Option = {
    id: string;
    label: string;
};

type Question = {
    id: QuestionId;
    dimension: string;
    prompt: string;
    options: Option[];
    correct: string;
};

type Scenario = {
    id: string;
    sourceFormat: string;
    targetFormat: string;
    audience: string;
    requirements: string[];
    tools: string;
    questions: Question[];
};

const SCENARIOS: Scenario[] = [
    {
        id: "social-media-article",
        sourceFormat: "un artículo extenso sobre uso responsable de redes sociales",
        targetFormat: "un post informativo para Instagram",
        audience: "estudiantes de enseñanza media",
        requirements: ["Ser breve", "Ser visual", "Ser fácil de comprender", "Destacar ideas clave"],
        tools: "herramientas digitales que sugieren resúmenes o formatos",
        questions: [
            {
                id: "content",
                dimension: "Reelaboración",
                prompt: "¿Qué debes hacer con el contenido original?",
                options: [
                    { id: "a", label: "Seleccionar las ideas principales y eliminar detalles secundarios" },
                    { id: "b", label: "Mantener la mayor cantidad de contenido posible" },
                    { id: "c", label: "Incluir toda la información para asegurar precisión" },
                    { id: "d", label: "Copiar el contenido y dividirlo en partes" },
                ],
                correct: "a",
            },
            {
                id: "structure",
                dimension: "Cambio de formato",
                prompt: "¿Cómo organizarías el contenido?",
                options: [
                    { id: "a", label: "Dividirlo en secciones breves, con una idea por página" },
                    { id: "b", label: "Mantener bloques de texto extensos" },
                    { id: "c", label: "Presentar toda la información en una sola página" },
                    { id: "d", label: "Organizarlo solo por el orden del texto original" },
                ],
                correct: "a",
            },
            {
                id: "visual",
                dimension: "Integración de elementos",
                prompt: "¿Qué decisión sobre elementos visuales es más adecuada?",
                options: [
                    { id: "a", label: "Incorporar imágenes o íconos que refuercen las ideas clave y ayuden a organizar visualmente la información" },
                    { id: "b", label: "Incorporar imágenes generales relacionadas con el tema, para hacer el recurso más atractivo visualmente" },
                    { id: "c", label: "Priorizar una presentación centrada en texto, usando apoyos visuales solo de manera mínima" },
                    { id: "d", label: "Seleccionar recursos visuales llamativos que mantengan el interés, aunque no todos aporten de la misma forma a la comprensión" },
                ],
                correct: "a",
            },
            {
                id: "tools",
                dimension: "Uso de herramientas",
                prompt: "¿Cómo conviene usar las sugerencias automáticas de la herramienta?",
                options: [
                    { id: "a", label: "Usarlas como apoyo inicial, revisando cuáles contribuyen realmente al objetivo del recurso" },
                    { id: "b", label: "Incorporarlas para agilizar el proceso de edición y organización del contenido" },
                    { id: "c", label: "Limitar su uso, para mantener un mayor control sobre las decisiones de edición" },
                    { id: "d", label: "Aprovechar todas las funciones de apoyo disponibles, priorizando la fluidez del trabajo antes que revisar cada resultado" },
                ],
                correct: "a",
            },
        ],
    },
    {
        id: "study-habits-article",
        sourceFormat: "un artículo extenso sobre hábitos de estudio efectivos",
        targetFormat: "una infografía",
        audience: "estudiantes de primer año de universidad",
        requirements: ["Ser breve", "Ser visual", "Ser fácil de comprender", "Destacar los hábitos clave"],
        tools: "herramientas digitales que sugieren resúmenes o formatos de visualización",
        questions: [
            {
                id: "content",
                dimension: "Reelaboración",
                prompt: "¿Qué debes hacer con el contenido original?",
                options: [
                    { id: "a", label: "Seleccionar los hábitos más relevantes y eliminar los ejemplos secundarios del artículo" },
                    { id: "b", label: "Mantener la mayor cantidad de ejemplos posible, para no perder matices del artículo" },
                    { id: "c", label: "Incluir todo el contenido original, asegurando que no falte ningún dato" },
                    { id: "d", label: "Copiar fragmentos del artículo y distribuirlos en distintas secciones de la infografía" },
                ],
                correct: "a",
            },
            {
                id: "structure",
                dimension: "Cambio de formato",
                prompt: "¿Cómo organizarías el contenido?",
                options: [
                    { id: "a", label: "Agrupar los hábitos en bloques breves, uno por sección visual" },
                    { id: "b", label: "Mantener párrafos extensos que expliquen cada hábito en detalle" },
                    { id: "c", label: "Presentar todos los hábitos juntos en un solo bloque de texto" },
                    { id: "d", label: "Seguir el mismo orden del artículo, aunque algunos hábitos sean menos relevantes para esta audiencia" },
                ],
                correct: "a",
            },
            {
                id: "visual",
                dimension: "Integración de elementos",
                prompt: "¿Qué decisión sobre elementos visuales es más adecuada?",
                options: [
                    { id: "a", label: "Incorporar íconos que refuercen cada hábito y ayuden a organizar visualmente la infografía" },
                    { id: "b", label: "Incorporar imágenes generales sobre estudiantes universitarios, para hacer la infografía más atractiva" },
                    { id: "c", label: "Centrar la infografía en texto, usando apoyos visuales de forma mínima" },
                    { id: "d", label: "Elegir imágenes llamativas que mantengan el interés, aunque no todas refuercen un hábito específico" },
                ],
                correct: "a",
            },
            {
                id: "tools",
                dimension: "Uso de herramientas",
                prompt: "¿Cómo conviene usar las sugerencias automáticas de la herramienta?",
                options: [
                    { id: "a", label: "Usarlas como punto de partida, revisando cuáles aportan realmente al objetivo de la infografía" },
                    { id: "b", label: "Incorporarlas para agilizar el diseño de la infografía" },
                    { id: "c", label: "Evitar su uso, para mantener control total sobre el diseño" },
                    { id: "d", label: "Aprovechar todas las funciones de apoyo disponibles, priorizando la rapidez antes que revisar cada resultado" },
                ],
                correct: "a",
            },
        ],
    },
    {
        id: "physical-activity-article",
        sourceFormat: "un artículo extenso sobre los beneficios de la actividad física",
        targetFormat: "un guion para una animación breve",
        audience: "estudiantes de enseñanza básica",
        requirements: ["Ser breve", "Ser visual", "Ser fácil de comprender", "Destacar las ideas clave"],
        tools: "herramientas digitales que sugieren guiones o formatos",
        questions: [
            {
                id: "content",
                dimension: "Reelaboración",
                prompt: "¿Qué debes hacer con el contenido original?",
                options: [
                    { id: "a", label: "Seleccionar las ideas centrales sobre por qué moverse es bueno, dejando fuera detalles técnicos" },
                    { id: "b", label: "Mantener la mayor cantidad de explicaciones posible, para no simplificar de más" },
                    { id: "c", label: "Incluir toda la información del artículo, para que la animación sea completa" },
                    { id: "d", label: "Copiar frases del artículo y repartirlas entre distintas escenas" },
                ],
                correct: "a",
            },
            {
                id: "structure",
                dimension: "Cambio de formato",
                prompt: "¿Cómo organizarías el contenido?",
                options: [
                    { id: "a", label: "Dividir el guion en escenas breves, cada una con una sola idea" },
                    { id: "b", label: "Mantener una escena larga que explique todo el tema de una vez" },
                    { id: "c", label: "Presentar todas las ideas en la escena inicial, para no dejar nada fuera" },
                    { id: "d", label: "Seguir el mismo orden del artículo, aunque algunas ideas sean menos relevantes para esta edad" },
                ],
                correct: "a",
            },
            {
                id: "visual",
                dimension: "Integración de elementos",
                prompt: "¿Qué decisión sobre elementos visuales es más adecuada?",
                options: [
                    { id: "a", label: "Incorporar imágenes simples que representen cada idea central de forma reconocible para niños" },
                    { id: "b", label: "Incorporar imágenes generales sobre deporte, para hacer la animación más entretenida" },
                    { id: "c", label: "Centrar la animación en texto narrado, usando imágenes de forma mínima" },
                    { id: "d", label: "Elegir imágenes llamativas que mantengan la atención, aunque no todas representen una idea específica" },
                ],
                correct: "a",
            },
            {
                id: "tools",
                dimension: "Uso de herramientas",
                prompt: "¿Cómo conviene usar las sugerencias automáticas de la herramienta?",
                options: [
                    { id: "a", label: "Usarlas como borrador inicial, ajustando las partes que no se entiendan bien para esta edad" },
                    { id: "b", label: "Incorporarlas para agilizar la escritura del guion" },
                    { id: "c", label: "Evitar su uso, para asegurar que el guion sea completamente propio" },
                    { id: "d", label: "Aprovechar todas las funciones de apoyo disponibles, priorizando la rapidez antes que revisar cada escena" },
                ],
                correct: "a",
            },
        ],
    },
];

function shuffleOptions(question: Question): Question {
    const shuffled = [...question.options].sort(() => Math.random() - 0.5);
    return { ...question, options: shuffled };
}

function pickScenario(seed?: number) {
    const scenario = SCENARIOS[Math.floor((seed ?? Math.random()) * SCENARIOS.length)];
    return {
        ...scenario,
        questions: scenario.questions.map(shuffleOptions),
    };
}

const IntegrationExerciseA3Carousel = forwardRef<IntegrationExerciseA3CarouselHandle, Props>(
    function IntegrationExerciseA3Carousel({ onEvaluate, onReadyChange, seed }, ref) {
        const scenario = useMemo(() => pickScenario(seed), [seed]);
        const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
        const [checked, setChecked] = useState(false);
        const [activeQuestion, setActiveQuestion] = useState(0);

        const allAnswered = scenario.questions.every((q) => !!answers[q.id]);

        useEffect(() => {
            onReadyChange?.(allAnswered);
        }, [allAnswered, onReadyChange]);

        function setAnswer(questionId: QuestionId, optionId: string) {
            setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
            setChecked(false);
            setActiveQuestion((current) =>
                current < scenario.questions.length - 1 ? current + 1 : current
            );
        }

        function computeGrade(): IntegrationExerciseA3CarouselGrade {
            const correctCount = scenario.questions.reduce(
                (total, q) => total + Number(answers[q.id] === q.correct),
                0
            );
            const totalCount = scenario.questions.length;

            let quality: ExerciseQuality = "bad";
            if (correctCount === totalCount) quality = "good";
            else if (correctCount >= 2) quality = "partial";

            return { correctCount, totalCount, quality };
        }

        function evaluate(opts?: { silent?: boolean }) {
            if (!allAnswered) return false;
            const result = computeGrade();
            const ok = result.quality === "good" || result.quality === "partial";
            if (!opts?.silent) setChecked(true);
            onEvaluate?.(ok ? 1 : 0);
            return ok;
        }

        useImperativeHandle(ref, () => ({
            check: evaluate,
            isReady: () => allAnswered,
            grade: computeGrade,
            reset: () => {
                setAnswers({});
                setChecked(false);
                setActiveQuestion(0);
                onEvaluate?.(0);
                onReadyChange?.(false);
            },
        }));

        const grade = checked ? computeGrade() : null;

        return (
            <section className="space-y-4">
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <p className="mt-2 text-sm leading-relaxed  text-slate-800 font-bold">
                        Debes transformar {scenario.sourceFormat} en {scenario.targetFormat},
                        dirigido a {scenario.audience}.
                    </p>
                    <ul className="mt-3 grid grid-cols-1 gap-1 text-sm leading-relaxed text-slate-600 sm:grid-cols-2">
                        {scenario.requirements.map((req) => (
                            <li key={req} className="flex items-start gap-1.5">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#286575]" />
                                {req}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pregunta activa */}
                {scenario.questions.map((question, index) => {
                    if (index !== activeQuestion) return null;
                    const current = answers[question.id];
                    const isCorrect = checked && current === question.correct;

                    return (
                        <div key={question.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                            {/* Puntos de navegación */}
                            <div className="mb-3 flex items-center justify-center gap-2">
                                {scenario.questions.map((q, idx) => {
                                    const isAnswered = !!answers[q.id];
                                    const isActive = idx === activeQuestion;

                                    return (
                                        <button
                                            key={q.id}
                                            type="button"
                                            onClick={() => setActiveQuestion(idx)}
                                            aria-label={`Ir a la pregunta ${idx + 1}`}
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
                            <span className="rounded-full bg-[#e4f3f5] px-3 py-1 text-xs font-semibold text-[#286575]">
                                {question.dimension}
                            </span>
                            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800">
                                {question.prompt}
                            </p>

                            <div className="mt-3 space-y-2">
                                {question.options.map((option) => {
                                    const selected = current === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setAnswer(question.id, option.id)}
                                            className={`block w-full rounded-xl border px-4 py-3 text-left text-sm leading-relaxed shadow-sm transition ${
                                                selected
                                                    ? "border-[#286575] bg-[#e4f3f5] font-medium text-[#1d4f5c] ring-2 ring-[#286575]/20"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-[#286575]/40 hover:bg-slate-50"
                                            } disabled:cursor-default`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {checked && (
                                <div
                                    className={`mt-3 rounded-xl border p-3 text-xs ${
                                        isCorrect
                                            ? "border-emerald-500/40 bg-emerald-50 text-emerald-600"
                                            : "border-rose-500/40 bg-rose-50 text-rose-600"
                                    }`}
                                >
                                    {isCorrect
                                        ? "Correcto."
                                        : `La opción más adecuada es: ${
                                              question.options.find((o) => o.id === question.correct)
                                                  ?.label
                                          }`}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Navegación prev/next */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={() => setActiveQuestion((i) => Math.max(0, i - 1))}
                        disabled={activeQuestion === 0}
                        className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                            activeQuestion === 0
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                        }`}
                    >
                        ← Anterior
                    </button>

                    <span className="text-xs text-slate-400">
                        {Object.keys(answers).length}/{scenario.questions.length} respondidas
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setActiveQuestion((i) =>
                                Math.min(scenario.questions.length - 1, i + 1)
                            )
                        }
                        disabled={activeQuestion === scenario.questions.length - 1}
                        className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                            activeQuestion === scenario.questions.length - 1
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                        }`}
                    >
                        Siguiente →
                    </button>
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
                            Respuestas correctas: {grade.correctCount}/{grade.totalCount}
                        </p>
                        <p className="mt-1">
                            {grade.quality === "good"
                                ? "Excelente. Reelaboras el contenido complejo de forma adecuada al nuevo formato y audiencia."
                                : grade.quality === "partial"
                                ? "Realizas una reelaboración parcialmente adecuada. Revisa la pregunta que falló."
                                : "Revisa cómo seleccionar, organizar, ilustrar y usar sugerencias automáticas al cambiar de formato."}
                        </p>
                    </div>
                )}
            </section>
        );
    }
);

IntegrationExerciseA3Carousel.displayName = "IntegrationExerciseA3Carousel";

export default IntegrationExerciseA3Carousel;