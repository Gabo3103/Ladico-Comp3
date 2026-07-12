"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProgrammingExerciseA2, { ProgrammingExerciseA2Handle } from "@/components/ProgrammingExerciseA2"

import { useAuth } from "@/contexts/AuthContext"
import { ensureSession, markAnswered } from "@/lib/testSession"
import { setPoint } from "@/lib/levelProgress"
import { getOrCreateSeed } from "@/lib/caseSeed"

const SCENARIO =
    "Una tienda de flores quiere automatizar tareas que hoy se repiten manualmente cada semana, usando la tabla FLORES (id, nombre y precio de cada flor). Revisa la instrucción inicial, corrígela si es necesario, elige la salida que realmente automatiza la tarea y valida que el resultado sea el esperado."
const TITLE = ""

const COMPETENCE = "3.4"
const LEVEL = "avanzado"
const SESSION_PREFIX = "session:3.4:Avanzado"
const sessionKeyFor = (uid: string) => `${SESSION_PREFIX}:${uid}`

export default function SandboxSQLPage() {
    const router = useRouter()
    const { user, isProfesor, isAdmin } = useAuth()
    const demoMode = isProfesor || isAdmin
    const exRef = useRef<ProgrammingExerciseA2Handle>(null)

    const [sessionId, setSessionId] = useState<string | null>(null)
    const [ensuring, setEnsuring] = useState(false)
    const [saving, setSaving] = useState(false)
    const [ready, setReady] = useState(false)
    const [seed] = useState(() => getOrCreateSeed(COMPETENCE, LEVEL, 2))

    useEffect(() => {
        if (!user || typeof window === "undefined") return
        const sid = localStorage.getItem(sessionKeyFor(user.uid))
        if (sid) setSessionId(sid)
    }, [user?.uid])

    useEffect(() => {
        if (!user) return
        const key = sessionKeyFor(user.uid)
        const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null

        if (cached && !sessionId) {
            setSessionId(cached)
            return
        }
        if (cached || ensuring) return

        setEnsuring(true)
        ;(async () => {
            try {
                const { id } = await ensureSession({
                    userId: user.uid,
                    competence: COMPETENCE,
                    level: "Avanzado",
                    totalQuestions: 3,
                })
                setSessionId(id)
                localStorage.setItem(key, id)
            } catch (e) {
                console.error("No se pudo asegurar sesión (A2):", e)
            } finally {
                setEnsuring(false)
            }
        })()
    }, [user?.uid, sessionId, ensuring])

    const handleNext = async () => {
        if (!exRef.current) return
        const isCorrect = exRef.current.finish({ silent: true })
        const point: 0 | 1 = isCorrect ? 1 : 0

        setSaving(true)
        setPoint(COMPETENCE, LEVEL, 2, point)

        try {
            if (sessionId) {
                await markAnswered(sessionId, 1, isCorrect)
            }
        } catch (e) {
            console.warn("No se pudo marcar P2 (A2):", e)
        } finally {
            setSaving(false)
        }

        router.push("/exercises/comp-3-4/avanzado/ej3")
    }

    const progressPct = (2 / 3) * 100

    return (
        <div className="min-h-screen bg-[#f3fbfb]">
            <div className="bg-white/20 backdrop-blur-sm border-b border-white/10 rounded-b-xl">
                <div className="max-w-6xl mx-auto px-4 py-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="shrink-0">
                                <img
                                    src="/ladico_green.png"
                                    alt="Ladico Logo"
                                    className="w-9 h-9 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                />
                            </Link>

                            <span className="text-[#2e6372] sm:text-sm opacity-80 bg-white/10 px-2 sm:px-3 py-1 rounded-full text-center">
                                3.4 Pensamiento computacional y programación — Nivel Avanzado
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-8 pt-4">
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

                <Card className="bg-white shadow-2xl rounded-3xl border-0 ring-2 ring-[#286575] ring-opacity-30">
                    <CardContent className="p-6 lg:p-8">
                        <h1 className="text-2xl font-bold text-[#286575] mb-2">{TITLE}</h1>

                        <div className="mb-6 bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                            <p className="text-gray-700 font-medium">{SCENARIO}</p>
                        </div>

                        <ProgrammingExerciseA2 ref={exRef} onReadyChange={setReady} seed={seed} />

                        <div className="mt-6 flex items-center justify-between">
                            <Button
                                asChild
                                className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <div className="flex items-center gap-3">
                                {demoMode && (
                                    <Button
                                        onClick={() => exRef.current?.check()}
                                        disabled={!ready}
                                        className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
                                    >
                                        Comprobar
                                    </Button>
                                )}

                                <Button
                                    onClick={handleNext}
                                    disabled={saving || !ready}
                                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
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