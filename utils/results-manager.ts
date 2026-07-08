
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserResult, TestSession } from "@/types"

function answersAreEqual(left: number | number[] | null, right: number | number[]): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false
    const sortedLeft = [...left].sort((a, b) => a - b)
    const sortedRight = [...right].sort((a, b) => a - b)
    return sortedLeft.every((value, index) => value === sortedRight[index])
  }
  return left === right
}

export async function saveUserResult(testSession: TestSession): Promise<void> {
  if (!db) {
    const error = new Error("Firestore no está inicializado. Por favor, comprueba tu conexión a Internet.")
    console.error(error)
    throw error
  }

  try {
    const userResult: UserResult = {
      userId: testSession.userId,
      fecha: new Date().toISOString(),
      respuestas: testSession.questions.map((question, index) => ({
        preguntaId: question.id,
        competence: question.competence,
        respuestaUsuario: testSession.answers[index] ?? -1,
        correcta: answersAreEqual(testSession.answers[index], question.correctAnswerIndex),
        tiempoSegundos: Math.max(
          0,
          Math.floor(
            ((testSession.endTime?.getTime() ?? Date.now()) - testSession.startTime.getTime()) /
              1000 /
              testSession.questions.length
          )
        ),
      })),
      puntajeTotal: testSession.score,
      nivelDigComp: determineDigCompLevel(testSession.score),
    }

    await addDoc(collection(db, "userResults"), userResult)
    console.log("Resultado guardado exitosamente")
  } catch (error) {
    console.error("Error al guardar resultado:", error)
    throw error
  }
}

export async function getUserResults(userId: string): Promise<UserResult[]> {
  if (!db) {
    const error = new Error("Firestore no está inicializado. Por favor, comprueba tu conexión a Internet.")
    console.error(error)
    throw error
  }

  try {
    const q = query(collection(db, "userResults"), where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    const results: UserResult[] = []

    querySnapshot.forEach((doc) => {
      results.push({ ...doc.data() } as UserResult)
    })

    return results.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  } catch (error) {
    console.error("Error al obtener resultados:", error)
    return []
  }
}

function determineDigCompLevel(score: number): string {
  if (score >= 80) return "Avanzado"
  if (score >= 60) return "Intermedio"
  return "Básico"
}


