"use client"
import { useEffect, useRef, useState } from "react"
import { ensureSession, markAnswered, type LevelName } from "@/lib/testSession"
import { useAuth } from "@/contexts/AuthContext"

export function useLadicoSession(competence: string, level: LevelName, prefix: string) {
  const { user } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const ensuringRef = useRef(false)
  const keyFor = (uid: string) => `${prefix}:${uid}`

  useEffect(() => {
    if (!user) { setSessionId(null); return }
    const k = keyFor(user.uid)
    const cached = typeof window !== "undefined" ? localStorage.getItem(k) : null
    if (cached) { setSessionId(cached); return }
    if (ensuringRef.current) return
    ensuringRef.current = true
    ;(async () => {
      try {
        const { id } = await ensureSession({ userId: user.uid, competence, level, totalQuestions: 3 })
        setSessionId(id)
        if (typeof window !== "undefined") localStorage.setItem(k, id)
      } catch (e) { console.error("No se pudo asegurar la sesión:", e) } finally { ensuringRef.current = false }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  const mark = async (index: number, correct: boolean): Promise<string | null> => {
    let sid = sessionId
    if (!sid && user) {
      const k = keyFor(user.uid)
      const cached = typeof window !== "undefined" ? localStorage.getItem(k) : null
      if (cached) sid = cached
      else {
        try {
          const { id } = await ensureSession({ userId: user.uid, competence, level, totalQuestions: 3 })
          sid = id; setSessionId(id)
          if (typeof window !== "undefined") localStorage.setItem(k, id)
        } catch (e) { console.warn(e) }
      }
    }
    try { if (sid) await markAnswered(sid, index, correct) } catch (e) { console.warn(e) }
    return sid
  }

  return { sessionId, mark }
}
