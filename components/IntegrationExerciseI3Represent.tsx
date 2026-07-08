"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type ExerciseQuality = "good" | "partial" | "bad";

export type IntegrationExerciseI3RepresentGrade = {
    correctCount: number;
    totalCount: number;
    quality: ExerciseQuality;
};

export type IntegrationExerciseI3RepresentHandle = {
    check: (opts?: { silent?: boolean }) => boolean;
    isReady: () => boolean;
    reset: () => void;
    grade: () => IntegrationExerciseI3RepresentGrade;
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
    seed?: number;
};

type QuestionId = "q1" | "q2" | "q3";

const QUESTION_DIMENSION_LABEL: Record<QuestionId, string> = {
    q1: "Transformación de información",
    q2: "Uso de herramientas",
    q3: "Claridad comunicativa",
};

type Option = {
    id: string;
    label: string;
};

type Question = {
    id: QuestionId;
    context: string;
    prompt: string;
    options: Option[];
    correct: string;
};

type Variant = {
    id: string;
    questions: Question[];
};

const VARIANTS: Variant[] = [
    {
        id: "social-media",
        questions: [
            {
                id: "q1",
                context:
                    "El 70% de los estudiantes usa redes sociales diariamente, el 20% ocasionalmente y el 10% no las utiliza.",
                prompt: "¿Qué forma de representación es más adecuada para esta información?",
                options: [
                    { id: "a", label: "Un texto breve que resume las tres cifras en una oración" },
                    { id: "b", label: "Gráfico de barras con el porcentaje de cada grupo" },
                    { id: "c", label: "Gráfico circular que representa proporciones" },
                ],
                correct: "b",
            },
            {
                id: "q2",
                context:
                    "Una herramienta digital sugiere automáticamente un formato para presentar la información.",
                prompt: "¿Qué decisión es más adecuada al utilizar herramientas digitales que sugieren formato?",
                options: [
                    { id: "a", label: "Aceptar automáticamente cualquier formato sugerido" },
                    { id: "b", label: "Seleccionar la representación sugerida solo si mejora la comprensión" },
                    { id: "c", label: "Evitar el uso de herramientas digitales para mantener el control total" },
                ],
                correct: "b",
            },
            {
                id: "q3",
                context:
                    "Se preparó una tabla para comparar ventajas y desventajas de dos plataformas digitales.",
                prompt: "¿Cuál de estas dos versiones de la tabla comunica con más claridad la comparación?",
                options: [
                    { id: "a", label: "Una tabla con una columna general de \"comentarios\" que incluye ventajas y desventajas juntas para cada plataforma" },
                    { id: "b", label: "Una tabla que separa ventajas y desventajas en columnas distintas para cada plataforma" },
                    { id: "c", label: "Cualquiera de las dos versiones comunica igual, ya que contienen la misma información" },
                ],
                correct: "b",
            },
        ],
    },
    {
        id: "library-loans",
        questions: [
            {
                id: "q1",
                context:
                    "De los libros prestados este mes, el 50% fueron novelas, el 30% textos de estudio y el 20% cómics.",
                prompt: "¿Qué representación comunica mejor estas proporciones?",
                options: [
                    { id: "a", label: "Gráfico de barras con el porcentaje de cada tipo de libro" },
                    { id: "b", label: "Gráfico circular que muestra qué fracción del total representa cada tipo" },
                    { id: "c", label: "Tabla con el porcentaje de cada tipo" },
                ],
                correct: "a",
            },
            {
                id: "q2",
                context:
                    "Una herramienta digital genera automáticamente un gráfico para los datos de préstamos.",
                prompt: "¿Qué conviene hacer con esa propuesta antes de usarla en el informe?",
                options: [
                    { id: "a", label: "Incorporarla directamente, ya que fue generada a partir de los mismos datos" },
                    { id: "b", label: "Sustituirla por una tabla, porque los datos numéricos siempre se comunican mejor en tablas" },
                    { id: "c", label: "Revisar si esa forma de mostrarlo realmente facilita entender los datos antes de usarla" },
                ],
                correct: "c",
            },
            {
                id: "q3",
                context:
                    "Se preparó un gráfico de barras con el promedio de los tres cursos en una misma prueba.",
                prompt: "¿Cuál de estas dos versiones del gráfico comunica con más claridad la comparación?",
                options: [
                    { id: "a", label: "Un gráfico con barras de colores distintos, cada una etiquetada con el nombre del curso, sin mostrar el puntaje exacto" },
                    { id: "b", label: "Un gráfico con barras de un solo color y el valor exacto indicado sobre cada una" },
                    { id: "c", label: "Ambas versiones comunican igual, ya que el color permite distinguir los cursos sin necesidad del valor exacto" },
                ],
                correct: "b",
            },
        ],
    },
    {
        id: "web-visits",
        questions: [
            {
                id: "q1",
                context:
                    "El número de visitas a la página del colegio creció mes a mes: 120 en marzo, 180 en abril, 250 en mayo y 320 en junio.",
                prompt: "¿Qué representación comunica mejor este comportamiento en el tiempo?",
                options: [
                    { id: "a", label: "Gráfico de barras con el total de visitas de cada mes" },
                    { id: "b", label: "Gráfico de líneas que muestre la tendencia mes a mes" },
                    { id: "c", label: "Tabla con las cuatro cifras ordenadas por mes" },
                ],
                correct: "b",
            },
            {
                id: "q2",
                context:
                    "Al cargar los datos de visitas, una herramienta sugiere automáticamente un tipo de gráfico distinto al que se pensaba usar.",
                prompt: "¿Qué refleja un uso crítico de esa sugerencia?",
                options: [
                    { id: "a", label: "Adoptarla, porque suele ajustarse mejor al tipo de datos cargados" },
                    { id: "b", label: "Compararla con la idea original y quedarse con la que comunique mejor la tendencia" },
                    { id: "c", label: "Conservar la idea original, ya que fue pensada con más tiempo" },
                ],
                correct: "b",
            },
            {
                id: "q3",
                context:
                    "Se preparó una lista numerada con los pasos para entregar la tarea: iniciar sesión, abrir la actividad, adjuntar el archivo y confirmar el envío.",
                prompt: "¿Cuál de estas dos versiones de la lista comunica con más claridad el proceso?",
                options: [
                    { id: "a", label: "Una lista numerada que agrupa dos acciones en un mismo paso (ej. \"abrir la actividad y adjuntar el archivo\")" },
                    { id: "b", label: "Una lista numerada con una acción distinta en cada paso, en el orden en que deben realizarse" },
                    { id: "c", label: "Cualquiera de las dos versiones comunica igual, ya que ambas incluyen las mismas cuatro acciones" },
                ],
                correct: "b",
            },
        ],
    },
    {
        id: "transport-apps",
        questions: [
            {
                id: "q1",
                context:
                    "En una encuesta sobre transporte al colegio, el 45% camina, el 35% usa transporte público y el 20% va en auto.",
                prompt: "¿Qué representación comunica mejor estas proporciones?",
                options: [
                    { id: "a", label: "Tabla con el porcentaje de cada medio de transporte" },
                    { id: "b", label: "Gráfico circular que muestre qué fracción representa cada medio" },
                    { id: "c", label: "Gráfico de barras con el porcentaje de cada medio de transporte" },
                ],
                correct: "c",
            },
            {
                id: "q2",
                context:
                    "Una herramienta de edición propone automáticamente un tipo de gráfico distinto al que se tenía planeado usar para los datos de transporte.",
                prompt: "¿Qué decisión refleja un uso crítico de la herramienta?",
                options: [
                    { id: "a", label: "Cambiar al gráfico propuesto, ya que fue generado según los datos cargados" },
                    { id: "b", label: "Mantener el gráfico planeado, porque ya estaba definido antes de ver la sugerencia" },
                    { id: "c", label: "Comparar ambas opciones y quedarse con la que represente mejor el significado de los datos" },
                ],
                correct: "c",
            },
            {
                id: "q3",
                context:
                    "Se preparó una tabla para comparar dos aplicaciones de estudio según costo, funciones disponibles y facilidad de uso.",
                prompt: "¿Cuál de estas dos versiones de la tabla comunica con más claridad la comparación?",
                options: [
                    { id: "a", label: "Una tabla con los tres criterios organizados en filas separadas para cada aplicación" },
                    { id: "b", label: "Una tabla con todos los criterios de ambas aplicaciones mezclados en una sola columna de texto" },
                    { id: "c", label: "Cualquiera de las dos versiones comunica igual, porque contienen los mismos datos" },
                ],
                correct: "a",
            },
        ],
    },
];

