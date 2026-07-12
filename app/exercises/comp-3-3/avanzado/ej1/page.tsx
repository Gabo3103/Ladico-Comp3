"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useLadicoSession } from "@/hooks/useLadicoSession"
import { setPoint } from "@/lib/levelProgress"
import { getOrCreateSeed } from "@/lib/caseSeed"

import RightsExerciseA1, {
    RightsExerciseA1Handle,
} from "@/components/RightsExerciseA1"

import { normalizeCountry } from "@/lib/userCountry"
import {
    pickAssetForCountry,
    type CountryCode,
    type ImageAsset,
} from "@/data/imageBank"

const SCENARIO =
    "Encontraste esta fotografía en la web y quieres reutilizarla en distintos contextos digitales, incluyendo ediciones hechas con herramientas que pueden sugerir cambios o atribuciones automáticas. Selecciona qué usos respetan correctamente la licencia."
const COMPETENCE = "3.3"
const LEVEL = "avanzado"
const PREFIX = "session:3.3:Avanzado"
const FALLBACK_COUNTRY: CountryCode = "CL"

export default function PageEj1_33_Avanzado_Select() {
    const router = useRouter()
    const { user, userData, loading: authLoading, isProfesor, isAdmin } = useAuth()
    const demoMode = isProfesor || isAdmin
    const { mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX)

    const exRef = useRef<RightsExerciseA1Handle>(null)
    const [ready, setReady] = useState(false)
    const [saving, setSaving] = useState(false)
    const [seed] = useState(() => getOrCreateSeed(COMPETENCE, LEVEL, 1))

    const [country, setCountry] = useState<CountryCode | null>(null)
    const [asset, setAsset] = useState<ImageAsset | null>(null)
    const [loading, setLoading] = useState(true)

    const progressPct = (1 / 3) * 100

    useEffect(() => {
        if (authLoading) {
            setLoading(true)
            setAsset(null)
            setCountry(null)
            return
        }

        const resolvedCountry = user
            ? normalizeCountry(userData?.country)
            : FALLBACK_COUNTRY

        if (!resolvedCountry) {
            setCountry(null)
            setAsset(null)
            setLoading(false)
            return
        }

        const picked = pickAssetForCountry(resolvedCountry)
        setCountry(resolvedCountry)
        setAsset(picked)
        setLoading(false)
    }, [authLoading, user, userData?.country])

    const handleNext = async () => {
        if (!exRef.current) return
        setSaving(true)
        const result = exRef.current.grade({ silent: true })
        const ok = result.quality === "good" || result.quality === "partial"
        setPoint(COMPETENCE, LEVEL, 1, ok ? 1 : 0)
        await mark(0, ok)
        setSaving(false)
        router.push("/exercises/comp-3-3/avanzado/ej2")
    }

    return (
        <div className="min-h-screen bg-[#f3fbfb]">
            <div className="rounded-b-xl border-b border-white/10 bg-white/20 backdrop-blur-sm">
                <div className="mx-auto max-w-6xl px-4 py-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="shrink-0">
                                <img
                                    src="/ladico_green.png"
                                    alt="Ladico Logo"
                                    className="h-9 w-9 cursor-pointer object-contain transition-opacity hover:opacity-80"
                                />
                            </Link>

                            <span className="rounded-full bg-white/10 px-2 py-1 text-center text-[#2e6372] opacity-80 sm:px-3 sm:text-sm">
                                {COMPETENCE} Derechos de autor y licencias - Nivel{" "}
                                {LEVEL.charAt(0).toUpperCase() + LEVEL.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 pb-8 pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-[#286575] sm:text-sm">
                        Ejercicio 1 de 3
                    </span>
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-[#dde3e8] sm:w-36">
                        <div
                            className="h-full rounded-full bg-[#286575] transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                <Card className="rounded-3xl border-0 bg-white shadow-2xl ring-2 ring-[#286575] ring-opacity-30">
                    <CardContent className="p-6 lg:p-8">
                        <div className="mb-6 rounded-2xl border-l-4 border-[#286575] bg-gray-50 p-6">
                            <p className="font-medium text-gray-700">{SCENARIO}</p>
                        </div>


                        {loading ? (
                            <div className="text-sm text-gray-500">
                                Cargando componentes...
                            </div>
                        ) : asset ? (
                            <RightsExerciseA1
                                ref={exRef}
                                onReadyChange={setReady}
                                seed={seed}
                                asset={{
                                    title: asset.title,
                                    author: asset.author,
                                    imageUrl: asset.imageUrl,
                                    license: asset.license,
                                }}
                            />
                        ) : (
                            <div className="text-sm text-rose-600">
                                No se encontró una región válida para seleccionar la imagen.
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <Button
                                asChild
                                className="rounded-2xl bg-[#286675] px-6 py-2 font-medium text-white shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <div className="flex gap-3">
                                {demoMode && (
                                    <Button
                                        onClick={() => exRef.current?.grade()}
                                        disabled={!ready || loading || !asset}
                                        variant="outline"
                                        className="rounded-2xl border-[#286675] px-6 py-2 font-medium text-[#286675] shadow-sm hover:bg-[#e4f3f5] disabled:opacity-50"
                                    >
                                        Comprobar
                                    </Button>
                                )}

                                <Button
                                    onClick={handleNext}
                                    disabled={saving || !ready || loading || !asset}
                                    className="rounded-2xl bg-[#286675] px-6 py-2 font-medium text-white shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
                                >
                                    {saving ? "Guardando..." : "Siguiente"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
