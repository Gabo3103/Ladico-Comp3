"use client";

import React, {
    forwardRef,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

export type DevelopExerciseI2SequenceHandle = {
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

    // ===== Banco de escenarios =====
    const BANK: Scenario[] = [
    {
        id: "S_VIDEO",
        title: "Caso: Crear un video para redes sociales",
        description: "",
        steps: [
        { id: "v1", text: "Definir objetivo, duración y formato (vertical/horizontal)" },
        { id: "v2", text: "Grabar o preparar clips e imágenes" },
        { id: "v3", text: "Editar (cortes, títulos, música, subtítulos)" },
        { id: "v4", text: "Exportar a .mp4 con compresión adecuada" },
        { id: "v5", text: "Publicar en la plataforma destino" },
        ],
    },
    {
        id: "S_PRESENT",
        title: "Caso: Crear una presentación para clase",
        description: "",
        steps: [
        { id: "p1", text: "Definir esquema de contenidos y público objetivo" },
        { id: "p2", text: "Diseñar diapositivas (texto breve, imágenes, gráficos)" },
        { id: "p3", text: "Ensayar, ajustar tiempos y contenido" },
        { id: "p4", text: "Exportar a .pptx o .pdf según necesidad" },
        { id: "p5", text: "Compartir/Presentar en el aula o plataforma" },
        ],
    },
    {
        id: "S_INFORME",
        title: "Caso: Crear un informe escrito",
        description: "",
        steps: [
        { id: "i1", text: "Definir estructura (portada, índice, secciones)" },
        { id: "i2", text: "Redactar y dar formato (estilos, tablas, citas)" },
        { id: "i3", text: "Revisar ortografía y coherencia" },
        { id: "i4", text: "Exportar/guardar como .pdf para distribución" },
        { id: "i5", text: "Compartir con destinatarios" },
        ],
    },
    {
        id: "S_INFOG",
        title: "Caso: Crear una infografía (Canva u otra herramienta)",
        description: "",
        steps: [
        { id: "c1", text: "Definir tema y datos clave" },
        { id: "c2", text: "Elegir plantilla/tamaño y paleta de colores" },
        { id: "c3", text: "Diseñar: iconos, tipografías y jerarquía visual" },
        { id: "c4", text: "Exportar a .png/.jpg (o .pdf para impresión)" },
        { id: "c5", text: "Publicar o incrustar en la plataforma" },
        ],
    },
    ];

    function shuffle<T>(arr: T[], seed = Math.random()): T[] {
    let s = Math.floor((seed * 1e9) % 2 ** 31);
    const a = 1103515245, c = 12345, m = 2 ** 31;
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        s = (a * s + c) % m;
        const j = s % (i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
    }

    const DND_TYPE = "application/ladico-seq-step";

    // ===== Core de cada escenario =====
    const DevelopExerciseI2SequenceCore = forwardRef<
    { check: () => boolean },
    { scenario: Scenario; onEvaluate?: (point: 0 | 1) => void }
    >(function DevelopExerciseI2SequenceCore({ scenario, onEvaluate }, ref) {
    const initial = useMemo(
        () => shuffle(scenario.steps, Math.random()),
        [scenario.id]
    );
    const [order, setOrder] = useState<Step[]>(initial);
    const [dragId, setDragId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<null | { ok: boolean; msg: string }>(null);

    const isCorrect = (arr: Step[]) =>
        arr.map(s => s.id).join("|") === scenario.steps.map(s => s.id).join("|");

    const onDragStart = (id: string, e: React.DragEvent) => {
        setDragId(id);
        e.dataTransfer.setData(DND_TYPE, id);
        e.dataTransfer.effectAllowed = "move";
    };
    const onDragOver = (e: React.DragEvent) => {
        if (e.dataTransfer.types.includes(DND_TYPE)) e.preventDefault();
    };
    const onDropOn = (targetId: string) => {
        if (!dragId || dragId === targetId) return;
        const cur = [...order];
        const from = cur.findIndex(s => s.id === dragId);
        const to = cur.findIndex(s => s.id === targetId);
        const [moved] = cur.splice(from, 1);
        cur.splice(to, 0, moved);
        setOrder(cur);
        setFeedback(null);
        setDragId(null);
    };

    // Accesibilidad ↑↓
    const move = (idx: number, dir: -1 | 1) => {
        const to = idx + dir;
        if (to < 0 || to >= order.length) return;
        const cur = [...order];
        const [m] = cur.splice(idx, 1);
        cur.splice(to, 0, m);
        setOrder(cur);
        setFeedback(null);
    };

    const check = () => {
        const ok = isCorrect(order);
        setFeedback({
        ok,
        msg: ok
            ? "✅ ¡Excelente! La secuencia es correcta."
            : "❌ Revisa el orden. Tip: piensa en planificación → producción → exportación/compartir.",
        });
        onEvaluate?.(ok ? 1 : 0);
        return ok;
    };

    useImperativeHandle(ref, () => ({ check }));

    return (
        <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-4 shadow">
            <h3 className="font-semibold text-slate-800">{scenario.title}</h3>
            <p className="text-sm text-slate-600">{scenario.description}</p>
        </div>

        <ol className="space-y-3">
            {order.map((s, idx) => (
            <li
                key={s.id}
                className="flex items-center gap-3 rounded-2xl border p-3 bg-white shadow hover:shadow-lg transition"
                draggable
                onDragStart={(e) => onDragStart(s.id, e)}
                onDragOver={onDragOver}
                onDrop={() => onDropOn(s.id)}
            >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#286575] text-white font-semibold">
                {idx + 1}
                </span>

                <div className="flex-1 text-slate-800">{s.text}</div>

                <div className="flex items-center gap-1">
                <button
                    type="button"
                    className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50"
                    onClick={() => move(idx, -1)}
                    aria-label="Subir"
                >
                    ↑
                </button>
                <button
                    type="button"
                    className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50"
                    onClick={() => move(idx, 1)}
                    aria-label="Bajar"
                >
                    ↓
                </button>
                </div>
            </li>
            ))}
        </ol>

        {feedback && (
            <div
            className={`rounded-xl px-4 py-3 text-sm shadow ${
                feedback.ok
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
            >
            {feedback.msg}
            </div>
        )}
        </div>
    );
    });

    // ===== Selector principal =====
    function pickScenarios(count: number, seed?: number): Scenario[] {
    const n = Math.max(1, Math.min(count, BANK.length));
    return shuffle([...BANK], seed).slice(0, n);
    }

    const DevelopExerciseI2Sequence = forwardRef<DevelopExerciseI2SequenceHandle, Props>(
    function DevelopExerciseI2Sequence({ onEvaluate, countScenarios = 1, seed }, ref) {
        const scenarios = useMemo(() => pickScenarios(countScenarios, seed), [countScenarios, seed]);
        const [scores, setScores] = useState<Record<string, 0 | 1>>({});
        const scenarioRefs = useRef<Record<string, { check: () => boolean }>>({});

        useImperativeHandle(ref, () => ({
        check: () => {
            let allOk = true;
            scenarios.forEach((sc) => {
            const refCore = scenarioRefs.current[sc.id];
            if (refCore) {
                const ok = refCore.check();
                if (!ok) allOk = false;
                setScores((prev) => ({ ...prev, [sc.id]: ok ? 1 : 0 }));
            }
            });
            onEvaluate?.(allOk ? 1 : 0);
            return allOk;
        },
        isReady: () => true,
        reset: () => {
            setScores({});
            onEvaluate?.(0);
        },
        }));

        return (
        <div className="space-y-8">
            {scenarios.map((sc) => (
            <DevelopExerciseI2SequenceCore
                key={sc.id}
                scenario={sc}
                ref={(el) => {
                if (el) scenarioRefs.current[sc.id] = el;
                }}
                onEvaluate={(pt) =>
                setScores((prev) => ({ ...prev, [sc.id]: pt }))
                }
            />
            ))}
        </div>
        );
    }
);

export default DevelopExerciseI2Sequence;
