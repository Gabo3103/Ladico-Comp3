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
import RightsExerciseI3, {
    type RightsExerciseI3Handle,
} from "@/components/RightsExerciseI3";

const COMPETENCE = "3.3";
const LEVEL = "intermedio";
const PREFIX = "session:3.3:Intermedio";

const SCENARIO =
    "Estás analizando cómo se entrenan distintos sistemas de IA. Debes identificar qué situaciones presentan desafíos relacionados con derechos, permisos, sesgos, daños o transparencia en el uso de obras, imágenes, textos o datos.";

export default function PageEj3_33_Intermedio() {
    const router = useRouter();
    const { isProfesor, isAdmin } = useAuth();
    const demoMode = isProfesor || isAdmin;
    const { sessionId, mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX);

    const exRef = useRef<RightsExerciseI3Handle>(null);
    const [ready, setReady] = useState(false);
    const [saving, setSaving] = useState(false);
    const [seed] = useState(() => getOrCreateSeed(COMPETENCE, LEVEL, 3));
    const progressPct = (3 / 3) * 100;

    const handleFinish = async () => {
        if (!exRef.current) return;
        setSaving(true);
        const result = exRef.current.grade({ silent: true });
        const ok = result.quality === "good" || result.quality === "partial";
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
        router.push(`/test/comp-3-3-intermedio?${qs.toString()}`);
    };

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
                                {COMPETENCE} Derechos de autor y licencias - Nivel{" "}
                                {LEVEL.charAt(0).toUpperCase() + LEVEL.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-8 pt-4">
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

                <Card className="bg-white shadow-2xl rounded-3xl border-0 ring-2 ring-[#286575] ring-opacity-30">
                    <CardContent className="p-6 lg:p-8">
                        <div className="mb-6 bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                            <p className="text-gray-700 font-medium">{SCENARIO}</p>
                        </div>


                        <RightsExerciseI3 ref={exRef} onReadyChange={setReady} seed={seed} />

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <Button
                                asChild
                                className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <div className="flex gap-3">
                                {demoMode && (
                                    <Button
                                        onClick={() => exRef.current?.grade()}
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
