import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase" 
import type { CountryCode } from "@/data/imageBank"

// Normaliza lo que venga de Firebase: "Chile", "CHILE", "cl", "CL"
export function normalizeCountry(input: unknown): CountryCode | null {
    const raw = (input ?? "").toString().trim().toLowerCase()
    if (!raw) return null


    if (["cl", "chile"].includes(raw)) return "CL"
    if (["ar", "argentina"].includes(raw)) return "AR"
    if (["co", "colombia"].includes(raw)) return "CO"
    if (["pe", "peru", "perú"].includes(raw)) return "PE"
    if (["uy", "uruguay"].includes(raw)) return "UY"
    return null
}

export async function getUserCountry(uid: string): Promise<CountryCode | null> {
    try {
        const snap = await getDoc(doc(db, "users", uid))
        if (!snap.exists()) return null
        const data = snap.data()
        return normalizeCountry(data?.country)
    } catch {
        return null
    }
}
