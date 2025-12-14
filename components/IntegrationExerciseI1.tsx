"use client";

import React,
{
    forwardRef,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

export type IntegrationExerciseI1Handle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
    };

    type GoalMark =
    | { kind: "underline"; text: string }
    | { kind: "italic"; text: string }
    | { kind: "bold"; text: string }
    | { kind: "color"; text: string; color: string };

    type Scenario = {
    id: string;
    title: string;
    description: string;
    initialText: string;
    requiredFontFamily?: string;
    requiredFontSizePx?: number;
    marks: GoalMark[];
    };

    type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    seed?: number;
    };

    // ===== Banco ORIGINAL de escenarios =====
    const BANK: Scenario[] = [
    {
        id: "S1",
        title: "Formato y estilo en un comunicado",
        description:
        "Aplica Arial 24 px al texto. Subraya el nombre “Meryem”. Pon la fecha “25/02/1993” en cursiva.",
        initialText: "Meryem nació en Estambul el 25/02/1993.",
        requiredFontFamily: "Arial",
        requiredFontSizePx: 24,
        marks: [
        { kind: "underline", text: "Meryem" },
        { kind: "italic", text: "25/02/1993" },
        ],
    },
    {
        id: "S2",
        title: "Resaltar lugar y fecha en una nota breve",
        description:
        "Usa Times New Roman 20 px. “Santiago” en negrita. “12-03-2024” en cursiva.",
        initialText: "La ceremonia principal será en Santiago el 12-03-2024.",
        requiredFontFamily: "Times New Roman",
        requiredFontSizePx: 20,
        marks: [
        { kind: "bold", text: "Santiago" },
        { kind: "italic", text: "12-03-2024" },
        ],
    },
    {
        id: "S3",
        title: "Mini perfil académico",
        description:
        "Poppins 18 px. Subraya “Camila”. Pon “PhD” en negrita.",
        initialText:
        "Camila Martínez, PhD en Ciencias de la Computación.",
        requiredFontFamily: "Poppins",
        requiredFontSizePx: 18,
        marks: [
        { kind: "underline", text: "Camila" },
        { kind: "bold", text: "PhD" },
        ],
    },
    {
        id: "S4",
        title: "Nota técnica con énfasis de color",
        description:
        "Courier New 16 px. Colorea “array” en verde. Pon “índice” en cursiva.",
        initialText:
        "Accede al array en el índice dado para obtener el valor.",
        requiredFontFamily: "Courier New",
        requiredFontSizePx: 16,
        marks: [
        { kind: "color", text: "array", color: "#16a34a" },
        { kind: "italic", text: "índice" },
        ],
    },
    ];

    const FONT_CHOICES = ["Poppins", "Arial", "Times New Roman", "Courier New"] as const;
    const SIZE_CHOICES = [16, 18, 20, 24, 28] as const;

    const COLOR_CHOICES = [
    { value: "#111827", label: "Texto base" },
    { value: "#0f766e", label: "Verde" },
    { value: "#dc2626", label: "Rojo" },
    ] as const;

    // === utils originales ===
    function pickOne<T>(arr: readonly T[], seed = Math.random()): T {
    const i = Math.floor(seed * arr.length) % arr.length;
    return arr[i];
    }
    function normalizeHtml(html: string) {
    return html.replace(/\s+/g, " ").trim();
    }
    function containsMark(html: string, m: GoalMark) {
    const nhtml = normalizeHtml(html).toLowerCase();
    const needle = m.text.toLowerCase();

    if (m.kind === "underline") {
        return (
        nhtml.includes("<u>" + needle + "</u>") ||
        nhtml.includes("text-decoration: underline")
        );
    }
    if (m.kind === "italic") {
        return (
        nhtml.includes("<i>" + needle + "</i>") ||
        nhtml.includes("<em>" + needle + "</em>") ||
        nhtml.includes("font-style: italic")
        );
    }
    if (m.kind === "bold") {
        return (
        nhtml.includes("<b>" + needle + "</b>") ||
        nhtml.includes("<strong>" + needle + "</strong>") ||
        nhtml.includes("font-weight: bold")
        );
    }
    if (m.kind === "color") {
        return (
        nhtml.includes(`color:${m.color.toLowerCase()}`) ||
        nhtml.includes(`color: ${m.color.toLowerCase()}`)
        );
    }
    return false;
    }
    function containsFontFamily(html: string, family: string) {
    const nhtml = normalizeHtml(html).toLowerCase();
    const f = family.toLowerCase();
    return (
        nhtml.includes(`font-family:${f}`) ||
        nhtml.includes(`font-family: ${f}`) ||
        nhtml.includes(`face="${f}"`)
    );
    }

    const IntegrationExerciseI1 = forwardRef<IntegrationExerciseI1Handle, Props>(
    function IntegrationExerciseI1({ onEvaluate, seed }, ref) {
        const scenario = useMemo(() => pickOne(BANK, seed ?? Math.random()), [seed]);
        const editorRef = useRef<HTMLDivElement | null>(null);

        const [fontFamily, setFontFamily] = useState<string>("Courier New");
        const [fontSize, setFontSize] = useState<number>(18);
        const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
        const [selectedColor, setSelectedColor] = useState<string>(COLOR_CHOICES[0].value);

        React.useEffect(() => {
        if (editorRef.current) editorRef.current.innerHTML = scenario.initialText;
        }, [scenario.id]);

        const safeExec = (command: string, value?: string) => {
        if (typeof document === "undefined") return;
        try {
            document.execCommand(command, false, value);
        } catch {}
        editorRef.current?.focus();
        };

        const applyCmd = (cmd: "bold" | "italic" | "underline") => safeExec(cmd);
        const applyColor = (color: string) => safeExec("foreColor", color);

        const applyAlign = (mode: "left" | "center" | "right" | "justify") => {
        const map: Record<typeof mode, string> = {
            left: "justifyLeft",
            center: "justifyCenter",
            right: "justifyRight",
            justify: "justifyFull",
        };
        safeExec(map[mode]);
        };

        const handleFontChange = (val: string) => {
        setFontFamily(val);
        safeExec("fontName", val);
        };

        // === VALIDACIÓN ORIGINAL ===
        const check = () => {
        const root = editorRef.current;
        if (!root) return false;
        const html = root.innerHTML;

        const ffOK =
            !scenario.requiredFontFamily ||
            containsFontFamily(html, scenario.requiredFontFamily);

        const fsOK =
            !scenario.requiredFontSizePx || fontSize === scenario.requiredFontSizePx;

        const marksOK = scenario.marks.every((m) => containsMark(html, m));

        const okAll = ffOK && fsOK && marksOK;

        setFeedback(
            <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm shadow ${
                okAll
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
            >
            <div className="font-medium">
                {okAll
                ? "✅ ¡Excelente! Cumpliste todos los requisitos."
                : "❌ Aún faltan ajustes:"}
            </div>

            {!okAll && (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                {!ffOK && scenario.requiredFontFamily && (
                    <li>
                    Aplica la fuente <b>{scenario.requiredFontFamily}</b>.
                    </li>
                )}
                {!fsOK && scenario.requiredFontSizePx && (
                    <li>
                    Ajusta el tamaño a <b>{scenario.requiredFontSizePx}px</b>.
                    </li>
                )}
                {!marksOK && <li>Revisa los estilos solicitados.</li>}
                </ul>
            )}
            </div>
        );

        onEvaluate?.(okAll ? 1 : 0);
        return okAll;
        };

        const reset = () => {
        if (editorRef.current) editorRef.current.innerHTML = scenario.initialText;
        setFontFamily(scenario.requiredFontFamily ?? FONT_CHOICES[0]);
        setFontSize(scenario.requiredFontSizePx ?? 18);
        setSelectedColor(COLOR_CHOICES[0].value);
        setFeedback(null);
        onEvaluate?.(0);
        };

        useImperativeHandle(ref, () => ({ check, isReady: () => true, reset }));

        return (
        <section>
            {/* Escenario (igual que el original) */}
            <div className="rounded-2xl border bg-white p-4 shadow mb-4">
            <h3 className="font-semibold text-black">{scenario.title}</h3>
            <h3 className="font-semibold text-slate-600">{scenario.description}</h3>
            </div>

            {/* Editor ORIGINAL */}
            <div className="mt-3 rounded-2xl border bg-white shadow overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-slate-50/70">
                <label className="text-xs sm:text-sm text-slate-600">Fuente</label>
                <select
                className="border rounded-xl px-3 py-1.5 text-xs sm:text-sm bg-white"
                value={fontFamily}
                onChange={(e) => handleFontChange(e.target.value)}
                >
                {FONT_CHOICES.map((f) => (
                    <option key={f} value={f}>
                    {f}
                    </option>
                ))}
                </select>

                <label className="text-xs sm:text-sm text-slate-600 ml-1">Tamaño</label>
                <select
                className="border rounded-xl px-3 py-1.5 text-xs sm:text-sm bg-white"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                >
                {SIZE_CHOICES.map((s) => (
                    <option key={s} value={s}>
                    {s}px
                    </option>
                ))}
                </select>

                <div className="h-6 w-px bg-slate-200 mx-2" />

                <button
                type="button"
                className="px-2.5 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-sm font-semibold"
                onClick={() => applyCmd("bold")}
                >
                B
                </button>
                <button
                type="button"
                className="px-2.5 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-sm italic"
                onClick={() => applyCmd("italic")}
                >
                I
                </button>
                <button
                type="button"
                className="px-2.5 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-sm underline"
                onClick={() => applyCmd("underline")}
                >
                U
                </button>

                <div className="h-6 w-px bg-slate-200 mx-2" />

                {/* Alineación */}
                <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => applyAlign("left")}
                    className="px-2 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-xs"
                >
                    <div className="flex flex-col gap-0.5">
                    <span className="h-0.5 w-4 bg-slate-700 rounded-full self-start" />
                    <span className="h-0.5 w-3 bg-slate-700 rounded-full self-start" />
                    <span className="h-0.5 w-5 bg-slate-700 rounded-full self-start" />
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => applyAlign("center")}
                    className="px-2 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-xs"
                >
                    <div className="flex flex-col gap-0.5 items-center">
                    <span className="h-0.5 w-4 bg-slate-700 rounded-full" />
                    <span className="h-0.5 w-3 bg-slate-700 rounded-full" />
                    <span className="h-0.5 w-5 bg-slate-700 rounded-full" />
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => applyAlign("right")}
                    className="px-2 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-xs"
                >
                    <div className="flex flex-col gap-0.5 items-end">
                    <span className="h-0.5 w-4 bg-slate-700 rounded-full" />
                    <span className="h-0.5 w-3 bg-slate-700 rounded-full" />
                    <span className="h-0.5 w-5 bg-slate-700 rounded-full" />
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => applyAlign("justify")}
                    className="px-2 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-xs"
                >
                    <div className="flex flex-col gap-0.5">
                    <span className="h-0.5 w-5 bg-slate-700 rounded-full" />
                    <span className="h-0.5 w-5 bg-slate-700 rounded-full" />
                    <span className="h-0.5 w-5 bg-slate-700 rounded-full" />
                    </div>
                </button>
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2" />

                {/* Colores */}
                <span className="text-xs sm:text-sm text-slate-600">Color</span>
                <div className="flex items-center gap-1">
                {COLOR_CHOICES.map((c) => (
                    <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                        setSelectedColor(c.value);
                        applyColor(c.value);
                    }}
                    className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full border shadow-sm ${
                        selectedColor === c.value ? "ring-2 ring-teal-600" : ""
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                    />
                ))}
                </div>
            </div>

            {/* Área editable */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[140px] px-4 py-3 outline-none"
                style={{
                fontFamily:
                    "Poppins, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize,
                color: "#111827",
                }}
            />
            </div>

            {feedback}
        </section>
        );
    }
);

export default IntegrationExerciseI1;
