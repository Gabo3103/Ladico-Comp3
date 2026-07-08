"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RightsExerciseI3, {
    type RightsExerciseI3Handle,
} from "@/components/RightsExerciseI3";

const COMPETENCE = "3.3";
const LEVEL = "intermedio";

const SCENARIO =
    "Estás analizando cómo se entrenan distintos sistemas de IA. Debes identificar qué situaciones presentan desafíos relacionados con derechos, permisos, sesgos, daños o transparencia en el uso de obras, imágenes, textos o datos.";

export default function PageEj3_33_Intermedio() {
    const exRef = useRef<RightsExerciseI3Handle>(null);
    const [checking, setChecking] = useState(false);
    const [ready, setReady] = useState(false);
    const [approved, setApproved] = useState(false);
    const progressPct = (3 / 3) * 100;

    const onCheck = () => {
        if (!exRef.current) return;
        setChecking(true);
        const result = exRef.current.grade();
        setApproved(result.quality === "good" || result.quality === "partial");
        setChecking(false);
    };

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
                                {COMPETENCE} Derechos de autor y licencias - Nivel{" "}
                                {LEVEL.charAt(0).toUpperCase() + LEVEL.slice(1)}
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
                            <p className="text-gray-700 font-medium">{SCENARIO}</p>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-4 py-2 rounded-full inline-block">
                                Lee cada caso y <b>marca</b> si no hay conflicto relevante,
                                si existe un desafío ético, legal o ambos.
                            </p>
                        </div>

                        <RightsExerciseI3 ref={exRef} onReadyChange={setReady} />

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <Button
                                asChild
                                className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <div className="flex gap-3">
                                <Button
                                    onClick={onCheck}
                                    disabled={checking || !ready}
                                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
                                >
                                    {checking ? "Comprobando..." : "Comprobar"}
                                </Button>

                                <Button
                                    asChild
                                    disabled={!approved}
                                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
                                >
                                    <Link href="/exercises/comp-3-3/avanzado/ej1">Siguiente</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}