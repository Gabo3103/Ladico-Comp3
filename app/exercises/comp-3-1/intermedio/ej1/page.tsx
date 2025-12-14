"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useMemo, useRef, useState } from "react";
import DevelopExerciseI1, { DevelopExerciseI1Handle, Mode } from "@/components/DevelopExerciseI1";

const COMPETENCE = "3.1";
const LEVEL = "intermedio";

function randomMode(): Mode {
    return Math.random() < 0.5 ? "image" : "text";
}

export default function PageEj1_31_Intermedio() {
    const progressPct = (1 / 3) * 100;
    // modo aleatorio al montar (memo para no recalcular en re-renders)
    const mode = useMemo<Mode>(() => randomMode(), []);
    const exRef = useRef<DevelopExerciseI1Handle>(null);
    const [done, setDone] = useState(false);

    const modeLabel =
        mode === "image" ? "IMAGEN" : "TEXTO / DOCUMENTO";

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
                    {COMPETENCE} Desarrollo de contenidos — Nivel {LEVEL.charAt(0).toUpperCase() + LEVEL.slice(1)}
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
                Ejercicio 1 de 3
                </span>
                <div className="flex space-x-2" aria-hidden>
                <div className="w-3 h-3 rounded-full bg-[#286575]" />
                <div className="w-3 h-3 rounded-full bg-[#b3c8cd]" />
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
                {/* Escenario con tipo dinámico */}
                <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                <p className="text-gray-700">
                    Se te presentan distintos tipos de archivos digitales que debes ordenar en una carpeta. Selecciona los que{" "}
                    pertenecen al tipo {" "} <b className="text-[#286575]">{modeLabel}</b>.
                    
                </p>
                </div>
                <p className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full inline-block">
                    <b>Elige</b> las extensiones correctas
                </p>
                <DevelopExerciseI1
                ref={exRef}
                mode={mode}
                onEvaluate={(pt) => setDone(pt === 1)}
                />

                <div className="flex items-center justify-between pt-2">
                <div className="flex gap-3">
                    <Button
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                    onClick={() => {
                        if (!exRef.current) return;
                        if (!exRef.current.isReady()) {
                        alert("Selecciona al menos una opción antes de verificar.");
                        return;
                        }
                        exRef.current.check();
                    }}
                    >
                    Verificar
                    </Button>

                </div>

                <Button
                    asChild
                    disabled={!done}
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                >
                    <Link href="/exercises/3.1/intermedio/ex2">Siguiente</Link>
                </Button>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );
}
