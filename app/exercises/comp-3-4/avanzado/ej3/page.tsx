"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProgrammingExerciseA3, { ProgrammingExerciseA3Handle } from "@/components/ProgrammingExerciseA3"

import { useAuth } from "@/contexts/AuthContext"
import { ensureSession, finalizeSession, markAnswered } from "@/lib/testSession"
import { getPoint, getProgress, isLevelPassed, levelPoints, setPoint } from "@/lib/levelProgress"

const SCENARIO =
    "La Dirección de Asuntos Estudiantiles de una universidad recibió 8.000 respuestas abiertas de estudiantes de primer año sobre su proceso de adaptación. Antes de desplegar el proceso de análisis, el equipo debe decidir qué parte de cada tarea conviene automatizar con Python o IA, y en qué punto es necesaria la revisión humana para evitar errores antes de publicar el informe final."
const TITLE = "Análisis responsable de respuestas estudiantiles"

const COMPETENCE = "3.4"
const LEVEL = "avanzado"
const SESSION_PREFIX = "session:3.4:Avanzado"
const sessionKeyFor = (uid: string) => `${SESSION_PREFIX}:${uid}`

export default function PageProgrammingA3() {
    const exerciseRef = useRef<ProgrammingExerciseA3Handle>(null)
    const router = useRouter()
    const { user } = useAuth()

    const [sessionId, setSessionId] = useState<string | null>(null)
    const [ensuring, setEnsuring] = useState(false)

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
                console.error("No se pudo asegurar la sesión (A3):", e)
            } finally {
                setEnsuring(false)
            }
        })()
    }, [user?.uid, sessionId, ensuring])

    const handleCheck = () => {
        exerciseRef.current?.check()
    }

    const handleFinish = async () => {
        const isCorrect = exerciseRef.current?.finish() ?? false
        const point: 0 | 1 = isCorrect ? 1 : 0

        setPoint(COMPETENCE, LEVEL, 3, point)

        try {
            if (sessionId) {
                await markAnswered(sessionId, 2, isCorrect)
            }
        } catch (e) {
            console.warn("No se pudo marcar P3 (A3):", e)
        }

        const prog = getProgress(COMPETENCE, LEVEL)
        const totalPts = levelPoints(prog)
        const passed = isLevelPassed(prog)
        const score = Math.round((totalPts / 3) * 100)
        const q1 = getPoint(prog, 1)
        const q2 = getPoint(prog, 2)
        const q3 = getPoint(prog, 3)

        try {
            if (sessionId) {
                await finalizeSession(sessionId, { correctCount: totalPts, total: 3, passMin: 2 })
            }
        } catch (e) {
            console.warn("No se pudo finalizar la sesión (A3):", e)
        }

        try {
            if (user) localStorage.removeItem(sessionKeyFor(user.uid))
        } catch {}

        const qs = new URLSearchParams({
            score: String(score),
            passed: String(passed),
            correct: String(totalPts),
            total: "3",
            competence: COMPETENCE,
            level: LEVEL,
            q1: String(q1),
            q2: String(q2),
            q3: String(q3),
            ...(sessionId ? { sid: sessionId } : {}),
        })

        router.push(`/test/comp-3-4-avanzado?${qs.toString()}`)
    }

    const progressPct = (3 / 3) * 100

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
                                {COMPETENCE} Pensamiento computacional y programación — Nivel Avanzado
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-8 pt-4">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#286575] sm:text-sm font-medium bg-white/10 px-2 py-1 rounded-full">
                            Ejercicio 3 de 3
                        </span>
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-[#286575]" />
                            <div className="w-3 h-3 rounded-full bg-[#286575]" />
                            <div className="w-3 h-3 rounded-full bg-[#286575]" />
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
                            <h2 className="font-semibold text-gray-800 mb-2">{TITLE}</h2>
                            <p className="text-gray-700 font-medium">{SCENARIO}</p>
                        </div>

                        <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-4 py-2 rounded-full inline-block mb-6">
                            <b>Decide</b> qué herramienta usar en cada actividad y ordena las etapas antes de publicar el informe
                        </p>

                        <ProgrammingExerciseA3 ref={exerciseRef} />

                        <div className="mt-6 flex items-center justify-between">
                            <Button
                                asChild
                                className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleCheck}
                                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                                >
                                    Comprobar
                                </Button>
                                <Button
                                    onClick={handleFinish}
                                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                                >
                                    Finalizar nivel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}