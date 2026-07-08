"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type IntegrationExerciseI2AdaptHandle = {
    check: (opts?: { silent?: boolean }) => boolean;
    isReady: () => boolean;
    reset: () => void;
};

type DecisionId = "format" | "visual" | "tone" | "aiSuggestion";
type OptionId = string;

type Option = {
    id: OptionId;
    label: string;
};

type Decision = {
    id: DecisionId;
    title: string;
    prompt: string;
    expected: OptionId;
    options: Option[];
};

type Scenario = {
    id: string;
    title: string;
    sourceLabel: string;
    targetLabel: string;
    sourceText: string;
    goal: string;
    decisions: Decision[];
};

type Props = {
    onEvaluate?: (point: 0 | 1) => void;
    onReadyChange?: (ready: boolean) => void;
    seed?: number;
};

const DECISION_LABELS: Record<DecisionId, string> = {
    format: "Formato",
    visual: "Integración de recursos",
    tone: "Audiencia",
    aiSuggestion: "Uso de sugerencia automática",
};

const SCENARIOS: ReadonlyArray<Scenario> = [
    {
        id: "instagram-to-facebook",
        title: "Post de Instagram a publicación para apoderados",
        sourceLabel: "Publicación actual para estudiantes",
        targetLabel: "Nuevo formato: Facebook para apoderados",
        sourceText:
            "Cuida tu identidad digital: piensa antes de publicar, revisa tu privacidad y evita compartir datos personales",
        goal: "Reelaborar el mensaje para familias que necesitan orientar a sus hijos e hijas",
        decisions: [
            {
                id: "format",
                title: "Ajuste de formato",
                prompt: "¿Qué cambio se adapta mejor al nuevo medio?",
                expected: "fb-context",
                options: [
                    { id: "fb-context", label: "Reformularlo como publicación con orientación familiar y pregunta de conversación" },
                    { id: "same-caption", label: "Mantenerlo como mensaje central acompañado de una imagen de apoyo" },
                    { id: "formal-report", label: "Presentarlo como comunicado con recomendaciones para el hogar" },
                ],
            },
            {
                id: "visual",
                title: "Integración de recursos",
                prompt: "¿Qué elemento visual conviene incorporar en esta publicación?",
                expected: "family-image",
                options: [
                    { id: "family-image", label: "Incorporar una imagen simple que represente acompañamiento familiar (ej. adulto y adolescente conversando)" },
                    { id: "no-image", label: "Mantener solo texto, sin ningún elemento visual adicional" },
                    { id: "unrelated-logo", label: "Incorporar el logo institucional del colegio, sin relación directa con el mensaje de acompañamiento familiar" },
                ],
            },
            {
                id: "tone",
                title: "Adecuación a la audiencia",
                prompt: "¿Qué tono corresponde mejor a apoderados?",
                expected: "family-guidance",
                options: [
                    { id: "family-guidance", label: "Orientador y cercano, con foco en acompañamiento familiar" },
                    { id: "teen-slang", label: "Directo y dinámico, conservando el ritmo de redes sociales" },
                    { id: "legal-tone", label: "Formal y preventivo, enfatizando acuerdos de cuidado digital" },
                ],
            },
            {
                id: "aiSuggestion",
                title: "Uso de sugerencia automática",
                prompt:
                    "Una IA sugiere: \"Acortar el texto a una sola frase llamativa tipo titular, para que se lea rápido en el feed\". ¿Qué decides hacer?",
                expected: "shorten-keep-tip",
                options: [
                    { id: "shorten-keep-tip", label: "Acortar el mensaje, pero mantener al menos una recomendación concreta para las familias" },
                    { id: "shorten-trust-link", label: "Acortar el mensaje a una frase llamativa, confiando en que el enlace entregará el resto del contenido" },
                    { id: "keep-length", label: "Mantener el texto más extenso, ya que los apoderados suelen necesitar más contexto" },
                ],
            },
        ],
    },
    {
        id: "birthday-kids-teens",
        title: "Invitación infantil a invitación adolescente",
        sourceLabel: "Invitación original",
        targetLabel: "Nuevo formato: invitación para adolescentes",
        sourceText:
            "Ven a mi cumpleaños. Habrá juegos, dulces, globos y una sorpresa divertida para todos",
        goal: "Adaptar la invitación a un público adolescente manteniendo lugar, hora y actividad",
        decisions: [
            {
                id: "format",
                title: "Ajuste de formato",
                prompt: "¿Qué formato funciona mejor para adolescentes?",
                expected: "digital-invite",
                options: [
                    { id: "digital-invite", label: "Crear una invitación digital con datos visibles y estilo de evento juvenil" },
                    { id: "child-card", label: "Mantener una tarjeta festiva con colores, mensaje alegre y datos del evento" },
                    { id: "formal-letter", label: "Usar una invitación escrita con saludo, detalles y cierre cordial" },
                ],
            },
            {
                id: "visual",
                title: "Integración de recursos",
                prompt: "¿Qué elemento visual conviene incorporar en la invitación?",
                expected: "one-relevant-icon",
                options: [
                    { id: "one-relevant-icon", label: "Incorporar una imagen o ícono simple relacionado con la actividad, sin competir con los datos del evento" },
                    { id: "no-visual", label: "No incorporar ningún elemento visual, dejando solo el texto con los datos" },
                    { id: "childish-image", label: "Incorporar una imagen infantil de cumpleaños, sin relación con el estilo juvenil que se busca" },
                ],
            },
            {
                id: "tone",
                title: "Adecuación a la audiencia",
                prompt: "¿Qué tono es más adecuado?",
                expected: "casual-clear",
                options: [
                    { id: "casual-clear", label: "Cercano y actual, manteniendo claridad en los datos del evento" },
                    { id: "childish", label: "Entusiasta y juguetón, destacando la sorpresa y la celebración" },
                    { id: "ceremonial", label: "Cordial y ordenado, dando prioridad a los datos del evento" },
                ],
            },
            {
                id: "aiSuggestion",
                title: "Uso de sugerencia automática",
                prompt:
                    "Una IA sugiere: \"Agregar elementos visuales llamativos para que la invitación se vea más entretenida\". ¿Qué decides hacer?",
                expected: "few-visuals-keep-data",
                options: [
                    { id: "few-visuals-keep-data", label: "Incorporar uno o dos elementos visuales discretos, sin que compitan con los datos del evento" },
                    { id: "many-visuals", label: "Incorporar varios elementos visuales para que la invitación se sienta más dinámica y acorde a la edad" },
                    { id: "no-visuals", label: "No incorporar elementos visuales adicionales, ya que los datos del evento ya están bien organizados" },
                ],
            },
        ],
    },
    {
        id: "formal-letter-email",
        title: "Carta formal a correo informal",
        sourceLabel: "Solicitud original",
        targetLabel: "Nuevo formato: correo para un equipo de trabajo",
        sourceText:
            "Por medio de la presente, solicito confirmar disponibilidad para participar en la reunión informativa del próximo viernes",
        goal: "Reelaborar el mensaje para que funcione como correo cotidiano de coordinación",
        decisions: [
            {
                id: "format",
                title: "Ajuste de formato",
                prompt: "¿Qué cambio de formato corresponde?",
                expected: "email",
                options: [
                    { id: "email", label: "Usar asunto, saludo, solicitud y cierre adaptados a correo laboral" },
                    { id: "letter", label: "Conservar saludo formal, desarrollo de la solicitud y cierre protocolar" },
                    { id: "poster", label: "Convertirlo en aviso visual con fecha y mensaje principal destacado" },
                ],
            },
            {
                id: "visual",
                title: "Integración de recursos",
                prompt: "¿Qué elemento visual conviene incorporar en este correo?",
                expected: "simple-signature",
                options: [
                    { id: "simple-signature", label: "Incorporar un ícono o firma visual simple del equipo en el cierre, sin agregar imágenes al cuerpo del mensaje" },
                    { id: "no-visual-needed", label: "No incorporar ningún elemento visual, ya que un correo de coordinación no lo requiere" },
                    { id: "decorative-image", label: "Incorporar una imagen decorativa junto al saludo para hacer el correo más ameno" },
                ],
            },
            {
                id: "tone",
                title: "Adecuación a la audiencia",
                prompt: "¿Qué tono conviene usar?",
                expected: "professional-friendly",
                options: [
                    { id: "professional-friendly", label: "Profesional y cercano, con una solicitud clara y trato cordial" },
                    { id: "very-formal", label: "Institucional, con fórmulas de cortesía y redacción cuidada" },
                    { id: "too-casual", label: "Conversacional, como mensaje de coordinación rápida" },
                ],
            },
            {
                id: "aiSuggestion",
                title: "Uso de sugerencia automática",
                prompt:
                    "Una IA sugiere: \"Reemplazar el saludo y la despedida formales por otros más breves, propios de un correo de equipo\". ¿Qué decides hacer?",
                expected: "brief-courtesy",
                options: [
                    { id: "brief-courtesy", label: "Usar un saludo y cierre breves, adaptados al equipo, sin perder cortesía mínima" },
                    { id: "remove-greeting", label: "Eliminar el saludo y la despedida, ya que en muchos correos internos de equipo no se usan" },
                    { id: "keep-formal-greeting", label: "Mantener el saludo y despedida formales originales, ajustando solo el cuerpo del mensaje" },
                ],
            },
        ],
    },
    {
        id: "long-text-infographic",
        title: "Texto informativo a infografía",
        sourceLabel: "Explicación original",
        targetLabel: "Nuevo formato: infografía para público general",
        sourceText:
            "La seguridad digital requiere contraseñas robustas, actualizaciones frecuentes, revisión de enlaces y cuidado con la información personal",
        goal: "Transformar el texto en una pieza visual que destaque acciones prioritarias",
        decisions: [
            {
                id: "format",
                title: "Ajuste de formato",
                prompt: "¿Qué formato responde mejor al objetivo?",
                expected: "visual-summary",
                options: [
                    { id: "visual-summary", label: "Pieza visual con acciones priorizadas y apoyo iconográfico" },
                    { id: "full-text", label: "Versión desarrollada con explicación por cada recomendación" },
                    { id: "audio-script", label: "Guion narrativo para explicar las recomendaciones en secuencia" },
                ],
            },
            {
                id: "visual",
                title: "Integración de recursos",
                prompt: "¿Qué elemento visual conviene incorporar en la infografía?",
                expected: "icons-per-action",
                options: [
                    { id: "icons-per-action", label: "Incorporar íconos que representen cada acción recomendada (contraseña, actualización, enlaces, datos personales)" },
                    { id: "bold-text-only", label: "Usar solo texto destacado en negrita, sin apoyo iconográfico" },
                    { id: "generic-background", label: "Incorporar una fotografía genérica de fondo sin relación directa con las acciones" },
                ],
            },
            {
                id: "tone",
                title: "Adecuación a la audiencia",
                prompt: "¿Qué lenguaje conviene usar?",
                expected: "plain-action",
                options: [
                    { id: "plain-action", label: "Orientado a decisiones prácticas que el público pueda aplicar" },
                    { id: "technical", label: "Preciso y especializado para cuidar exactitud del contenido" },
                    { id: "advertising", label: "Persuasivo y motivador para aumentar interés inicial" },
                ],
            },
            {
                id: "aiSuggestion",
                title: "Uso de sugerencia automática",
                prompt:
                    "Una IA sugiere: \"Agregar una imagen llamativa de fondo para captar más atención visual\". ¿Qué decides hacer?",
                expected: "simple-background",
                options: [
                    { id: "simple-background", label: "Usar un fondo simple que no compita con los iconos de cada acción" },
                    { id: "eye-catching-background", label: "Usar la imagen de fondo llamativa que sugiere la IA, ya que ayuda a captar la atención del público general" },
                    { id: "no-background", label: "No agregar ningún fondo, manteniendo solo los iconos y el texto de cada acción" },
                ],
            },
        ],
    },
    {
        id: "school-notice-families",
        title: "Aviso escolar a mensaje para familias",
        sourceLabel: "Aviso interno",
        targetLabel: "Nuevo formato: mensaje para familias",
        sourceText:
            "Se informa que el viernes se realizará una actividad de convivencia digital en dependencias del establecimiento",
        goal: "Adaptar el aviso para que las familias comprendan propósito, horario y forma de participación",
        decisions: [
            {
                id: "format",
                title: "Ajuste de formato",
                prompt: "¿Qué formato conviene usar?",
                expected: "family-message",
                options: [
                    { id: "family-message", label: "Mensaje para familias con propósito, datos prácticos y participación" },
                    { id: "internal-memo", label: "Comunicado informativo con redacción institucional" },
                    { id: "poster-only", label: "Afiche visual con título, fecha, lugar y tema de la actividad" },
                ],
            },
            {
                id: "visual",
                title: "Integración de recursos",
                prompt: "¿Qué elemento visual conviene incorporar en el mensaje?",
                expected: "one-topic-icon",
                options: [
                    { id: "one-topic-icon", label: "Incorporar un ícono simple relacionado con la actividad (ej. pantalla o dispositivo) junto al mensaje" },
                    { id: "no-visual-notice", label: "No incorporar ningún elemento visual, manteniendo el aviso solo en texto" },
                    { id: "oversized-logo", label: "Incorporar el logo del establecimiento en tamaño grande como elemento principal, sin relación con el contenido del aviso" },
                ],
            },
            {
                id: "tone",
                title: "Adecuación a la audiencia",
                prompt: "¿Qué tono se ajusta mejor?",
                expected: "clear-inviting",
                options: [
                    { id: "clear-inviting", label: "Respetuoso y convocante, orientado a facilitar participación" },
                    { id: "directive", label: "Instructivo y directo, centrado en entregar indicaciones" },
                    { id: "student-slang", label: "Cercano y dinámico, con expresiones del contexto escolar" },
                ],
            },
            {
                id: "aiSuggestion",
                title: "Uso de sugerencia automática",
                prompt:
                    "Una IA sugiere: \"Agregar un emoji o ícono junto al título para que el mensaje se vea más amigable\". ¿Qué decides hacer?",
                expected: "small-icon",
                options: [
                    { id: "small-icon", label: "Agregar un ícono simple junto al título, sin que reemplace la información formal necesaria" },
                    { id: "many-graphics", label: "Agregar varios elementos gráficos a lo largo del mensaje para que se sienta más cercano a las familias" },
                    { id: "no-graphics", label: "No agregar ningún elemento gráfico, manteniendo el mensaje enteramente en texto" },
                ],
            },
        ],
    },
    {
        id: "technical-guide-students",
        title: "Guía técnica a recurso para estudiantes",
        sourceLabel: "Explicación técnica original",
        targetLabel: "Nuevo formato: recurso visual para estudiantes",
        sourceText:
            "La autenticación en dos pasos incorpora una capa adicional de verificación mediante códigos temporales o aplicaciones autorizadas",
        goal: "Reelaborar el contenido para que estudiantes comprendan qué es y cómo activarlo",
        decisions: [
            {
                id: "format",
                title: "Ajuste de formato",
                prompt: "¿Qué formato facilita la adaptación?",
                expected: "step-guide",
                options: [
                    { id: "step-guide", label: "Guía visual con secuencia de activación y ejemplo aplicado" },
                    { id: "technical-note", label: "Nota informativa con conceptos y beneficios de seguridad" },
                    { id: "definition-card", label: "Tarjeta explicativa sobre el concepto y su utilidad" },
                ],
            },
            {
                id: "visual",
                title: "Integración de recursos",
                prompt: "¿Qué elemento visual conviene incorporar en la guía?",
                expected: "step-screenshots",
                options: [
                    { id: "step-screenshots", label: "Incorporar capturas de pantalla o íconos que muestren cada paso de activación" },
                    { id: "no-visual-guide", label: "No incorporar ningún elemento visual, describiendo los pasos solo con texto" },
                    { id: "unrelated-security-image", label: "Incorporar una imagen genérica de seguridad sin relación con los pasos de activación" },
                ],
            },
            {
                id: "tone",
                title: "Adecuación a la audiencia",
                prompt: "¿Qué tono conviene?",
                expected: "simple-practical",
                options: [
                    { id: "simple-practical", label: "Aplicado y comprensible, con indicaciones que se puedan seguir" },
                    { id: "expert", label: "Técnico y preciso para explicar el mecanismo" },
                    { id: "alarmist", label: "Preventivo y enfático para destacar la importancia de activarlo" },
                ],
            },
            {
                id: "aiSuggestion",
                title: "Uso de sugerencia automática",
                prompt:
                    "Una IA sugiere: \"Agregar comparaciones con situaciones cotidianas para que el concepto se entienda mejor\". ¿Qué decides hacer?",
                expected: "one-comparison",
                options: [
                    { id: "one-comparison", label: "Agregar una comparación breve, sin que reemplace los pasos concretos de activación" },
                    { id: "many-comparisons", label: "Agregar varias comparaciones cotidianas a lo largo de la guía para reforzar la comprensión del concepto" },
                    { id: "no-comparison", label: "No agregar ninguna comparación, manteniendo solo la secuencia de activación tal como está" },
                ],
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

const IntegrationExerciseI2Adapt = forwardRef<IntegrationExerciseI2AdaptHandle, Props>(
    function IntegrationExerciseI2Adapt({ onEvaluate, onReadyChange, seed }, ref) {
        const scenario = useMemo(() => pickScenario(seed), [seed]);
        const decisions = useMemo(
            () =>
                scenario.decisions.map((decision, index) => ({
                    ...decision,
                    options: shuffle(
                        decision.options,
                        seed === undefined ? undefined : seed + index * 0.19
                    ),
                })),
            [scenario, seed]
        );
        const [answers, setAnswers] = useState<Record<DecisionId, OptionId | null>>({
            format: null,
            visual: null,
            tone: null,
            aiSuggestion: null,
        });
        const [feedback, setFeedback] = useState<{
            kind: "idle" | "success" | "warning" | "error";
            score?: number;
            message?: string;
        }>({ kind: "idle" });
        const [activeDecision, setActiveDecision] = useState(0);

        const answeredCount = useMemo(
            () => Object.values(answers).filter(Boolean).length,
            [answers]
        );

        useEffect(() => {
            onReadyChange?.(answeredCount === decisions.length);
        }, [answeredCount, decisions.length, onReadyChange]);

        function setAnswer(decisionId: DecisionId, optionId: OptionId) {
            setAnswers((prev) => ({ ...prev, [decisionId]: optionId }));
            setFeedback({ kind: "idle" });
            setActiveDecision((current) =>
                current < decisions.length - 1 ? current + 1 : current
            );
        }

        function score() {
            return decisions.reduce((total, decision) => {
                return total + Number(answers[decision.id] === decision.expected);
            }, 0);
        }

        function evaluate(opts?: { silent?: boolean }) {
            const result = score();
            const ok = result >= 3;

            if (opts?.silent) {
                onEvaluate?.(ok ? 1 : 0);
                return ok;
            }

            if (result === decisions.length) {
                setFeedback({
                    kind: "success",
                    score: result,
                    message:
                        "Excelente. Adaptas el contenido según formato, estructura, audiencia y uso de sugerencias automáticas.",
                });
                onEvaluate?.(1);
            } else if (ok) {
                setFeedback({
                    kind: "success",
                    score: result,
                    message:
                        "Muy bien. Adaptas correctamente la mayoría de los aspectos del contenido al nuevo formato y audiencia.",
                });
                onEvaluate?.(1);
            } else if (result >= 2) {
                setFeedback({
                    kind: "warning",
                    score: result,
                    message:
                        "Vas bien, pero revisa si cada cambio responde al nuevo medio, audiencia y propósito.",
                });
                onEvaluate?.(0);
            } else {
                setFeedback({
                    kind: "error",
                    score: result,
                    message:
                        "Revisa el contenido base y el destino: adaptar no es solo cambiar palabras, también implica formato, estructura y audiencia.",
                });
                onEvaluate?.(0);
            }

            return ok;
        }

        useImperativeHandle(ref, () => ({
            check: evaluate,
            isReady: () => answeredCount === decisions.length,
            reset: () => {
                setAnswers({
                    format: null,
                    visual: null,
                    tone: null,
                    aiSuggestion: null,
                });
                setFeedback({ kind: "idle" });
                onEvaluate?.(0);
                onReadyChange?.(false);
            },
        }));

        return (
            <section className="space-y-5">
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {scenario.title}
                    </h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-[#f3fbfb] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                                Origen
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">
                                {scenario.sourceLabel}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-[#f3fbfb] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#286575]">
                                Destino
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">
                                {scenario.targetLabel}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner">
                        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                            <span className="ml-2 truncate text-xs font-medium text-slate-500">
                                documento.txt
                            </span>
                        </div>

                        <div className="bg-white px-5 py-5">
                            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-[#fffdf8] px-5 py-4 shadow-sm">
                                <div className="mb-3 border-b border-slate-200 pb-3">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {scenario.sourceLabel}
                                    </p>
                                </div>
                                <p className="font-serif text-[15px] leading-7 text-slate-700">
                                    {scenario.sourceText}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decisión activa */}
                {decisions.map((decision, idx) => {
                    if (idx !== activeDecision) return null
                    const current = answers[decision.id];

                    return (
                        <div
                            key={decision.id}
                            className="rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 ease-out"
                            style={{
                                animation: "ladico-fade-slide-in 0.25s ease-out",
                            }}
                        >
                            {/* Puntos de navegación */}
                            <div className="mb-3 flex items-center justify-center gap-2">
                                {decisions.map((d, i) => {
                                    const isAnswered = !!answers[d.id];
                                    const isActive = i === activeDecision;

                                    return (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => setActiveDecision(i)}
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

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#e4f3f5] px-3 py-1 text-xs font-semibold text-[#286575]">
                                    {DECISION_LABELS[decision.id]}
                                </span>
                                <h4 className="font-semibold text-slate-800">
                                    {decision.title}
                                </h4>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                {decision.prompt}
                            </p>

                            <div className="mt-3 space-y-2">
                                {decision.options.map((option) => {
                                    const isPicked = current === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setAnswer(decision.id, option.id)}
                                            className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium leading-relaxed shadow-sm transition ${
                                                isPicked
                                                    ? "border-[#286575] bg-[#e4f3f5] text-slate-950 ring-2 ring-[#286575]/20"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-[#286575]/40 hover:bg-slate-50"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navegación prev/next */}
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setActiveDecision((i) => Math.max(0, i - 1))}
                                    disabled={activeDecision === 0}
                                    className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                                        activeDecision === 0
                                            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                            : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                                    }`}
                                >
                                    <span
                                        className={`inline-block transition-transform duration-300 ${
                                            activeDecision !== 0 ? "group-hover:-translate-x-1" : ""
                                        }`}
                                        aria-hidden
                                    >
                                        ←
                                    </span>
                                    Anterior
                                </button>

                                <span className="text-xs text-slate-400">
                                    {answeredCount}/{decisions.length} respondidas
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveDecision((i) => Math.min(decisions.length - 1, i + 1))
                                    }
                                    disabled={activeDecision === decisions.length - 1}
                                    className={`group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                                        activeDecision === decisions.length - 1
                                            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                            : "border-[#286575] bg-white text-[#286575] shadow-sm hover:bg-[#286575] hover:text-white hover:shadow-md"
                                    }`}
                                >
                                    Siguiente
                                    <span
                                        className={`inline-block transition-transform duration-300 ${
                                            activeDecision !== decisions.length - 1
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

                <style>{`
                    @keyframes ladico-fade-slide-in {
                        from {
                            opacity: 0;
                            transform: translateY(6px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>

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
                        <p className="font-semibold">Decisiones correctas: {feedback.score}/{decisions.length}</p>
                        <p className="mt-1">{feedback.message}</p>
                    </div>
                )}
            </section>
        );
    }
);

IntegrationExerciseI2Adapt.displayName = "IntegrationExerciseI2Adapt";

export default IntegrationExerciseI2Adapt;