"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

import RightsExerciseI3Select, {
    RightsExerciseI3SelectHandle,
} from "@/components/RightsExerciseI3Select"

import { getUserCountry } from "@/lib/userCountry"
import {
    pickAssetForCountry,
    DEFAULT_COUNTRY,
    type CountryCode,
    type ImageAsset,
} from "@/data/imageBank"


const SCENARIO =
    "Encontraste esta fotografía en la web. Selecciona qué usos están permitidos para esta imagen."
const COMPETENCE = "3.3"
const LEVEL = "avanzado"
const DEBUG = false 


export default function PageEj3_33_Intermedio_Select() {
    const exRef = useRef<RightsExerciseI3SelectHandle>(null)
    const [checking, setChecking] = useState(false)
    const [ready, setReady] = useState(false)

    const { user } = useAuth()

    const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY)
    const [asset, setAsset] = useState<ImageAsset | null>(null)
    const [loading, setLoading] = useState(true)

    const progressPct = (1 / 3) * 100

    useEffect(() => {
        let cancelled = false
        ;(async () => {
        try {
            // 1) Obtén país del usuario
            const ctry: CountryCode =
            (user?.uid && (await getUserCountry(user.uid))) || DEFAULT_COUNTRY

            // 2) Elige asset por país
            const picked = pickAssetForCountry(ctry)

            if (!cancelled) {
            setCountry(ctry)
            setAsset(picked)
            setLoading(false)
            if (DEBUG) {
                console.log("[Ej3] country:", ctry, "asset:", picked)
            }
            }
        } catch (e) {
            if (!cancelled) {
            setCountry(DEFAULT_COUNTRY)
            setAsset(pickAssetForCountry(DEFAULT_COUNTRY))
            setLoading(false)
            if (DEBUG) {
                // eslint-disable-next-line no-console
                console.warn("[Ej3] fallback a DEFAULT_COUNTRY por error:", e)
            }
            }
        }
        })()
        return () => {
        cancelled = true
        }
    }, [user?.uid])

    const onCheck = () => {
        if (!exRef.current) return
        setChecking(true)
        exRef.current.check()
        setChecking(false)
    }

    return (
        <div className="min-h-screen bg-[#f3fbfb]">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-sm border-b border-white/10 rounded-b-xl">
            <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <Link href="/dashboard" className="shrink-0">
                    <img
                    src="/ladico_green.png"
                    alt="Ladico Logo"
                    className="w-24 h-24 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    />
                </Link>

                <span className="text-[#2e6372] sm:text-sm opacity-80 bg-white/10 px-2 sm:px-3 py-1 rounded-full text-center">
                    {COMPETENCE} Derechos de autor y licencias — Nivel {LEVEL.charAt(0).toUpperCase() + LEVEL.slice(1)}
                </span>
                </div>
            </div>
            </div>
        </div>

        {/* Contenido */}
        <div className="max-w-6xl mx-auto px-4 pb-8 pt-4">
            {/* Progreso */}
            <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#286575] sm:text-sm font-medium bg-white/10 px-2 py-1 rounded-full">
                Ejercicio 1 de 3
                </span>
                <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#286575]" />
                <div className="w-3 h-3 rounded-full bg-[#dde3e8]" />
                <div className="w-3 h-3 rounded-full bg-[#dde3e8]" />
                </div>
            </div>
            <div className="bg-[#dde3e8] rounded-full h-2.5 overflow-hidden">
                <div
                className="h-full bg-[#286575] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
                />
            </div>
            </div>

            <Card className="bg-white shadow-2xl rounded-3xl border-0 ring-2 ring-[#286575] ring-opacity-30">
            <CardContent className="p-6 lg:p-8">
                {/* Escenario */}
                <div className="mb-6 bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                <p className="text-gray-700 font-medium">{SCENARIO}</p>
                </div>

                {/* Instrucción */}
                <div className="mb-6">
                <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-4 py-2 rounded-full inline-block">
                    Marca <b>solo</b> los usos permitidos por la <b>licencia</b>
                </p>
                </div>

                {/* Debug visible*/}
                {DEBUG && (
                <div className="mb-4 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div><b>DEBUG</b></div>
                    <div>country: <code>{country}</code></div>
                    <div>asset.title: <code>{asset?.title ?? "—"}</code></div>
                    <div>asset.author: <code>{asset?.author ?? "—"}</code></div>
                    <div>asset.license: <code>{asset?.license.short ?? "—"}</code></div>
                </div>
                )}

                {/* Ejercicio */}
                {loading ? (
                <div className="text-sm text-gray-500">Cargando imagen para tu país…</div>
                ) : asset ? (
                <RightsExerciseI3Select
                    ref={exRef}
                    onReadyChange={setReady}
                    asset={{
                    title: asset.title,
                    author: asset.author,
                    imageUrl: asset.imageUrl,
                    license: asset.license,
                    }}
                />
                ) : (
                <div className="text-sm text-rose-600">
                    No se encontró un recurso para tu país. Se mostrará el fallback por defecto.
                </div>
                )}

                {/* Acciones */}
                <div className="mt-6 flex items-center justify-between">
                <Button
                    asChild
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                >
                    <Link href="/dashboard">Terminar</Link>
                </Button>

                <Button
                    onClick={onCheck}
                    disabled={checking || !ready || loading || !asset}
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
                >
                    {checking ? "Comprobando…" : "Comprobar"}
                </Button>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    )
}
