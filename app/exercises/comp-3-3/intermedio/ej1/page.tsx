"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { ensureSession, markAnswered } from "@/lib/testSession"
import { setPoint } from "@/lib/levelProgress"
import { getOrCreateSeed } from "@/lib/caseSeed"

import RightsExerciseI1, {
    RightsExerciseI1Handle,
} from "@/components/RightsExerciseI1"

const SCENARIO =
    "Estás trabajando con distintos recursos digitales: imágenes, íconos e infografías, cada uno con una licencia distinta. Revisa la licencia de cada caso y elige la acción que sí está permitida según esa licencia."
const COMPETENCE = "3.3"
const LEVEL = "intermedio"
const SESSION_PREFIX = "session:3.3:Intermedio"
const sessionKeyFor = (uid: string) => `${SESSION_PREFIX}:${uid}`

export default function PageEj1_33_Intermedio() {
    const router = useRouter()
    const { user, isProfesor, isAdmin } = useAuth()
    const demoMode = isProfesor || isAdmin

    const exRef = useRef<RightsExerciseI1Handle>(null)
    const [ready, setReady] = useState(false)
    const [seed] = useState(() => getOrCreateSeed(COMPETENCE, LEVEL, 1))

    const [sessionId, setSessionId] = useState<string | null>(null)
    const ensuringRef = useRef(false)
    const [saving, setSaving] = useState(false)

    const progressPct = (1 / 3) * 100

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
        const cached =
            typeof window !== "undefined" ? localStorage.getItem(key) : null
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
                console.error("No se pudo asegurar la sesion (3.3 P1):", e)
            } finally {
                ensuringRef.current = false
            }
        })()
    }, [user?.uid, sessionId])

    const handleNext = async () => {
        if (!exRef.current) return

        const result = exRef.current.grade({ silent: true })
        const isCorrectForScore =
            result.quality === "good" || result.quality === "partial"
        const point: 0 | 1 = isCorrectForScore ? 1 : 0

        setSaving(true)
        setPoint(COMPETENCE, LEVEL, 1, point)

        try {
            if (sessionId) {
                await markAnswered(sessionId, 0, isCorrectForScore)
            }
        } catch (e) {
            console.warn("No se pudo marcar 3.3 P1:", e)
        } finally {
            setSaving(false)
        }

        router.push("/exercises/comp-3-3/intermedio/ej2")
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


                        <RightsExerciseI1 ref={exRef} onReadyChange={setReady} seed={seed} />

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
