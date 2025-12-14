"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import IntegrationExerciseI1, {
    IntegrationExerciseI1Handle,
} from "@/components/IntegrationExerciseI1";

const COMPETENCE = "3.2";
const LEVEL = "avanzado";

export default function PageEj1_32_Intermedio() {
    const progressPct = (1 / 3) * 100;
    const exRef = useRef<IntegrationExerciseI1Handle>(null);
    const [done, setDone] = useState(false);

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
                    {COMPETENCE} Comunicación mediante contenidos digitales — Nivel{" "}
                    {LEVEL.charAt(0).toUpperCase() + LEVEL.slice(1)}
                </span>
                </div>
            </div>
            </div>
        </div>

        {/* Contenido */}
        <div className="max-w-6xl mx-auto px-4 pb-8 pt-4">
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
                <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                <p className="text-gray-700">
                    Estás utilizando un editor de texto para realizar cambios a partes específicas de un contenido digital.
                </p>
                </div>

                <p className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full inline-block mt-3">
                <b>Aplica</b> y <b>cambia</b> el formato según lo solicitado.
                </p>

                <IntegrationExerciseI1
                ref={exRef}
                onEvaluate={(pt) => setDone(pt === 1)}
                />

                <div className="flex items-center justify-between pt-2">
                <Button
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                    onClick={() => {
                    const ok = exRef.current?.check() ?? false;
                    setDone(ok);
                    }}
                >
                    Verificar
                </Button>

                <Button
                    asChild
                    disabled={!done}
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg disabled:opacity-50"
                >
                    <Link href="/exercises/comp-3-2/intermedio/ej2">
                    Siguiente
                    </Link>
                </Button>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );
}
