"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type DevelopExerciseI3Handle = {
    check: (opts?: { silent?: boolean }) => boolean;
    isReady: () => boolean;
    reset: () => void;
};

type Option = {
    id: string;
    label: string;
    isCorrect: boolean;
};

type Scenario = {
    id: string;
    title: string;
    description: string;
    options: Option[];
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
    seed?: number;
};

const SCENARIOS: ReadonlyArray<Scenario> = [
    {
        id: "presentation-diverse",
        title: "Presentación para un curso mixto",
        description:
            "Vas a compartir una presentación sobre ciudadanía digital con un curso que la revisará desde computadores, tablets y una proyección en sala.",
        options: [
            { id: "p-contrast", label: "Probar una diapositiva en fondo claro y oscuro para comprobar si los elementos principales siguen siendo legibles", isCorrect: true },
            { id: "p-alt", label: "Agregar una nota breve para explicar una imagen que contiene información necesaria para entender el tema", isCorrect: true },
            { id: "p-condense", label: "Unir dos ideas relacionadas en una misma diapositiva para que la exposición avance con menos cambios de pantalla", isCorrect: false },
            { id: "p-template", label: "Aceptar una plantilla automática si conserva una jerarquía visual consistente entre título, ejemplo y cierre", isCorrect: true },
        ],
    },
    {
        id: "video-lesson",
        title: "Video educativo breve",
        description:
            "Grabaste un video explicativo para una clase y una herramienta de edición te ofrece subtítulos automáticos, recorte de pausas y ajustes de sonido.",
        options: [
            { id: "v-check-captions", label: "Revisar los subtítulos automáticos cuando aparecen nombres propios, tecnicismos o palabras poco comunes", isCorrect: true },
            { id: "v-audio", label: "Bajar la música de fondo si compite con la explicación principal", isCorrect: true },
            { id: "v-fast", label: "Acelerar las partes explicativas donde no hay imágenes nuevas para reducir la duración total", isCorrect: false },
            { id: "v-summary", label: "Incluir una descripción breve del contenido cuando el video se comparte fuera de la plataforma de la clase", isCorrect: true },
        ],
    },
    {
        id: "infographic",
        title: "Infografía digital",
        description:
            "Terminaste una infografía sobre seguridad en internet. Tiene datos, íconos, colores por categoría y un bloque final con recomendaciones.",
        options: [
            { id: "i-color", label: "Añadir una etiqueta o símbolo cuando el color por sí solo diferencia una categoría", isCorrect: true },
            { id: "i-hierarchy", label: "Reordenar los bloques para que el dato central aparezca antes que los detalles secundarios", isCorrect: true },
            { id: "i-decorative", label: "Agregar íconos decorativos junto a cada bloque para hacer más reconocible el recorrido de lectura", isCorrect: false },
            { id: "i-alt", label: "Preparar una descripción del gráfico si sus datos no están explicados en el texto cercano", isCorrect: true },
        ],
    },
    {
        id: "step-guide",
        title: "Guía paso a paso",
        description:
            "Estás creando una guía digital para configurar una cuenta segura en una plataforma. Incluye capturas, botones de la interfaz y decisiones que el usuario debe tomar.",
        options: [
            { id: "g-steps", label: "Separar acciones y decisiones en pasos distintos cuando requieren atención diferente", isCorrect: true },
            { id: "g-images", label: "Explicar una captura si muestra un botón o ajuste necesario para completar el proceso", isCorrect: true },
            { id: "g-icons-only", label: "Usar solo el ícono del botón cuando es reconocible, para evitar repetir instrucciones obvias", isCorrect: false },
            { id: "g-review", label: "Pedir a otra persona que siga la guía sin ayuda antes de publicarla", isCorrect: true },
        ],
    },
    {
        id: "web-post",
        title: "Publicación web",
        description:
            "Debes subir una publicación al sitio del curso. El contenido combina una imagen principal, dos enlaces externos y una explicación breve.",
        options: [
            { id: "w-links", label: "Nombrar los enlaces por su destino o acción, no solo con frases como 'ver aquí'", isCorrect: true },
            { id: "w-alt", label: "Describir la imagen principal si aporta información que no aparece en el texto", isCorrect: true },
            { id: "w-image-only", label: "Convertir la explicación en una imagen única para mantener el diseño igual en todos los dispositivos", isCorrect: false },
            { id: "w-check", label: "Revisar una alerta automática de accesibilidad aunque la publicación se vea correcta en pantalla", isCorrect: true },
        ],
    },
    {
        id: "poster",
        title: "Afiche para campaña escolar",
        description:
            "Preparas un afiche digital para una campaña de convivencia. La herramienta sugiere colores, tipografías, imágenes y una versión con más efectos visuales.",
        options: [
            { id: "a-contrast", label: "Verificar que el llamado principal se distinga también en una vista previa pequeña", isCorrect: true },
            { id: "a-font", label: "Mantener una tipografía decorativa en el título si el resto del texto usa una fuente simple", isCorrect: false },
            { id: "a-alt", label: "Preparar una descripción si el afiche se compartirá como imagen en un canal digital", isCorrect: true },
            { id: "a-review", label: "Ajustar una sugerencia automática cuando el estilo se aleja del público de la campaña", isCorrect: true },
        ],
    },
    {
        id: "audio-guide",
        title: "Cápsula de audio",
        description:
            "Estás editando una cápsula de audio para explicar un tema del curso. La plataforma permite agregar portada, descripción y una transcripción generada automáticamente.",
        options: [
            { id: "au-transcript", label: "Revisar la transcripción antes de publicarla si incluye nombres, cifras o términos técnicos", isCorrect: true },
            { id: "au-cover", label: "Usar una portada llamativa como reemplazo de la descripción cuando el título ya resume el tema", isCorrect: false },
            { id: "au-noise", label: "Reducir ruido de fondo si dificulta distinguir algunas palabras", isCorrect: true },
            { id: "au-speed", label: "Aumentar la velocidad del audio si mantiene una duración más conveniente para la actividad", isCorrect: false },
        ],
    },
    {
        id: "collaborative-doc",
        title: "Documento colaborativo",
        description:
            "Un grupo está editando una pauta digital con comentarios, tablas y fragmentos aportados por varias personas antes de entregarla al curso.",
        options: [
            { id: "d-comments", label: "Resolver comentarios solo cuando el cambio queda integrado o se justifica por qué no corresponde", isCorrect: true },
            { id: "d-table", label: "Mantener una tabla si permite comparar datos con menos texto que una explicación larga", isCorrect: true },
            { id: "d-version", label: "Revisar el historial de cambios si una edición altera el sentido de una sección acordada", isCorrect: true },
            { id: "d-summary", label: "Agregar un cierre breve que conecte los aportes principales antes de compartir el documento", isCorrect: true },
        ],
    },
    {
        id: "event-map",
        title: "Mapa para una actividad",
        description:
            "Diseñas una imagen con el mapa de salas para una actividad escolar. Incluye colores por zona, flechas, nombres de espacios y un horario reducido.",
        options: [
            { id: "m-labels", label: "Acompañar los colores de zona con nombres o símbolos dentro del mapa", isCorrect: true },
            { id: "m-arrows", label: "Dejar solo flechas grandes si el recorrido es corto y visualmente evidente", isCorrect: false },
            { id: "m-schedule", label: "Mantener el horario como texto editable si se publicará junto al mapa en la página", isCorrect: true },
            { id: "m-test", label: "Pedir a alguien que ubique una sala usando solo la imagen antes de publicarla", isCorrect: true },
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

const DevelopExerciseI3 = forwardRef<DevelopExerciseI3Handle, Props>(
    function DevelopExerciseI3({ onEvaluate, onReadyChange, seed }, ref) {
        const scenario = useMemo(() => pickScenario(seed), [seed]);
        const options = useMemo(() => shuffle(scenario.options, seed), [scenario, seed]);
        const [selected, setSelected] = useState<Record<string, boolean>>({});
        const [feedback, setFeedback] = useState<{
            kind: "idle" | "success" | "warning" | "error";
            message?: string;
            score?: number;
        }>({ kind: "idle" });

        const chosen = useMemo(
            () =>
                Object.entries(selected)
                    .filter(([, value]) => value)
                    .map(([id]) => id),
            [selected]
        );

        useEffect(() => {
            onReadyChange?.(chosen.length > 0);
        }, [chosen, onReadyChange]);

        const correctIds = useMemo(
            () => options.filter((option) => option.isCorrect).map((option) => option.id),
            [options]
        );
        const wrongIds = useMemo(
            () => options.filter((option) => !option.isCorrect).map((option) => option.id),
            [options]
        );

        function toggle(id: string) {
            setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
            setFeedback({ kind: "idle" });
        }

        function calculateScore() {
            const correctPicked = correctIds.filter((id) => chosen.includes(id)).length;
            const wrongPicked = wrongIds.filter((id) => chosen.includes(id)).length;
            const missingCorrect = correctIds.length - correctPicked;

            if (missingCorrect === 0 && wrongPicked === 0) return 4;
            if (correctPicked >= Math.max(2, correctIds.length - 1) && wrongPicked <= 1) return 3;
            if (correctPicked >= 2 && wrongPicked <= 1) return 2;
            if (correctPicked >= 1 && wrongPicked === 0) return 1;

            return 0;
        }

        function evaluate(opts?: { silent?: boolean }) {
            const missing = correctIds.filter((id) => !chosen.includes(id));
            const wrong = wrongIds.filter((id) => chosen.includes(id));
            const correctPicked = correctIds.length - missing.length;
            const score = calculateScore();
            // Aprueba con al menos 1 opción correcta marcada y ninguna incorrecta
            // (no exige marcar absolutamente todas las correctas).
            const ok = correctPicked >= 1 && wrong.length === 0;

            if (opts?.silent) {
                onEvaluate?.(ok ? 1 : 0);
                return ok;
            }

            if (ok) {
                setFeedback({
                    kind: "success",
                    score,
                    message:
                        "Excelente. Seleccionaste ajustes adecuados de accesibilidad, inclusión y revisión crítica.",
                });
                onEvaluate?.(1);
            } else if (score >= 3) {
                setFeedback({
                    kind: "warning",
                    score,
                    message:
                        "Vas bien. Revisa si faltó algún ajuste importante o si marcaste una mejora que no funciona igual para todas las personas.",
                });
                onEvaluate?.(0);
            } else {
                setFeedback({
                    kind: "error",
                    score,
                    message:
                        "Revisa qué acciones ayudan a que más personas comprendan, usen o revisen el contenido sin depender solo de una apariencia ordenada.",
                });
                onEvaluate?.(0);
            }

            return ok;
        }

        useImperativeHandle(ref, () => ({
            check: evaluate,
            isReady: () => chosen.length > 0,
            reset: () => {
                setSelected({});
                setFeedback({ kind: "idle" });
                onEvaluate?.(0);
                onReadyChange?.(false);
            },
        }));

        return (
            <section className="space-y-5">
                <div className="rounded-2xl border bg-white p-4 shadow">
                    <h3 className="font-semibold text-slate-800">{scenario.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {scenario.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {options.map((option) => {
                        const isChecked = !!selected[option.id];

                        return (
                            <label
                                key={option.id}
                                className={`flex min-h-[92px] cursor-pointer select-none items-start gap-3 rounded-2xl border p-4 shadow-sm transition-all ${
                                    isChecked
                                        ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                        : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-md"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-1 h-5 w-5 shrink-0 rounded accent-[#286575]"
                                    checked={isChecked}
                                    onChange={() => toggle(option.id)}
                                />
                                <span className="text-sm font-medium leading-relaxed text-slate-800">
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
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

DevelopExerciseI3.displayName = "DevelopExerciseI3";

export default DevelopExerciseI3;