"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RightsExerciseA1, {
    type RightsExerciseA1Handle
} from "@/components/RightsExerciseA1";

const COMPETENCE = "3.3";
const LEVEL = "intermedio";

export default function PageEj1_33_Avanzado() {
    const exRef = useRef<RightsExerciseA1Handle>(null);
    const [checking, setChecking] = useState(false);
    const [resource, setResource] = useState<any>(null); 
    const progressPct = (3 / 3) * 100;
    const resourceCases = [
        {
            url: "https://openverse.org/es/image/3c782eee-81ad-4125-aca1-305434b52cd9",
            title: "Cachorro e gato",
            author: "Bruno Covas",
            licenseCode: "CC BY 2.0",
        },
        {
            url: "https://openverse.org/es/image/510312c3-5823-41e6-b1e5-ceca18f483da",
            title: "Downtown-West-Palm-Beach-Sunset-Over-City-Buildings",
            author: "Captain Kimo",
            licenseCode: "CC BY-NC-ND 2.0",
        },
        {
            url: "https://openverse.org/es/image/d5a9c05f-4606-453b-bf39-566023da3700",
            title: "Roma - metro",
            author: "altotemi",
            licenseCode: "CC BY-SA 2.0",
        },
        {
            url: "https://openverse.org/es/image/9780e95e-a851-480e-a37a-db3a35a8432b",
            title: "ABQ Balloon Fiesta",
            author: "snowpeak",
            licenseCode: "CC BY 2.0",
        },
    ];

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * resourceCases.length);
        setResource(resourceCases[randomIndex]);
    }, []); 

    const onCheck = () => {
        if (!exRef.current) return;
        setChecking(true);
        exRef.current.check();
        setChecking(false);
    };

    if (!resource) {
        return <div className="p-6 text-center text-gray-500">Cargando recurso…</div>;
    }

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
                        {/* Escenario */}
                        <div className="mb-6 bg-gray-50 p-6 rounded-2xl border-l-4 border-[#286575]">
                            <p className="text-gray-700 font-medium">
                                Quieres usar una fotografía como ilustración en tu trabajo. Debes añadir el
                                texto correcto de atribución según la licencia.
                            </p>
                        </div>

                        {/* Instrucción */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-4 py-2 rounded-full inline-block">
                                Explora el recurso y <b>escribe</b> la atribución correcta
                            </p>
                        </div>

                        {/* Ejercicio con caso random */}
                        <RightsExerciseA1 ref={exRef} resource={resource} />

                        {/* Acciones */}
                        <div className="mt-6 flex items-center justify-between">
                            <Button
                                asChild
                                className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>

                            <Button
                                onClick={onCheck}
                                disabled={checking}
                                className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89] disabled:opacity-50"
                            >
                                {checking ? "Comprobando…" : "Comprobar"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
