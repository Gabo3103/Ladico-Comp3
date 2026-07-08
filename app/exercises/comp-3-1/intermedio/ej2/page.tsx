"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLadicoSession } from "@/hooks/useLadicoSession";
import { setPoint } from "@/lib/levelProgress";
import { getOrCreateSeed } from "@/lib/caseSeed";
import DevelopExerciseI2, {
    type DevelopExerciseI2Handle,
} from "@/components/DevelopExerciseI2";

const COMPETENCE = "3.1";
const LEVEL = "intermedio";
const PREFIX = "session:3.1:Intermedio";

export default function PageEj2_31_Intermedio() {
    const router = useRouter();
    const { isProfesor, isAdmin } = useAuth();
    const demoMode = isProfesor || isAdmin;
    const { mark } = useLadicoSession(COMPETENCE, "Intermedio", PREFIX);

    const progressPct = (2 / 3) * 100;
    const exRef = useRef<DevelopExerciseI2Handle>(null);
    const [saving, setSaving] = useState(false);
    const [seed] = useState(() => getOrCreateSeed(COMPETENCE, LEVEL, 2));

    const handleNext = async () => {
        if (!exRef.current) return;
        setSaving(true);
        const ok = exRef.current.check({ silent: true });
        setPoint(COMPETENCE, LEVEL, 2, ok ? 1 : 0);
        await mark(1, ok);
        setSaving(false);
        router.push("/exercises/comp-3-1/intermedio/ej3");
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
                    {COMPETENCE} Desarrollo de contenidos — Nivel{" "}
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
                Ejercicio 2 de 3
                </span>
                <div className="flex space-x-2" aria-hidden>
                <div className="w-3 h-3 rounded-full bg-[#286575]" />
                <div className="w-3 h-3 rounded-full bg-[#286575]" />
                <div className="w-3 h-3 rounded-full bg-[#b3c8cd]" />
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
            <CardContent className="p-6 lg:p-8 space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                <p className="text-gray-700">
                    Debes crear un producto digital de forma eficiente, usando herramientas de apoyo para organizar, editar, revisar y publicar el contenido sin perder control sobre el resultado final.
                </p>
                </div>
                <p className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full inline-block">
                    <b>Ordena</b> las etapas del flujo de producción en la secuencia más adecuada.
                </p>
                <DevelopExerciseI2
                ref={exRef}
                countScenarios={1}
                seed={seed}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                    asChild
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                >
                    <Link href="/dashboard">Terminar</Link>
                </Button>

                <div className="flex gap-3">
                    {demoMode && (
                        <Button
                            variant="outline"
                            className="px-6 py-2 rounded-2xl border-[#286675] text-[#286675] font-medium shadow-sm hover:bg-[#e4f3f5]"
                            onClick={() => exRef.current?.check()}
                        >
                            Comprobar
                        </Button>
                    )}
                    <Button
                    disabled={saving}
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
                    onClick={handleNext}
                    >
                    {saving ? "Guardando..." : "Siguiente"}
                    </Button>
                </div>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );
}
