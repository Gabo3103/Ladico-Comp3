"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import IntegrationExerciseI2Adapt, {
    type IntegrationExerciseI2AdaptHandle,
} from "@/components/IntegrationExerciseI2Adapt";

const COMPETENCE = "3.2";
const LEVEL = "intermedio";

export default function PageEj2_32_Intermedio() {
    const progressPct = (2 / 3) * 100;
    const exRef = useRef<IntegrationExerciseI2AdaptHandle>(null);
    const [done, setDone] = useState(false);

    return (
        <div className="min-h-screen bg-[#f3fbfb]">
            <div className="rounded-b-xl border-b border-white/10 bg-white/20 backdrop-blur-sm">
                <div className="mx-auto max-w-6xl px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="shrink-0">
                                <img
                                    src="/ladico_green.png"
                                    alt="Ladico Logo"
                                    className="h-24 w-24 cursor-pointer object-contain transition-opacity hover:opacity-80"
                                />
                            </Link>
                            <span className="rounded-full bg-white/10 px-2 py-1 text-center text-[#2e6372] opacity-80 sm:px-3 sm:text-sm">
                                {COMPETENCE} Integración y reelaboración de contenido digital — Nivel{" "}
                                {LEVEL.charAt(0).toUpperCase() + LEVEL.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 pb-8 pt-4">
                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-[#286575] sm:text-sm">
                            Ejercicio 2 de 3
                        </span>
                        <div className="flex space-x-2" aria-hidden>
                            <div className="h-3 w-3 rounded-full bg-[#286575]" />
                            <div className="h-3 w-3 rounded-full bg-[#286575]" />
                            <div className="h-3 w-3 rounded-full bg-[#b3c8cd]" />
                        </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#dde3e8]">
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
                                Debes transformar un contenido base para un nuevo formato,
                                una nueva audiencia y un propósito comunicativo distinto.
                                Decide qué cambios permiten adaptar mejor el recurso final
                            </p>
                        </div>

                        <p className="inline-block rounded-full bg-blue-50 px-4 py-2 text-sm text-gray-600">
                            <b>Adapta</b> el contenido seleccionando formato, estructura, tono y recurso integrado
                        </p>

                        <IntegrationExerciseI2Adapt
                            ref={exRef}
                            onEvaluate={(pt) => setDone(pt === 1)}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <Button
                                asChild
                                className="rounded-2xl bg-[#286675] px-6 py-2 font-medium text-white shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <div className="flex gap-3">
                                <Button
                                    className="rounded-2xl bg-[#286675] px-6 py-2 font-medium text-white shadow-lg hover:bg-[#3a7d89]"
                                    onClick={() => {
                                        if (!exRef.current) return;
                                        if (!exRef.current.isReady()) {
                                            alert("Responde las cuatro decisiones antes de comprobar.");
                                            return;
                                        }
                                        exRef.current.check();
                                    }}
                                >
                                    Comprobar
                                </Button>

                                <Button
                                    asChild
                                    disabled={!done}
                                    className="rounded-2xl bg-[#286675] px-6 py-2 font-medium text-white shadow-lg hover:bg-[#3a7d89]"
                                >
                                    <Link href="/exercises/comp-3-2/intermedio/ej3">Siguiente</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
