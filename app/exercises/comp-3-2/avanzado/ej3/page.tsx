"use client";

import Link from "next/link";
import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLadicoSession } from "@/hooks/useLadicoSession";
import { getProgress, setPoint, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress";
import { getOrCreateSeed } from "@/lib/caseSeed";
import IntegrationExerciseA3Carousel, {
    type IntegrationExerciseA3CarouselHandle,
} from "@/components/IntegrationExerciseA3Carousel";

const COMPETENCE = "3.2";
const LEVEL = "avanzado";
const PREFIX = "session:3.2:Avanzado";

export default function PageEj3_32_Avanzado() {
    const router = useRouter();
    const { isProfesor, isAdmin } = useAuth();
    const demoMode = isProfesor || isAdmin;
    const { sessionId, mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX);

    const progressPct = (3 / 3) * 100;
    const exRef = useRef<IntegrationExerciseA3CarouselHandle>(null);
    const [ready, setReady] = useState(false);
    const [saving, setSaving] = useState(false);
    const [seed] = useState(() => getOrCreateSeed(COMPETENCE, LEVEL, 3));

    const handleFinish = async () => {
        if (!exRef.current) return;
        setSaving(true);
        const ok = exRef.current.check({ silent: true });
        setPoint(COMPETENCE, LEVEL, 3, ok ? 1 : 0);
        const sid = await mark(2, ok);

        const prog = getProgress(COMPETENCE, LEVEL);
        const totalPts = levelPoints(prog);
        const passed = isLevelPassed(prog);
        const score = Math.round((totalPts / 3) * 100);

        const qs = new URLSearchParams({
            score: String(score),
            passed: String(passed),
            correct: String(totalPts),
            total: "3",
            competence: COMPETENCE,
            level: LEVEL,
            q1: String(getPoint(prog, 1)),
            q2: String(getPoint(prog, 2)),
            q3: String(getPoint(prog, 3)),
            ...(sid ?? sessionId ? { sid: (sid ?? sessionId) as string } : {}),
        });

        setSaving(false);
        router.push(`/test/comp-3-2-avanzado?${qs.toString()}`);
    };

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
                                {COMPETENCE} Integración y reelaboración de contenido digital - Nivel{" "}
                                {LEVEL.charAt(0).toUpperCase() + LEVEL.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 pb-8 pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-[#286575] sm:text-sm">
                        Ejercicio 3 de 3
                    </span>
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-[#dde3e8] sm:w-36">
                        <div
                            className="h-full rounded-full bg-[#286575] transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                <Card className="rounded-3xl border-0 bg-white shadow-2xl ring-2 ring-[#286575] ring-opacity-30">
                    <CardContent className="space-y-6 p-6 lg:p-8">
                        <div className="rounded-2xl border-l-4 border-[#286575] bg-gray-50 p-6">
                            <p className="text-gray-700">
                                Debes adaptar un contenido extenso a un formato breve y visual.
                                Responde qué contenido conservar, cómo estructurarlo, qué elementos
                                visuales incorporar y cómo usar las herramientas de apoyo.
                            </p>
                        </div>

                        <IntegrationExerciseA3Carousel
                            ref={exRef}
                            onReadyChange={setReady}
                            seed={seed}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <Button
                                asChild
                                className="rounded-2xl bg-[#286675] px-6 py-2 font-medium text-white shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <div className="flex gap-3">
                                {demoMode && (
                                    <Button
                                        disabled={!ready}
                                        variant="outline"
                                        className="rounded-2xl border-[#286675] px-6 py-2 font-medium text-[#286675] shadow-sm hover:bg-[#e4f3f5] disabled:opacity-50"
                                        onClick={() => exRef.current?.check()}
                                    >
                                        Comprobar
                                    </Button>
                                )}

                                <Button
                                    disabled={!ready || saving}
                                    className="rounded-2xl bg-[#286675] px-6 py-2 font-medium text-white shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
                                    onClick={handleFinish}
                                >
                                    {saving ? "Guardando..." : "Finalizar"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