function pickVariant(seed?: number) {
    return VARIANTS[Math.floor((seed ?? Math.random()) * VARIANTS.length)];
}

const IntegrationExerciseI3Represent = forwardRef<
    IntegrationExerciseI3RepresentHandle,
    Props
>(function IntegrationExerciseI3Represent({ onEvaluate, onReadyChange, seed }, ref) {
    const questions = useMemo(() => pickVariant(seed).questions, [seed]);
    const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
    const [checked, setChecked] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState(0);

    const allAnswered = questions.every((q) => !!answers[q.id]);

    useEffect(() => {
        onReadyChange?.(allAnswered);
    }, [allAnswered, onReadyChange]);

    function setAnswer(questionId: QuestionId, optionId: string) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
        setChecked(false);
        setActiveQuestion((current) =>
            current < questions.length - 1 ? current + 1 : current
        );
    }

    function computeGrade(): IntegrationExerciseI3RepresentGrade {
        const correctCount = questions.reduce(
            (total, q) => total + Number(answers[q.id] === q.correct),
            0
        );
        const totalCount = questions.length;

        let quality: ExerciseQuality = "bad";
        if (correctCount === totalCount) quality = "good";
        else if (correctCount === 2) quality = "partial";

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
            {/* Pregunta activa */}
            {questions.map((question, index) => {
                if (index !== activeQuestion) return null;
                const current = answers[question.id];
                const isCorrect = checked && current === question.correct;

                return (
                    <div
                        key={question.id}
                        className="rounded-2xl border bg-white p-4 shadow-sm"
                    >
                        {/* Puntos de navegación */}
                        <div className="mb-3 flex items-center justify-center gap-2">
                            {questions.map((q, idx) => {
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
                        <span className="mb-2 inline-block rounded-full bg-[#e4f3f5] px-3 py-1 text-xs font-semibold text-[#286575]">
                            {QUESTION_DIMENSION_LABEL[question.id]}
                        </span>
                        <div className="mb-2 flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#286575] text-xs font-semibold text-white">
                                {index + 1}
                            </span>
                            <p className="text-sm font-medium leading-relaxed text-slate-800">
                                {question.prompt}
                            </p>
                        </div>

                        <p className="mb-3 ml-9 text-justify text-sm leading-relaxed text-slate-600">
                            {question.context}
                        </p>

                        <div className="ml-9 space-y-2">
                            {question.options.map((option) => {
                                const selected = current === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setAnswer(question.id, option.id)}
                                        className={`block w-full rounded-xl border px-4 py-2.5 text-left text-sm leading-relaxed transition ${
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
                                className={`ml-9 mt-3 rounded-xl border px-3 py-2 text-xs ${
                                    isCorrect
                                        ? "border-emerald-500/40 text-emerald-600"
                                        : "border-rose-500/40 text-rose-600"
                                }`}
                            >
                                {isCorrect
                                    ? "Correcto."
                                    : `La opción más adecuada es: ${
                                          question.options.find((o) => o.id === question.correct)
                                              ?.label
                                      }.`}
                            </div>
                        )}

                        {/* Navegación prev/next */}
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
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
                                <span
                                    className={`inline-block transition-transform duration-300 ${
                                        activeQuestion !== 0 ? "group-hover:-translate-x-1" : ""
                                    }`}
                                    aria-hidden
                                >
                                    ←
                                </span>
                                Anterior
                            </button>

                            <span className="text-xs text-slate-400">
                                {Object.keys(answers).length}/{questions.length} respondidas
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveQuestion((i) => Math.min(questions.length - 1, i + 1))
                                }
                                disabled={activeQuestion === questions.length - 1}
                                className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                                    activeQuestion === questions.length - 1
                                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                        : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                                }`}
                            >
                                Siguiente
                                <span
                                    className={`inline-block transition-transform duration-300 ${
                                        activeQuestion !== questions.length - 1
                                            ? "group-hover:translate-x-1"
                                            : ""
                                    }`}
                                    aria-hidden
                                >
                                    →
                                </span>
                            </button>
                        </div>
                    </div>
                );
            })}

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
                            ? "Excelente. Transformas la información de manera clara, precisa y eficaz."
                            : grade.quality === "partial"
                            ? "Mejoras parcialmente la representación de la información. Revisa la pregunta que falló."
                            : "Revisa qué tipo de representación comunica mejor cada tipo de información, y qué actitud conviene frente a una sugerencia automática."}
                    </p>
                </div>
            )}
        </section>
    );
});

IntegrationExerciseI3Represent.displayName = "IntegrationExerciseI3Represent";

export default IntegrationExerciseI3Represent;