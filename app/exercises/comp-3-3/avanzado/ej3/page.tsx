"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RightsExerciseA3Drag, {
    type Category,
    type CaseCard,
    type CatId,
} from "@/components/RightsExerciseA3Drag";

const COMPETENCE = "3.3";
const LEVEL = "avanzado";

// Helper para barajar y elegir N elementos
function pickRandomItems<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export default function PageEj3_33_Avanzado() {
    const progressPct = (3 / 3) * 100;

    const ALL_CATEGORIES: Category[] = [
        { id: "CC_BY_4",     title: "CC BY",                       hint: "Atribución" },
        { id: "CC_BY_SA_4",  title: "CC BY-SA",                    hint: "Compartir igual" },
        { id: "CC_BY_NC",    title: "CC BY-NC",                    hint: "No comercial" },
        { id: "CC_BY_ND_NC", title: "CC BY-ND-NC",                 hint: "No derivadas + no comercial" },
        { id: "CC0",         title: "CC0",                         hint: "Sin derechos reservados" },
        { id: "COPYRIGHT",   title: "Copyright / Marca",           hint: "Derechos de autor" },
        { id: "IMG_ADULTO",  title: "Derecho de imagen (adulto)",  hint: "Consentimiento para uso comercial" },
        { id: "IMG_MENOR",   title: "Derecho de imagen (menores)", hint: "Consentimiento de padres/tutor legal" },
        { id: "GPL",         title: "GPL",                         hint: "Tipo Copyleft" },
    ];

    const ALL_CASES: CaseCard[] = [
        {
            id: "C1",
            text:
                "Un novelista publica su nuevo libro con una editorial. El libro tiene el aviso de 'Todos los derechos reservados'. Un fan del autor quiere traducir el libro a otro idioma para publicarlo en su blog. Al ser un uso derivado, el fan debe pedir permiso al autor o a la editorial, y es muy probable que se le niegue si no se negocia un contrato y un pago por ello.",
            correctFor: "COPYRIGHT",
        },
        {
            id: "C2",
            text:
                "Un programador desarrolla un sistema operativo basado en Linux y distribuye el código bajo cierta licencia. Un fabricante de computadoras preinstala este sistema en sus ordenadores y realiza algunas modificaciones para optimizar el rendimiento. Según la licencia, el fabricante está obligado a publicar el código fuente de las modificaciones que realice.",
            correctFor: "GPL",
        },
        {
            id: "C3",
            text:
                "Un colegio sube a su página institucional fotos de una feria científica donde aparecen estudiantes menores de edad. Algunos apoderados no firmaron la autorización de uso de imagen entregada al inicio del año escolar.",
            correctFor: "IMG_MENOR",
        },
        {
            id: "C4",
            text:
                "Un equipo de investigadores descarga una base de datos para su estudio y no está obligado a atribuir a la ONG que la publicó, ya que la licencia lo permite. Más tarde, un periodista utiliza esos mismos datos para elaborar un gráfico en su periódico sin mencionar la fuente, sin que ello genere ningún inconveniente legal.",
            correctFor: "CC0",
        },
        {
            id: "C5",
            text:
                "Una foto es muy popular y un diseñador la usa como base para crear un patrón de papel tapiz. Según los términos de la licencia, el diseñador debe publicar el patrón también bajo esta, para que otros puedan usarlo y modificarlo libremente bajo las mismas condiciones.",
            correctFor: "CC_BY_SA_4",
        },
        {
            id: "C6",
            text:
                "Una profesora publica su material didáctico bajo una licencia que permite su uso, copia y distribución con fines educativos y sin ánimo de lucro, siempre que se le reconozca la autoría. No obstante, cualquier uso con fines comerciales requiere su autorización expresa o la obtención de una licencia especial por parte de la empresa interesada.",
            correctFor: "CC_BY_NC",
        },
        {
            id: "C7",
            text:
                "Un bloguero quiere que su foto sea utilizada por la mayor cantidad de gente posible. No le importa si se usa para un póster publicitario o en otro blog, siempre y cuando se le dé el crédito como autor",
            correctFor: "CC_BY_4",
        },
        {
            id: "C8",
            text:
                "Un fotógrafo toma una foto de una persona en un evento público. Posteriormente, decide vender la fotografía a una agencia de noticias. Al vender la foto, el fotógrafo transfiere los derechos de autor sobre la imagen. Sin embargo, la persona fotografiada puede demandar a la agencia de noticias si el uso de su imagen es ofensivo o se utiliza para una campaña publicitaria sin su consentimiento",
            correctFor: "IMG_ADULTO",
        },
        {
            id: "C9",
            text:
                "Un escritor quiere que su trabajo sea accesible para fines educativos y personales, pero quiere mantener un control total sobre su obra. El escritor no desea que sus poemas sean adaptados, traducidos o modificados de ninguna manera, ni que nadie pueda obtener un beneficio económico de ellos, pero sí permite su difusión tal como los creó",
            correctFor: "CC_BY_ND_NC",
        },
    ];

    // 🔹 Elegimos 3 casos al azar
    const cases: CaseCard[] = pickRandomItems(ALL_CASES, 3);

    // 🔹 Licencias realmente usadas en esos 3 casos
    const usedCatIds = Array.from(
        new Set<CatId>(cases.map((c) => c.correctFor))
    );

    // 🔹 Pool de distractores posibles (categorías que no son las correctas de estos casos)
    const distractorPool = ALL_CATEGORIES.filter(
        (cat) => !usedCatIds.includes(cat.id)
    );

    // 🔹 Elegimos hasta 2 distractores para no saturar
    const distractors = pickRandomItems(distractorPool, Math.min(2, distractorPool.length));

    // 🔹 Categorías finales: correctas + distractores
    const categories: Category[] = ALL_CATEGORIES.filter(
        (cat) =>
            usedCatIds.includes(cat.id) ||
            distractors.some((d) => d.id === cat.id)
    );

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
                        <span className="text-xs text-[#286575] sm:text-sm font-medium bg_WHITE/10 px-2 py-1 rounded-full">
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
                                Estás frente a diferentes situaciones reales donde se aplican{" "}
                                <b>normas y licencias de uso de contenido digital</b>. Analiza cada descripción y{" "}
                                <b>arrastra</b> la licencia o norma que consideres más adecuada.
                            </p>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-4 py-2 rounded-full inline-block">
                                <b>Elige</b> la norma o licencia más adecuada que aplique al caso
                            </p>
                        </div>

                        <RightsExerciseA3Drag categories={categories} cases={cases} />

                        <div className="mt-6 flex items-center justify-between">
                            <Button
                                asChild
                                className="px-6 py-2 bg-[#286675] rounded-2xl text-white font-medium shadow-lg hover:bg-[#3a7d89]"
                            >
                                <Link href="/dashboard">Terminar</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
