"use client";

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";

export type IntegrationExerciseI1ResponsibleHandle = {
    check: (opts?: { silent?: boolean }) => boolean;
    isReady: () => boolean;
    reset: () => void;
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
    seed?: number;
};

type DimensionId =
    | "transparency"
    | "techSelection"
    | "validation"
    | "adaptation";

const DIMENSION_ORDER: DimensionId[] = [
    "transparency",
    "techSelection",
    "validation",
    "adaptation",
];

const CHECKBOX_LABELS: Record<DimensionId, string> = {
    transparency:
        "La publicación reconoce si el contenido fue generado o editado con herramientas inteligentes.",

    techSelection:
        "Se puede identificar qué plataforma o programa se usó para construir la publicación, más allá de si es o no una IA.",

    validation:
        "La información presentada cuenta con elementos que respaldan su confiabilidad.",

    adaptation:
        "La forma en que se comunica el contenido facilita su comprensión por el público al que está dirigido.",
};

type PostFormat = "instagram" | "poster";

type PostTheme = {
    id: string;
    format: PostFormat;
    account: string;
    accentBg: string;
    accentText: string;
    icon: string;
    contentIcon: string;
    headline: string;
    subtext: string;
    visual: "bins" | "checklist" | "icon-only";
    checklistItems?: string[];
};

type Clue = {
    id: string;
    icon: string;
    text: string;

    // Una pista puede representar una o más dimensiones
    dimensions: DimensionId[];

    // En qué publicaciones puede aparecer
    themes: string[];
};

const POST_THEMES: PostTheme[] = [
    {
        id: "recycling",
        format: "instagram",
        account: "colegio.oficial",
        accentBg: "bg-emerald-100",
        accentText: "text-emerald-700",
        icon: "♻️",
        contentIcon: "♻️",
        headline: "Separa correctamente tus residuos",
        subtext:
            "Cada pequeño cambio ayuda a mantener nuestro colegio más limpio.",
        visual: "bins",
    },

    {
        id: "passwords",
        format: "instagram",
        account: "convivencia.digital",
        accentBg: "bg-sky-100",
        accentText: "text-sky-700",
        icon: "🔒",
        contentIcon: "🔑",
        headline: "Crea contraseñas seguras",
        subtext:
            "Utiliza contraseñas difíciles de adivinar para proteger tus cuentas.",
        visual: "checklist",
        checklistItems: [
            "Mínimo 10 caracteres",
            "Combina letras, números y símbolos",
        ],
    },

    {
        id: "wellbeing",
        format: "instagram",
        account: "centro.estudiantes",
        accentBg: "bg-violet-100",
        accentText: "text-violet-700",
        icon: "🙂",
        contentIcon: "📵",
        headline: "Haz una pausa entre clases",
        subtext:
            "Pequeños descansos ayudan a reducir la fatiga visual.",
        visual: "icon-only",
    },
];

