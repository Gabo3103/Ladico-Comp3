"use client"

import Link from "next/link"
import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProgrammingExerciseA1, { ProgrammingExerciseA1Handle } from "@/components/ProgrammingExerciseA1"

import { useAuth } from "@/contexts/AuthContext"
import { ensureSession, markAnswered } from "@/lib/testSession"
import { setPoint } from "@/lib/levelProgress"
import { getOrCreateSeed } from "@/lib/caseSeed"

const TITLE = ""
const SCENARIO =
    "Una biblioteca escolar quiere automatizar un robot que traslada libros desde el punto A hasta el punto B varias veces al día. Una IA generó una propuesta inicial de instrucciones para resolver el recorrido, pero quedó incompleta. Debes corregirla y completarla hasta que el robot llegue al destino."

const COMPETENCE = "3.4"
const LEVEL = "avanzado"
const SESSION_PREFIX = "session:3.4:Avanzado"
const sessionKeyFor = (uid: string) => `${SESSION_PREFIX}:${uid}`

export default function PageBlocklyMaze() {
    const router = useRouter()
    const { user, isProfesor, isAdmin } = useAuth()
    const demoMode = isProfesor || isAdmin
    const exRef = useRef<ProgrammingExerciseA1Handle>(null)

    const [sessionId, setSessionId] = useState<string | null>(null)
    const [ensuring, setEnsuring] = useState(false)
    const [saving, setSaving] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [ready, setReady] = useState(false)
    const [seed] = useState(() => getOrCreateSeed(COMPETENCE, LEVEL, 1))

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
        if (cached) return
        if (ensuring) return

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
                console.error("No se pudo asegurar sesión (A1):", e)
            } finally {
                setEnsuring(false)
            }
        })()
    }, [user?.uid, sessionId, ensuring])

    const handleCheck = () => {
        const mazeOk = Boolean(exRef.current?.check())
        setFeedback(
            mazeOk
                ? "Automatización validada: corregiste y completaste la propuesta hasta lograr una secuencia ejecutable."
                : "Aún no está validado: ejecuta o corrige la secuencia hasta que el robot llegue al punto B."
        )
        return mazeOk
    }

    const handleNext = async () => {
        if (!exRef.current) return
        const isCorrect = Boolean(exRef.current.check())
        const point: 0 | 1 = isCorrect ? 1 : 0

        setSaving(true)
        setPoint(COMPETENCE, LEVEL, 1, point)

        try {
            if (sessionId) {
                await markAnswered(sessionId, 0, isCorrect)
            }
        } catch (e) {
            console.warn("No se pudo marcar P1 (A1):", e)
        } finally {
            setSaving(false)
        }

        router.push("/exercises/comp-3-4/avanzado/ej2")
    }

    const progressPct = (1 / 3) * 100

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
                                3.4 Pensamiento computacional y programación — Nivel Avanzado
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-8 pt-4">
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
                        <div className="mb-6 bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                            <h2 className="font-semibold text-gray-800 mb-2">{TITLE}</h2>
                            <p className="text-gray-700 font-medium">{SCENARIO}</p>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-4 py-2 rounded-full inline-block">
                                Revisa la propuesta inicial cargada en el editor, corrígela y complétala. Luego presiona <b>Ejecutar</b> en el laberinto.
                            </p>
                        </div>

                        <div className="w-full">
                            <ProgrammingExerciseA1
                                ref={exRef}
                                onAttemptsExhausted={handleNext}
                                onReadyChange={setReady}
                                seed={seed}
                            />
                        </div>

                        {demoMode && feedback && (
                            <div
                                className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                                    feedback.startsWith("Automatización validada")
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-rose-200 bg-rose-50 text-rose-700"
                                }`}
                            >
                                {feedback}
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <Button
                                asChild
                                className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <div className="flex items-center gap-3">
                                {demoMode && (
                                    <Button
                                        onClick={handleCheck}
                                        variant="outline"
                                        className="px-6 py-2 rounded-2xl border-[#286675] text-[#286675] font-medium shadow-sm hover:bg-[#e4f3f5]"
                                    >
                                        Validar
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
