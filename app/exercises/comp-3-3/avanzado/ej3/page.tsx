"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLadicoSession } from "@/hooks/useLadicoSession";
import { getProgress, setPoint, levelPoints, isLevelPassed, getPoint } from "@/lib/levelProgress";
import { getOrCreateSeed } from "@/lib/caseSeed";
import RightsExerciseA3, {
    type RightsExerciseA3Handle,
} from "@/components/RightsExerciseA3";

const COMPETENCE = "3.3";
const LEVEL = "avanzado";
const PREFIX = "session:3.3:Avanzado";

export default function PageEj3_33_Avanzado() {
    const router = useRouter();
    const { isProfesor, isAdmin } = useAuth();
    const demoMode = isProfesor || isAdmin;
    const { sessionId, mark } = useLadicoSession(COMPETENCE, "Avanzado", PREFIX);

    const exRef = useRef<RightsExerciseA3Handle>(null);
    const [ready, setReady] = useState(false);
    const [saving, setSaving] = useState(false);
    const [seed] = useState(() => getOrCreateSeed(COMPETENCE, LEVEL, 3));
    const progressPct = (3 / 3) * 100;

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
        router.push(`/test/comp-3-3-avanzado?${qs.toString()}`);
    };

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
                                {COMPETENCE} Derechos de autor y licencias — Nivel{" "}
                                {LEVEL.charAt(0).toUpperCase() + LEVEL.slice(1)}
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
                            <p className="text-gray-700 font-medium">
                                Estás frente a situaciones complejas de publicación y reutilización digital. Elige la norma o acción responsable más adecuada para cada caso.
                            </p>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-4 py-2 rounded-full inline-block">
                               Analiza cada caso y <b>arrastra</b> la norma o directriz responsable que mejor corresponda.
                            </p>
                        </div>

                        <RightsExerciseA3 ref={exRef} onReadyChange={setReady} seed={seed} />

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <span />

                            <div className="flex gap-3">
                                {demoMode && (
                                    <Button
                                        onClick={() => exRef.current?.check()}
                                        disabled={!ready}
                                        variant="outline"
                                        className="px-6 py-2 rounded-2xl border-[#286675] text-[#286675] font-medium shadow-sm hover:bg-[#e4f3f5] disabled:opacity-50"
                                    >
                                        Comprobar
                                    </Button>
                                )}

                                <Button
                                    onClick={handleFinish}
                                    disabled={saving || !ready}
                                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
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
