"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import RightsExerciseI2Mini, {
    RightsExerciseI2MiniHandle,
} from "@/components/RightsExerciseI2Mini"

const SCENARIO =
    "Estás buscando material para realizar un post en Instagram sobre un tema de interés. Evalúa si puedes usar cada recurso y, cuando aplique, cómo atribuirlo en la publicación."

const COMPETENCE = "3.3"
const LEVEL = "intermedio"

export default function PageEj2_33_Intermedio() {
    const exRef = useRef<RightsExerciseI2MiniHandle>(null)
    const [checking, setChecking] = useState(false)
    const [ready, setReady] = useState(false)

    const progressPct = (2 / 3) * 100

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
                    3.3 Derechos de autor y licencias — Nivel Intermedio
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
                Ejercicio 2 de 3
                </span>
                <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#286575]" />
                <div className="w-3 h-3 rounded-full bg-[#286575]" />
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
                    Para cada recurso, <b>indica</b> si puede usarse 
                </p>
                </div>

                {/* Ejercicio */}
                <RightsExerciseI2Mini ref={exRef} onReadyChange={setReady} />

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
                    disabled={checking || !ready}
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
