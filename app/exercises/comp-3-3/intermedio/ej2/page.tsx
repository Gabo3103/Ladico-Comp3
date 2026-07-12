"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useLadicoSession } from "@/hooks/useLadicoSession"
import { setPoint } from "@/lib/levelProgress"

import RightsExerciseI2, {
    RightsExerciseI2Handle,
} from "@/components/RightsExerciseI2"

const SCENARIO =
    "Estás preparando un post de Instagram para una campaña sobre bienestar digital. Para diseñarlo, quieres usar una foto, un ícono, una imagen tomada de una noticia y un recurso visual editado con una herramienta que incorpora funciones generadas por IA."

const COMPETENCE = "3.3"
const LEVEL = "intermedio"
const PREFIX = "session:3.3:Intermedio"

export default function PageEj2_33_Intermedio() {
    const router = useRouter()
    const { isProfesor, isAdmin } = useAuth()
    const demoMode = isProfesor || isAdmin
    const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX)

    const exRef = useRef<RightsExerciseI2Handle>(null)
    const [ready, setReady] = useState(false)
    const [saving, setSaving] = useState(false)

    const progressPct = (2 / 3) * 100

    const handleNext = async () => {
        if (!exRef.current) return
        setSaving(true)
        const result = exRef.current.grade({ silent: true })
        const ok = result.quality === "good" || result.quality === "partial"
        setPoint(COMPETENCE, LEVEL, 2, ok ? 1 : 0)
        await mark(1, ok)
        setSaving(false)
        router.push("/exercises/comp-3-3/intermedio/ej3")
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
                                3.3 Derechos de autor y licencias - Nivel Intermedio
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 pb-8 pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-[#286575] sm:text-sm">
                        Ejercicio 2 de 3
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


                        <RightsExerciseI2 ref={exRef} onReadyChange={setReady} />

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
                                        disabled={!ready}
                                        variant="outline"
                                        className="rounded-2xl border-[#286675] px-6 py-2 font-medium text-[#286675] shadow-sm hover:bg-[#e4f3f5] disabled:opacity-50"
                                    >
                                        Comprobar
                                    </Button>
                                )}

                                <Button
                                    onClick={handleNext}
                                    disabled={saving || !ready}
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
