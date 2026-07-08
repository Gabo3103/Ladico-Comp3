"use client"

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react"

export type A1Quality = "good" | "partial" | "bad"

export type RightsExerciseA1Grade = {
    correctCount: number
    totalCount: number
    quality: A1Quality
}

export type RightsExerciseA1Handle = {
    check: () => void
    isReady: () => boolean
    reset: () => void
    grade: () => RightsExerciseA1Grade
}

// PROPUESTA PARA FUTURO DESARROLLO (no implementado en esta versión):
// El Excel (CS3.3.11) describe escenarios de infracción clara además de
// licencias CC, por ejemplo:
//   - Usar una canción con copyright en un video sin permiso del autor/sello.
//   - Publicar fotos de otra persona sin su consentimiento (privacidad/imagen).
//   - Descargar y redistribuir un PDF de un libro con todos los derechos reservados.
// Estos casos pondrían a prueba la dimensión "Interpretación contextual" de forma
// más literal (reconocer usos claramente INCOMPATIBLES, no solo restricciones
// dentro de una licencia CC ya otorgada). Se podrían agregar como un nuevo
// "profile" (ej. LicenseKind = "COPYRIGHT_NO_PERMISSION" | "CONSENT_REQUIRED")
// con su propio optionBank(), reutilizando el mismo mecanismo de 5 opciones
// (3 permitidas + 2 no permitidas) y sumándolos a licenseProfiles().

type Asset = {
    title: string
    author: string
    imageUrl: string
    license: { short: string; url: string }
}

type Props = {
    onReadyChange?: (ready: boolean) => void
    asset?: Asset
}

type LicenseKind = "BY_SA" | "BY_ND" | "CC0"

type LicenseProfile = {
    kind: LicenseKind
    short: string
    url: string
    tooltip: string
}

type Option = {
    id: string
    label: string
    allowed: boolean
    feedback: string
}

