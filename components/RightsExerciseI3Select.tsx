"use client"

import React, {
    useState,
    useMemo,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react"


export type RightsExerciseI3SelectHandle = {
    check: () => void
    isReady: () => boolean
    reset: () => void
    }

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

    type Option = {
    id: string
    label: string
    allowed: boolean
    }

    const RightsExerciseI3Select = forwardRef<RightsExerciseI3SelectHandle, Props>(
    function RightsExerciseI3Select({ onReadyChange, asset }, ref) {
        const options: Option[] = 
        [
            {
                id: "book-by-sa",
                label:
                "Usarla en un libro comercial indicando “Foto: Autor — CC BY-SA 4.0” en la sección de créditos",
                allowed: true, 
            },
            {
                id: "ngo-poster-by-only",
                label:
                "Usarla en un cartel para una ONG indicando solo “Foto: Autor”",
                allowed: false, 
            },
            {
                id: "family-wallpaper",
                label:
                "Recortarla y usarla como fondo de pantalla en la computadora familiar sin publicarla en ningún sitio",
                allowed: true, 
            },
            {
                id: "no-attrib",
                label:
                "Re-subirla a tu sitio sin ninguna atribución al autor “para que se vea más limpio”",
                allowed: false, 
            },
            {
                id: "blog-unaltered-link-license",
                label:
                "Publicarla sin cambios en tu blog indicando “Foto: Autor” y añadiendo un enlace a la página oficial de la licencia",
                allowed: true, 
            },
            {
                id: "derivative-wrong-nd",
                label:
                "Añadir texto y gráficos y publicarla indicando “Foto original de Autor — CC BY-ND 4.0”",
                allowed: false, 
            },
            {
                id: "bw-derivative-sa",
                label:
                "Convertirla a blanco y negro y publicarla indicando “Adaptada de foto de Autor — CC BY-SA 4.0”",
                allowed: true, 
            },
            {
                id: "relicense-nc-sa",
                label:
                "Blanquearla y publicarla como “CC BY-NC-SA 4.0” para impedir usos comerciales de tu versión",
                allowed: false, 
            },
        ]


        // Estado
        const [selected, setSelected] = useState<string[]>([])
        const [checked, setChecked] = useState(false)

        const allAnswered = useMemo(() => selected.length > 0, [selected])

        useEffect(() => {
        onReadyChange?.(allAnswered)
        }, [allAnswered, onReadyChange])

        const toggle = (id: string) =>
        setSelected(prev =>
            prev.includes(id)
            ? prev.filter(x => x !== id)
            : [...prev, id]
        )

        const isCorrectChoice = (id: string) => {
        const opt = options.find(o => o.id === id)!
        const chosen = selected.includes(id)
        return (opt.allowed && chosen) || (!opt.allowed && !chosen)
        }

        const expectedHint = (opt: Option) =>
        opt.allowed
            ? "✔ Debe estar seleccionada (uso permitido por CC BY-SA)."
            : "✖ No debe seleccionarse (viola las condiciones de la licencia)."

        useImperativeHandle(ref, () => ({
        check() {
            if (allAnswered) setChecked(true)
        },
        isReady() {
            return allAnswered
        },
        reset() {
            setSelected([])
            setChecked(false)
            onReadyChange?.(false)
        },
        }))

        // Datos del asset 
        const title = asset?.title
        const author = asset?.author 
        const img = asset?.imageUrl 
        const licShort = asset?.license.short ?? "CC BY-SA 4.0"
        const licUrl = asset?.license.url ?? "https://creativecommons.org/licenses/by-sa/4.0/"

        return (
        <div className="rounded-2xl border bg-white p-6 space-y-6">
            {/* Imagen con atribución */}
            <figure className="rounded-xl overflow-hidden border">
            <img
                src={img}
                alt={`${title} — ${author} (${licShort})`}
                className="w-full h-auto object-cover"
            />
            <figcaption className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3">
                <span className="font-medium">“{title}”</span> por{" "}
                <span className="font-medium">{author}</span>, bajo licencia{" "}
                <a
                href={licUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                >
                {licShort}
                </a>
            </figcaption>
            </figure>



            {/* Lista de opciones */}
            <div className="space-y-2">
            {options.map(opt => {
                const ok = checked ? isCorrectChoice(opt.id) : null
                return (
                <label
                    key={opt.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${
                    checked
                        ? ok
                        ? "border-emerald-500/40"
                        : "border-rose-500/40"
                        : "border-gray-200"
                    }`}
                >
                    <input
                    type="checkbox"
                    className="mt-1"
                    checked={selected.includes(opt.id)}
                    onChange={() => toggle(opt.id)}
                    disabled={checked}
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                </label>
                )
            })}
            </div>

            {/* Feedback global */}
            {checked && (
            <div className="rounded-xl border p-3 text-xs text-gray-700">
                <p className="font-medium mb-2">Pistas:</p>
                <ul className="list-disc list-inside space-y-1">
                {options.map(opt => {
                    const ok = isCorrectChoice(opt.id)
                    return (
                    <li
                        key={`hint-${opt.id}`}
                        className={ok ? "text-emerald-600" : "text-rose-600"}
                    >
                        {expectedHint(opt)}
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

export default RightsExerciseI3Select
