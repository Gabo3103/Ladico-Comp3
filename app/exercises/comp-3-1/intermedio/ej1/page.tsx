"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import DevelopExerciseI1, { DevelopExerciseI1Handle } from "@/components/DevelopExerciseI1";

const COMPETENCE = "3.1";
const LEVEL = "intermedio";

const SCENARIOS = [
    "Estás preparando una infografía para una campaña de reciclaje en tu comunidad. Para avanzar más rápido, usas una herramienta de IA que propone una distribución visual, frases breves y algunos datos para incluir en el diseño.",
    "Debes crear el guion de un video corto sobre hábitos de estudio para estudiantes de enseñanza media. Después de escribir una idea inicial, usas IA para obtener ejemplos, ordenar las secciones y probar un tono más cercano.",
    "Un equipo está diseñando una publicación para redes sociales sobre prevención de estafas digitales. La IA entrega varias frases llamativas, recomendaciones y una propuesta de imagen para acompañar el mensaje.",
    "Estás elaborando una ficha interactiva para explicar una receta saludable en un taller escolar. Usas IA para sugerir pasos, títulos, imágenes de referencia y una versión resumida para estudiantes más pequeños.",
    "Te piden crear una presentación breve para una feria científica. Usas IA para organizar ideas, resumir conceptos y proponer ejemplos que podrían aparecer en las diapositivas.",
    "Estás diseñando un afiche digital para invitar a una actividad cultural local. La IA propone textos, estilos visuales y llamados a la acción que podrías combinar con fotografías del evento.",
] as const;

export default function PageEj1_31_Intermedio() {
    const progressPct = (1 / 3) * 100;
    const exRef = useRef<DevelopExerciseI1Handle>(null);
    const [done, setDone] = useState(false);
    const [ready, setReady] = useState(false);
    const [scenario, setScenario] = useState<string>(SCENARIOS[0]);

    useEffect(() => {
        setScenario(SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]);
    }, []);

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
                <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                <p className="text-gray-700">
                    {scenario}
                </p>
                </div>
                <p className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full inline-block">
                    <b>Selecciona</b> las afirmaciones correctas sobre el uso de IA en la creación de contenido.
                </p>
                <DevelopExerciseI1
                ref={exRef}
                onEvaluate={(pt) => setDone(pt === 1)}
                onReadyChange={setReady}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                    asChild
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                >
                    <Link href="/dashboard">Terminar</Link>
                </Button>

                <div className="flex gap-3">
                    <Button
                    disabled={!ready}
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
                    onClick={() => {
                        if (!exRef.current) return;
                        exRef.current.check();
                    }}
                    >
                    Comprobar
                    </Button>

                    <Button
                    asChild
                    disabled={!done}
                    className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                    >
                    <Link href="/exercises/comp-3-1/intermedio/ej2">Siguiente</Link>
                    </Button>
                </div>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );
}