function shuffle<T>(items: T[]): T[] {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

function licenseProfiles(asset?: Asset): LicenseProfile[] {
    return [
        {
            kind: "BY_SA",
            short: asset?.license.short ?? "CC BY-SA",
            url: asset?.license.url ?? "https://creativecommons.org/licenses/by-sa/4.0/deed.es",
            tooltip:
                "Permite usar y adaptar la obra, incluso comercialmente, si atribuyes al autor y compartes la adaptación con la misma licencia.",
        },
        {
            kind: "BY_ND",
            short: "CC BY-ND",
            url: "https://creativecommons.org/licenses/by-nd/4.0/deed.es",
            tooltip:
                "Permite reutilizar la obra con atribución, incluso comercialmente, pero no permite publicar versiones modificadas.",
        },
        {
            kind: "CC0",
            short: "CC0",
            url: "https://creativecommons.org/publicdomain/zero/1.0/deed.es",
            tooltip:
                "La obra fue dedicada al dominio público: puede usarse, modificarse y compartirse sin atribución obligatoria.",
        },
    ]
}

function optionBank(profile: LicenseProfile): Option[] {
    if (profile.kind === "BY_ND") {
        return [
            {
                id: "nd-share-attributed",
                label:
                    "Publicarla en un blog indicando autor, licencia y enlace a la fuente, sin modificar la imagen",
                allowed: true,
                feedback:
                    "Correcto: CC BY-ND permite compartir la obra con atribución si no se publica una versión modificada.",
            },
            {
                id: "nd-commercial-attributed",
                label:
                    "Usarla en un folleto comercial con atribución completa y sin recortes, filtros ni texto encima",
                allowed: true,
                feedback:
                    "Correcto: la restricción ND no impide el uso comercial; impide publicar adaptaciones.",
            },
            {
                id: "nd-ai-color",
                label:
                    "Mejorar color y contraste con IA y publicar la nueva versión atribuyendo al autor",
                allowed: false,
                feedback:
                    "No corresponde: publicar una versión modificada infringe la condición SinDerivadas.",
            },
            {
                id: "nd-crop-social",
                label:
                    "Recortarla para formato vertical de redes sociales y mantener la licencia original",
                allowed: false,
                feedback:
                    "No corresponde: recortar para publicar una nueva versión cuenta como adaptación.",
            },
            {
                id: "nd-credit-author-only",
                label:
                    "Usarla sin cambios indicando solo el nombre del autor, sin mencionar la licencia",
                allowed: false,
                feedback:
                    "No basta: aunque no se modifique, la atribución debe incluir la licencia y, cuando sea posible, enlace.",
            },
        ]
    }

    if (profile.kind === "CC0") {
        return [
            {
                id: "cc0-edit-ai",
                label:
                    "Modificarla con una herramienta de IA y publicarla como parte de un nuevo recurso",
                allowed: true,
                feedback:
                    "Correcto: CC0 permite modificar y reutilizar sin obligación de atribución.",
            },
            {
                id: "cc0-commercial",
                label:
                    "Usarla en un material comercial sin pedir permiso adicional",
                allowed: true,
                feedback:
                    "Correcto: CC0 permite uso comercial sin permiso adicional.",
            },
            {
                id: "cc0-credit-good-practice",
                label:
                    "Atribuir al autor aunque no sea obligatorio, como buena práctica de documentación",
                allowed: true,
                feedback:
                    "Correcto: en CC0 la atribución no es obligatoria, pero puede mantenerse como buena práctica.",
            },
            {
                id: "cc0-must-share-alike",
                label:
                    "Adaptarla, pero publicar la nueva versión obligatoriamente con la misma licencia",
                allowed: false,
                feedback:
                    "No corresponde: CC0 no exige CompartirIgual ni mantener una licencia específica.",
            },
            {
                id: "cc0-no-commercial",
                label:
                    "Usarla solo en contextos educativos, porque CC0 no permite fines comerciales",
                allowed: false,
                feedback:
                    "No corresponde: CC0 permite usos comerciales y no comerciales.",
            },
        ]
    }

    return [
        {
            id: "sa-ai-edit-keep-share-alike",
            label:
                "Usar IA para mejorar color y contraste, indicando adaptación y publicando la nueva versión bajo CC BY-SA",
            allowed: true,
            feedback:
                "Correcto: CC BY-SA permite adaptaciones si atribuyes y mantienes CompartirIgual.",
        },
        {
            id: "sa-commercial-with-attribution",
            label:
                "Usarla en un material comercial indicando autor, licencia y enlace a la licencia",
            allowed: true,
            feedback:
                "Correcto: CC BY-SA permite uso comercial con atribución y respeto de condiciones.",
        },
        {
            id: "sa-blog-with-license-link",
            label:
                "Publicarla en un blog indicando autor, licencia y enlace a la página oficial de la licencia",
            allowed: true,
            feedback:
                "Correcto: la publicación es compatible si la atribución queda completa.",
        },
        {
            id: "sa-relicense-rights-reserved",
            label:
                "Adaptarla y publicar la nueva versión con todos los derechos reservados",
            allowed: false,
            feedback:
                "No corresponde: una adaptación de CC BY-SA debe mantenerse bajo la misma licencia o una compatible.",
        },
        {
            id: "sa-auto-attribution-incomplete",
            label:
                "Aceptar una atribución automática que solo dice 'Imagen de internet'",
            allowed: false,
            feedback:
                "No basta una atribución genérica: debe incluir autor, licencia y, cuando sea posible, enlace.",
        },
    ]
}

function buildOptionSet(profile: LicenseProfile): Option[] {
    const allowed = shuffle(optionBank(profile).filter((option) => option.allowed)).slice(0, 3)
    const disallowed = shuffle(optionBank(profile).filter((option) => !option.allowed)).slice(0, 2)

    return shuffle([...allowed, ...disallowed])
}

const RightsExerciseA1 = forwardRef<RightsExerciseA1Handle, Props>(
    function RightsExerciseA1({ onReadyChange, asset }, ref) {
        const [profileIndex, setProfileIndex] = useState(() => Math.floor(Math.random() * 3))
        const profiles = useMemo(
            () => licenseProfiles(asset),
            [asset?.license.short, asset?.license.url]
        )
        const profile = profiles[profileIndex] ?? profiles[0]
        const [options, setOptions] = useState<Option[]>(() => buildOptionSet(profile))
        const [selected, setSelected] = useState<string[]>([])
        const [checked, setChecked] = useState(false)

        const allAnswered = useMemo(() => selected.length > 0, [selected])

        useEffect(() => {
            onReadyChange?.(allAnswered)
        }, [allAnswered, onReadyChange])

        const toggle = (id: string) =>
            setSelected((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )

        const isCorrectChoice = (id: string) => {
            const opt = options.find((o) => o.id === id)!
            const chosen = selected.includes(id)
            return (opt.allowed && chosen) || (!opt.allowed && !chosen)
        }

        // Puntaje según el Excel (CS3.3.11): 5 opciones por escenario, 1 punto por
        // cada una correctamente marcada o correctamente descartada.
        // 5=Alto, 3-4=Medio, 0-2=Bajo.
        const computeGrade = (): RightsExerciseA1Grade => {
            const totalCount = options.length
            const correctCount = options.filter((opt) => isCorrectChoice(opt.id)).length

            let quality: A1Quality = "bad"
            if (correctCount === totalCount) {
                quality = "good" // 5 puntos: Alto
            } else if (correctCount >= 3) {
                quality = "partial" // 3-4 puntos: Medio
            } // 0-2 puntos: Bajo

            return { correctCount, totalCount, quality }
        }

        useImperativeHandle(ref, () => ({
            check() {
                if (allAnswered) setChecked(true)
            },
            isReady() {
                return allAnswered
            },
            reset() {
                const nextIndex = Math.floor(Math.random() * 3)
                const nextProfile = profiles[nextIndex] ?? profiles[0]
                setProfileIndex(nextIndex)
                setOptions(buildOptionSet(nextProfile))
                setSelected([])
                setChecked(false)
                onReadyChange?.(false)
            },
            grade() {
                const result = computeGrade()
                if (allAnswered) setChecked(true)
                return result
            },
        }))

        const title = asset?.title ?? "Imagen seleccionada"
        const author = asset?.author ?? "Autor"
        const img = asset?.imageUrl

        return (
            <div className="space-y-6 rounded-2xl border bg-white p-6">
                <div className="flex flex-col items-center">
                    <figure className="inline-block overflow-hidden rounded-xl border">
                        {img && (
                            <img
                                src={img}
                                alt={`${title} - ${author} (${profile.short})`}
                                className="block max-h-[320px] w-auto object-contain"
                            />
                        )}
                    </figure>
                    <p className="mt-2 max-w-2xl text-center text-xs text-gray-600 sm:text-sm">
                        <span className="font-medium">"{title}"</span> por{" "}
                        <span className="font-medium">{author}</span>, bajo licencia{" "}
                        <span className="group relative inline-flex">
                            <a
                                href={profile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold underline decoration-dotted underline-offset-2"
                                aria-describedby="license-tooltip"
                            >
                                {profile.short}
                            </a>
                            <span
                                id="license-tooltip"
                                role="tooltip"
                                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-72 -translate-x-1/2 rounded-xl border bg-white px-3 py-2 text-left text-xs leading-relaxed text-slate-700 shadow-lg group-hover:block group-focus-within:block"
                            >
                                {profile.tooltip}
                            </span>
                        </span>
                    </p>
                </div>

                <div className="space-y-2">
                    {options.map((opt) => {
                        const ok = checked ? isCorrectChoice(opt.id) : null
                        return (
                            <label
                                key={opt.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                                    checked
                                        ? ok
                                            ? "border-emerald-500/40 bg-emerald-50"
                                            : "border-rose-500/40 bg-rose-50"
                                        : "border-gray-200"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-1 h-5 w-5 shrink-0 rounded accent-[#286575]"
                                    checked={selected.includes(opt.id)}
                                    onChange={() => toggle(opt.id)}
                                    disabled={checked}
                                />
                                <span className="text-sm text-gray-800">{opt.label}</span>
                            </label>
                        )
                    })}
                </div>

                {checked && (
                    <div className="rounded-xl border p-3 text-xs text-gray-700">
                        <p className="mb-2 font-medium">Revisión de decisiones:</p>
                        <ul className="list-disc space-y-1 pl-5">
                            {options.map((opt) => {
                                const ok = isCorrectChoice(opt.id)
                                return (
                                    <li
                                        key={`hint-${opt.id}`}
                                        className={ok ? "text-emerald-700" : "text-rose-700"}
                                    >
                                        {opt.feedback}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>
        )
    }
)

RightsExerciseA1.displayName = "RightsExerciseA1"

export default RightsExerciseA1