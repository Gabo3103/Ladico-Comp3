"use client";

import React, {
    forwardRef,
    useImperativeHandle,
    useState,
} from "react";

export type RightsExerciseA1Handle = {
    check: () => boolean;
    isReady: () => boolean;
    reset: () => void;
};

type Resource = {
    url: string;
    title: string;
    author: string;
    licenseCode: string;
};

type Props = {
    resource: Resource;
    onEvaluate?: (point: 0 | 1) => void;
};

function normalizeText(s: string) {
    return s
        .toLowerCase()
        .replace(/[\u2018\u2019\u201C\u201D«»"]/g, '"')
        .replace(/[–—]/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}

function validateFreeText(value: string, r: Resource) {
    const t = normalizeText(value);
    const hasTitle = t.includes(normalizeText(r.title));
    const hasAuthor = t.includes(normalizeText(r.author));
    const hasLicense = t.includes(normalizeText(r.licenseCode));
    return {
        ok: hasTitle && hasAuthor && hasLicense,
        missing: {
            title: !hasTitle,
            author: !hasAuthor,
            license: !hasLicense,
        },
    };
}

const RightsExerciseA1 = forwardRef<RightsExerciseA1Handle, Props>(
    ({ resource, onEvaluate }, ref) => {
        const [text, setText] = useState("");
        const [result, setResult] = useState<{ ok: boolean; msg: React.ReactNode }>();

        useImperativeHandle(ref, () => ({
            check: () => handleCheck(),
            isReady: () => true,
            reset: () => {
                setText("");
                setResult(undefined);
            },
        }));

        const handleCheck = () => {
            const free = validateFreeText(text, resource);
            const ok = free.ok;

            const msg = ok ? (
                <p className="text-green-700">
                    ✅ Correcto. Incluiste <b>título</b>, <b>autor</b> y <b>{resource.licenseCode}</b>.
                </p>
            ) : (
                <div className="text-red-700">
                    ❌ En tu texto falta:
                    <ul className="list-disc pl-5">
                        {free.missing.title && <li>El <b>título</b> de la obra.</li>}
                        {free.missing.author && <li>El <b>autor</b>.</li>}
                        {free.missing.license && <li>La <b>licencia {resource.licenseCode}</b>.</li>}
                    </ul>
                    <details className="mt-2 text-sm text-slate-700">
                        <summary className="cursor-pointer">Ver ejemplo canónico</summary>
                        <div className="mt-1">
                            <code className="bg-slate-100 px-2 py-1 rounded">
                                “{resource.title}” by {resource.author} is licensed under {resource.licenseCode}.
                            </code>
                        </div>
                    </details>
                </div>
            );

            setResult({ ok, msg });
            onEvaluate?.(ok ? 1 : 0);
            return ok;
        };

        return (
            <section>
                {/* Botón para abrir recurso */}
                <div className="mb-4 flex">
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="
                            inline-flex items-center gap-2
                            px-3 py-2 rounded-full border border-teal-700
                            bg-teal-50 text-teal-800 text-sm font-medium
                            shadow-sm
                            transition-all duration-200 ease-out
                            hover:bg-teal-100 hover:border-teal-800 hover:shadow-md
                            hover:scale-[1.03]
                        "
                    >
                        Abrir recurso
                        <svg width="16" height="16" viewBox="0 0 24 24" className="inline-block">
                            <path
                                d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h5V3H3v7h2V5z"
                                fill="currentColor"
                            />
                        </svg>
                    </a>
                </div>
                {/* Campo libre */}
                <div>
                    <textarea
                        className="w-full rounded-2xl border p-3 text-sm ring-0 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        rows={3}
                        placeholder="Escribe la atribución aquí"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                {/* Feedback */}
                {result && (
                    <div
                        className={`mt-4 rounded-2xl p-3 ${
                            result.ok ? "bg-green-50" : "bg-red-50"
                        }`}
                    >
                        {result.msg}
                    </div>
                )}
            </section>
        );
    }
);

RightsExerciseA1.displayName = "RightsExerciseA1";
export default RightsExerciseA1;