const CLUE_BANK: Clue[] = [
    {
        id: "c1",
        icon: "🏷️",
        text: "Se reconoce abiertamente que algunas ilustraciones fueron creadas con inteligencia artificial.",
        dimensions: ["transparency"],
        themes: ["recycling", "wellbeing"],
    },

    {
        id: "c2",
        icon: "🏷️",
        text: "Se indica que parte del contenido fue generado con IA y posteriormente revisado por el equipo del colegio.",
        dimensions: ["transparency", "validation"],
        themes: ["recycling", "passwords", "wellbeing"],
    },

    {
        id: "c3",
        icon: "🛠️",
        text: "Se utilizó una plataforma especializada para elaborar este material gráfico.",
        dimensions: ["techSelection"],
        themes: ["recycling", "passwords", "wellbeing"],
    },

    {
        id: "c4",
        icon: "🛠️",
        text: "Se eligió una herramienta que facilita crear material visual para estudiantes.",
        dimensions: ["techSelection", "adaptation"],
        themes: ["recycling", "passwords", "wellbeing"],
    },

    {
        id: "c5",
        icon: "📚",
        text: "La información fue revisada por profesionales del establecimiento.",
        dimensions: ["validation"],
        themes: ["recycling", "passwords", "wellbeing"],
    },

    {
        id: "c6",
        icon: "📚",
        text: "Las recomendaciones fueron revisadas y adaptadas antes de ser publicadas.",
        dimensions: ["validation", "adaptation"],
        themes: ["recycling", "passwords", "wellbeing"],
    },

    {
        id: "c7",
        icon: "🎨",
        text: "Se utilizan ejemplos cercanos a la realidad de estudiantes.",
        dimensions: ["adaptation"],
        themes: ["passwords", "wellbeing"],
    },

    {
        id: "c8",
        icon: "🎨",
        text: "Se emplean íconos y frases breves para facilitar la comprensión.",
        dimensions: ["adaptation"],
        themes: ["recycling", "wellbeing"],
    },

    {
        id: "c9",
        icon: "📝",
        text: "Se distingue qué contenido fue creado automáticamente y cuál fue editado por personas.",
        dimensions: ["transparency"],
        themes: ["passwords", "wellbeing"],
    },

    {
        id: "c10",
        icon: "📋",
        text: "El equipo seleccionó recursos digitales adecuados para elaborar la publicación.",
        dimensions: ["techSelection"],
        themes: ["recycling", "passwords"],
    },

    {
        id: "c11",
        icon: "🏷️",
        text: "El contenido fue creado con ayuda de una IA y luego ajustado al público del colegio.",
        dimensions: ["transparency", "adaptation"],
        themes: ["recycling", "passwords", "wellbeing"],
    },

    {
        id: "c12",
        icon: "🛠️",
        text: "La herramienta utilizada permitió comprobar la información antes de publicarla.",
        dimensions: ["techSelection", "validation"],
        themes: ["recycling", "passwords", "wellbeing"],
    },
];

// Se mantienen las 6 combinaciones por ahora.
// Más adelante podemos hacer que el número de dimensiones ausentes sea variable.
const MISSING_PAIRS: [DimensionId, DimensionId][] = [
    ["transparency", "techSelection"],
    ["transparency", "validation"],
    ["transparency", "adaptation"],
    ["techSelection", "validation"],
    ["techSelection", "adaptation"],
    ["validation", "adaptation"],
];

