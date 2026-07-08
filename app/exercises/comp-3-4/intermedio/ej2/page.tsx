"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProgrammingExerciseI2, { ProgrammingExerciseI2Handle } from "@/components/ProgrammingExerciseI2"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ensureSession, markAnswered } from "@/lib/testSession"
import { setPoint } from "@/lib/levelProgress"

const SCENARIO =
    "Participas en un proyecto donde se debe crear una solución digital o un sistema de IA sencillo. Ordena las etapas para pasar desde la definición del problema hasta la validación y publicación responsable."

const COMPETENCE = "3.4"
const LEVEL = "intermedio"
const SESSION_PREFIX = "session:3.4:Intermedio"
const sessionKeyFor = (uid: string) => `${SESSION_PREFIX}:${uid}`

export default function SandboxProgrammingPage2() {
    const router = useRouter()
    const { user } = useAuth()

    const [sessionId, setSessionId] = useState<string | null>(null)
    const ensuringRef = useRef(false)
    const [saving, setSaving] = useState(false)
    const [approved, setApproved] = useState(false)

    const exRef = useRef<ProgrammingExerciseI2Handle>(null)

    useEffect(() => {
        if (!user || typeof window === "undefined") return
        const sid = localStorage.getItem(sessionKeyFor(user.uid))
        if (sid) setSessionId(sid)
    }, [user?.uid])

    useEffect(() => {
        if (!user) {
            setSessionId(null)
            return
        }

        const key = sessionKeyFor(user.uid)
        const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null

        if (cached) {
            if (!sessionId) setSessionId(cached)
            return
        }

        if (ensuringRef.current) return
        ensuringRef.current = true
        ;(async () => {
            try {
                const { id } = await ensureSession({
                    userId: user.uid,
                    competence: COMPETENCE,
                    level: "Intermedio",
                    totalQuestions: 3,
                })
                setSessionId(id)
                if (typeof window !== "undefined") localStorage.setItem(key, id)
            } catch (e) {
                console.error("No se pudo asegurar la sesión:", e)
            } finally {
                ensuringRef.current = false
            }
        })()
    }, [user?.uid, sessionId])

    const handleCheck = () => {
        if (!exRef.current) return
        exRef.current.check()
        const result = exRef.current.grade()
        setApproved(result.quality === "good" || result.quality === "partial")
    }

    const handleNext = async () => {
        if (!exRef.current) return
        exRef.current.check()
        const result = exRef.current.grade()
        const isCorrect = result.quality === "good" || result.quality === "partial"
        setApproved(isCorrect)
        setSaving(true)
        const point: 0 | 1 = isCorrect ? 1 : 0

        setPoint(COMPETENCE, LEVEL, 2, point)

        try {
            if (sessionId) {
                await markAnswered(sessionId, 1, isCorrect)
            }
        } catch (e) {
            console.warn("No se pudo marcar P2:", e)
        } finally {
            setSaving(false)
        }

        router.push("/exercises/comp-3-4/intermedio/ej3")
    }

    const progressPct = (2 / 3) * 100

    return (
        <div className="min-h-screen bg-[#f3fbfb]">
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
                                3.4 Pensamiento computacional y programación — Nivel Intermedio
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-8 pt-4">
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
                        <div className="mb-6 bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                            <p className="text-gray-700 font-medium">{SCENARIO}</p>
                        </div>

                        <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-4 py-2 rounded-full inline-block mb-6">
                            Ordena las <b>etapas del ciclo de desarrollo</b> antes de publicar la solución
                        </p>

                        <ProgrammingExerciseI2 ref={exRef} />

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <Button
                                asChild
                                className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleCheck}
                                    variant="outline"
                                    className="px-6 py-2 rounded-2xl border-[#286675] text-[#286675] font-medium shadow-sm hover:bg-[#e4f3f5]"
                                >
                                    Comprobar
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    disabled={saving || !approved}
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