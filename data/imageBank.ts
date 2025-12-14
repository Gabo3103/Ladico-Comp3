// Tipos mínimos
export type CountryCode = "CL" | "AR" | "CO" | "PE" | "UY" | "NaN"

export type ImageAsset = {
    title: string
    author: string
    imageUrl: string
    license: { short: string; url: string }
}


export const IMAGE_BANK: Record<CountryCode, ImageAsset[]> = {
    CL: [
        {
        title: "Miscanti Lagoon – San Pedro de Atacama, Chile",
        author: "Jim Trodel",
        imageUrl: "/countryimg/miscanti.jpg", 
        license: { short: "CC BY-SA", url: "https://creativecommons.org/licenses/by-sa/4.0/deed.es" },
        },
    ],
    AR: [
        {
        title: "Atardecer en el Congreso de la Nación Argentina",
        author: "Miguel César",
        imageUrl: "/countryimg/congreso.jpg", 
        license: { short: "CC BY-SA", url: "https://creativecommons.org/licenses/by-sa/4.0/deed.es" },
        },
    ],
    CO: [
        {
        title: "Jardín, Colombia",
        author: "szeke",
        imageUrl: "/countryimg/jardin.jpg", 
        license: { short: "CC BY-SA", url: "https://creativecommons.org/licenses/by-sa/4.0/deed.es" },
        },
    ],
    PE: [
        {
        title: "Palacio de la Justicia. Lima, Perú",
        author: "Thomas Flores",
        imageUrl: "/countryimg/palaciojusticia.jpg", 
        license: { short: "CC BY-SA", url: "https://creativecommons.org/licenses/by-sa/4.0/deed.es" },
        },
    ],
    UY: [
        {
        title: "Palacio Estevez Montevideo",
        author: "Stelios Karavias",
        imageUrl: "/countryimg/palacioestevez.jpg", 
        license: { short: "CC BY-SA", url: "https://creativecommons.org/licenses/by-sa/4.0/deed.es" },
        },
    ],
    NaN: [
        {
        title: "cargando",
        author: "cargando",
        imageUrl: "/countryimg/loader.gif", 
        license: { short: "cargando", url: "https://creativecommons.org/licenses/by-sa/4.0/deed.es" },
        },
    ]
}

export const DEFAULT_COUNTRY: CountryCode = "NaN"

export function pickAssetForCountry(country: CountryCode): ImageAsset {
    const list = IMAGE_BANK[country]
    if (list && list.length) return list[0]
    return IMAGE_BANK[DEFAULT_COUNTRY][0]
}