function shuffle<T>(items: ReadonlyArray<T>, seed = Math.random()) {
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

function pickCase(seed?: number) {
    const theme = shuffle(POST_THEMES, seed)[0];

    const missing =
        shuffle(
            MISSING_PAIRS,
            seed === undefined ? undefined : seed + 0.37
        )[0];

    const present = DIMENSION_ORDER.filter(
        (d) => !missing.includes(d)
    );

    // Pistas que NO contienen dimensiones ausentes.
    const validPool = CLUE_BANK.filter((clue) => {
        if (!clue.themes.includes(theme.id)) return false;

        return clue.dimensions.every((d) => present.includes(d));
    });

    const pool = shuffle(
        validPool,
        seed === undefined ? undefined : seed + 0.61
    );

    // Paso 1-3: elegir pistas priorizando cubrir TODAS las dimensiones presentes
    // (evita depender de cuántas pistas haya disponibles al azar).
    const covered = new Set<DimensionId>();
    const selected: Clue[] = [];

    for (const clue of pool) {
        if (covered.size >= present.length) break;
        if (clue.dimensions.some((d) => !covered.has(d))) {
            selected.push(clue);
            clue.dimensions.forEach((d) => covered.add(d));
        }
    }

    // Paso 4: si la cobertura se logró con pocas pistas, agregar redundantes
    // del mismo pool hasta llegar a un mínimo de 3 (tope de 4), para que la
    // dificultad no dependa de cuántas dimensiones había que cubrir.
    const MIN_CLUES = 2;
    const MAX_CLUES = 2;

    for (const clue of pool) {
        if (selected.length >= MIN_CLUES) break;
        if (!selected.includes(clue)) selected.push(clue);
    }

    const finalCount = Math.min(MAX_CLUES, selected.length);
    const clues = selected.slice(0, finalCount);

    return {
        theme,
        missing,
        clues,
    };
}

const IntegrationExerciseI1Responsible = forwardRef<
    IntegrationExerciseI1ResponsibleHandle,
    Props
>(function IntegrationExerciseI1Responsible(
    { onEvaluate, onReadyChange, seed },
    ref
) {
    const { theme, missing, clues } = useMemo(
        () => pickCase(seed),
        [seed]
    );
    const [selected, setSelected] = useState<
        Record<DimensionId, boolean>
    >({
        transparency: false,
        techSelection: false,
        validation: false,
        adaptation: false,
    });
    const [feedback, setFeedback] = useState<{
        kind: "idle" | "success" | "warning" | "error";
        message?: string;
    }>({
        kind: "idle",
    });
    const chosen = useMemo(
        () =>
            DIMENSION_ORDER.filter(
                (d) => selected[d]
            ),
        [selected]
    );
    // Ya no exigimos seleccionar exactamente 2.
    // Basta con haber seleccionado al menos una alternativa.
    const isReady = chosen.length > 0;
    useEffect(() => {
        onReadyChange?.(isReady);
    }, [isReady, onReadyChange]);
    function toggle(id: DimensionId) {
        setSelected((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
        setFeedback({
            kind: "idle",
        });
    }
    function score() {
        const correctSelections =
            missing.filter((d) =>
                chosen.includes(d)
            ).length;

        // 1 punto por cada correcta marcada (no se resta por marcar una
        // incorrecta). Solo se penaliza si en total marcó más de 2
        // alternativas (independiente de si son correctas o no).
        let points = correctSelections;

        if (chosen.length > 2) {
            const extra = chosen.length - 2;
            points = Math.max(0, points - extra);
        }

        return points;
    }
    function evaluate(opts?: { silent?: boolean }) {
        const result = score();
        const ok = result === 2;
        if (opts?.silent) {
            onEvaluate?.(ok ? 1 : 0);
            return ok;
        }
        if (ok) {
            setFeedback({
                kind: "success",
                message:
                    "Excelente. Identificaste correctamente las 2 prácticas que no se evidencian en la publicación.",
            });
            onEvaluate?.(1);
        } else if (result === 1) {
            setFeedback({
                kind: "warning",
                message:
                    "Identificaste 1 de las 2 prácticas que no se evidencian. Revisa nuevamente las pistas para encontrar la que falta.",
            });
            onEvaluate?.(0);
        } else {
            setFeedback({
                kind: "error",
                message:
                    "Revisa nuevamente las pistas disponibles: ¿qué prácticas de integración responsable no se evidencian en esta publicación?",
            });
            onEvaluate?.(0);
        }
        return ok;
    }
    useImperativeHandle(
        ref,
        () => ({
            check: evaluate,
            isReady: () => isReady,
            reset: () => {
                setSelected({
                    transparency: false,
                    techSelection: false,
                    validation: false,
                    adaptation: false,
                });
                setFeedback({
                    kind: "idle",
                });
                onEvaluate?.(0);
                onReadyChange?.(false);
            },
        })
    );

    return (
        <section className="space-y-5">
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-white shadow-sm">

                {/* Header */}

                <div className="flex items-center gap-2 border-b px-3.5 py-2.5">
                    <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${theme.accentBg}`}
                    >
                        {theme.icon}
                    </div>

                    <span className="text-xs font-semibold text-slate-700">
                        {theme.format === "instagram"
                            ? theme.account
                            : `Afiche · ${theme.account}`}
                    </span>
                </div>

                {/* Contenido */}

                <div className="relative flex aspect-square flex-col items-center justify-center gap-3 bg-slate-100 px-6 py-6">

                    {theme.format === "instagram" && (
                        <span
                            className="absolute right-2 top-1/2 flex h-7 w-5 -translate-y-1/2 items-center justify-end text-2xl font-bold leading-none"
                            style={{ color: "#286575" }}
                        >
                            ›
                        </span>
                    )}

                    {theme.format === "instagram" && (
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/30 to-transparent py-3">
                            <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: "#286575" }}
                            />
                            <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: "#286575" }}
                            />
                            <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: "#286575" }}
                            />
                        </div>
                    )}

                    {theme.visual === "bins" && (
                        <div className="flex items-end gap-3">
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className="flex h-16 w-12 items-center justify-center bg-amber-500 text-lg"
                                    style={{
                                        borderRadius: "4px 4px 10px 10px",
                                    }}
                                >
                                    📄
                                </div>
                                <span className="text-[10px] text-slate-500">
                                    Papel
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className="flex h-16 w-12 items-center justify-center bg-blue-500 text-lg"
                                    style={{
                                        borderRadius: "4px 4px 10px 10px",
                                    }}
                                >
                                    🥤
                                </div>
                                <span className="text-[10px] text-slate-500">
                                    Plástico
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className="flex h-16 w-12 items-center justify-center bg-emerald-500 text-lg"
                                    style={{
                                        borderRadius: "4px 4px 10px 10px",
                                    }}
                                >
                                    🍌
                                </div>
                                <span className="text-[10px] text-slate-500">
                                    Orgánico
                                </span>
                            </div>
                        </div>
                    )}

                    {theme.visual === "checklist" && (
                        <span className="text-4xl">
                            {theme.contentIcon}
                        </span>
                    )}

                    {theme.visual === "icon-only" && (
                        <span className="text-4xl">
                            {theme.contentIcon}
                        </span>
                    )}

                    <p className="text-center text-base font-semibold text-slate-800">
                        {theme.headline}
                    </p>

                    {theme.visual === "checklist" &&
                        theme.checklistItems && (
                            <div className="flex w-full flex-col gap-1.5">
                                {theme.checklistItems.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5"
                                    >
                                        <span className="text-xs text-emerald-600">
                                            ✓
                                        </span>

                                        <span className="text-xs text-slate-700">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                    {theme.visual !== "checklist" && (
                        <p className="text-center text-xs leading-relaxed text-slate-500">
                            {theme.subtext}
                        </p>
                    )}
                </div>


                {/* Evidencias */}

                <div className="space-y-2 border-t px-3.5 py-3">

                    <p className="ml-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Dentro del {theme.format === "instagram" ? "post" : "afiche"}:
                    </p>

                    {clues.map((clue) => (

                        <div
                            key={clue.id}
                            className="flex items-start gap-2"
                        >

                            <span
                                className="mt-0.5 shrink-0 text-sm"
                                style={{ marginLeft: "10px" }}
                            >
                                {clue.icon}
                            </span>

                            <p className="text-xs leading-relaxed text-slate-600">
                                {clue.text}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

            {/* Alternativas */}

            <div className="rounded-2xl border bg-white p-4 shadow-sm">

                <h4 className="font-semibold text-slate-800">
                    Selecciona todas las prácticas de integración responsable que NO se evidencian.
                </h4>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">

                    {DIMENSION_ORDER.map((dim) => {

                        const isPicked = selected[dim];

                        return (

                            <label
                                key={dim}
                                className={`flex cursor-pointer select-none items-center gap-3 rounded-2xl border p-3 text-sm transition ${
                                    isPicked
                                        ? "border-[#286575] bg-[#e4f3f5] ring-2 ring-[#286575]/20"
                                        : "border-slate-200 bg-white hover:border-[#286575]/40 hover:shadow-sm"
                                }`}
                            >

                                <input
                                    type="checkbox"
                                    checked={isPicked}
                                    onChange={() => toggle(dim)}
                                    className="h-5 w-5 shrink-0 rounded accent-[#286575]"
                                />

                                <span className="font-medium leading-relaxed text-slate-800">
                                    {CHECKBOX_LABELS[dim]}
                                </span>

                            </label>

                        );

                    })}

                </div>

            </div>

            {/* Feedback */}

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

                    <p className="font-semibold">
                        Puntaje: {score()}/2
                    </p>

                    <p className="mt-1">
                        {feedback.message}
                    </p>

                </div>

            )}

        </section>
    );
});

IntegrationExerciseI1Responsible.displayName = "IntegrationExerciseI1Responsible";

export default IntegrationExerciseI1Responsible;