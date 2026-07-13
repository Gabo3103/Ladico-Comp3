// components/TestInterface.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import type { TestSession } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCompetenceTitle } from "@/components/data/digcompSkills"
import Link from "next/link"
import { AlertTriangle, Bot, FileText, Image as ImageIcon, Presentation, Sparkles, Wand2, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface TestInterfaceProps {
  testSession: TestSession
  onAnswerSubmit: (answerIndex: number | number[], questionIndex: number) => void
  onTestComplete: (session: TestSession) => void
  questionTimeSeconds?: number // opcional: override del tiempo por pregunta (default 60)
}

function CircularTimer({
  timeLeft,
  total,
  invalidated,
}: { timeLeft: number; total: number; invalidated: boolean }) {
  const R = 28;           // radio del círculo (px)
  const STROKE = 6;       // grosor del trazo
  const C = 2 * Math.PI * R;
  const clamped = Math.max(0, Math.min(timeLeft, total));
  const pct = clamped / total;
  const dashoffset = C * (1 - pct);

  return (
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
      <div className="relative w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
        {/* fondo del anillo */}
        <svg className="w-16 h-16 rotate-[-90deg]" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="#e5e7eb"                // gris claro
            strokeWidth={STROKE}
          />
          {/* progreso */}
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={invalidated ? "#ef4444" : "#286575"}  // rojo si invalidada, púrpura como la imagen
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashoffset}
            style={{ transition: "stroke-dashoffset 0.3s linear" }}
          />
        </svg>

        {/* número al centro */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <span className={`font-bold text-base ${invalidated ? "text-red-600" : "text-[#286575]"}`}>
            {clamped}
          </span>
        </div>
      </div>
    </div>
  );
}

function GenerativePresentationDemo() {
  return (
    <div className="mb-5 rounded-2xl border border-[#286575]/20 bg-gradient-to-br from-[#eef8f8] via-white to-[#f6f1ff] p-3 sm:p-4">
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className="bg-gray-100 border-b px-3 py-2 flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </span>
          <span className="flex-1 rounded-full bg-white border px-3 py-1 text-[11px] text-gray-500">
            ia-presentaciones.demo/crear
          </span>
        </div>

        <div className="grid sm:grid-cols-[1fr_220px] gap-3 p-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
              <Bot className="w-4 h-4 text-[#286575]" />
              Asistente de IA generativa
            </div>
            <div className="rounded-lg bg-white border border-gray-200 p-3 text-xs text-gray-600 leading-relaxed">
              “Crea una presentación de 5 diapositivas sobre reciclaje en la comunidad,
              con títulos claros, imágenes sugeridas y una conclusión.”
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-600">
              <span className="rounded-lg bg-white border px-2 py-2 flex items-center gap-1">
                <Presentation className="w-3.5 h-3.5 text-[#286575]" /> Diapositivas
              </span>
              <span className="rounded-lg bg-white border px-2 py-2 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#286575]" /> Imágenes
              </span>
              <span className="rounded-lg bg-white border px-2 py-2 flex items-center gap-1">
                <Wand2 className="w-3.5 h-3.5 text-[#286575]" /> Estilo
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Vista previa</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-lg border bg-gray-50 p-2 flex gap-2">
                  <span className="w-10 h-8 rounded bg-gradient-to-br from-[#286575] to-[#7fb0bb]" />
                  <span className="flex-1 space-y-1">
                    <span className="block h-2 rounded bg-gray-300 w-4/5" />
                    <span className="block h-2 rounded bg-gray-200 w-3/5" />
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Borrador editable generado por IA
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function TestInterface({
  testSession,
  onAnswerSubmit,
  onTestComplete,
  questionTimeSeconds = 60,
}: TestInterfaceProps) {
  const { isProfesor, isAdmin } = useAuth()
  const demoMode = isProfesor || isAdmin
  // ------- Guards básicos -------
  const questions = testSession?.questions ?? []
  const totalQuestions = Array.isArray(questions) ? questions.length : 0

  if (!totalQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar el test</h2>
          <p className="text-gray-700 mb-4">
            No se ha podido cargar la información del test correctamente.
          </p>
          <a
            href="/dashboard"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    )
  }

  // ------- Estado navegación / respuestas -------
  const safeInitialIndex = Math.min(
    Math.max(testSession.currentQuestionIndex ?? 0, 0),
    totalQuestions - 1
  )
  const initialAnswer = testSession.answers?.[safeInitialIndex] ?? null
  const initialStored = testSession.answers?.[safeInitialIndex] as number | number[] | null

  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex)
  const currentQuestion = questions[currentIndex]
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | null>(
    currentQuestion?.type === "multiple-response"
      ? (Array.isArray(initialStored) ? [...initialStored] : [])   // MR: array (vacío si no hay)
      : (typeof initialStored === "number" ? initialStored : null) // MC: índice o null
  )
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const competenceCode = currentQuestion?.competence
  const competenceName = getCompetenceTitle(competenceCode)
  const [checkResult, setCheckResult] = useState<boolean | null>(null)
  const hasAnswer = Array.isArray(selectedAnswer)
    ? selectedAnswer.length > 0
    : selectedAnswer !== null

  // Copia local de todas las respuestas, actualizada de forma síncrona en cada
  // selección. onAnswerSubmit persiste en Firestore de forma asíncrona (sin
  // await) y el prop testSession solo se actualiza cuando ese round-trip
  // vuelve; si la red va lenta, al llegar a la última pregunta ese prop puede
  // no reflejar aún respuestas previas, causando que se cuenten como "sin
  // responder" al calificar. Este ref no depende de esa latencia.
  const localAnswersRef = useRef<(number | number[] | null)[]>(
    Array.from({ length: totalQuestions }, (_, i) => testSession.answers?.[i] ?? null)
  )

  const handleAnswerSelect = (answerIndex: number) => {
    setCheckResult(null)
    if (currentQuestion?.type === "multiple-response") {
      setSelectedAnswer((current) => {
        const selected = Array.isArray(current) ? current : []
        const next = selected.includes(answerIndex)
          ? selected.filter((index) => index !== answerIndex)
          : [...selected, answerIndex]
        localAnswersRef.current[currentIndex] = next
        onAnswerSubmit(next, currentIndex)
        return next
      })
      return
    }

    localAnswersRef.current[currentIndex] = answerIndex
    setSelectedAnswer(answerIndex)
    onAnswerSubmit(answerIndex, currentIndex)
  }

  // ------- Anti-cheat & Timer -------
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [showWarning, setShowWarning] = useState(false)
  const [invalidated, setInvalidated] = useState(false)
  const [timeoutBanner, setTimeoutBanner] = useState(false)

  const violationCooldownRef = useRef<number>(0)
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const invalidatedRef = useRef<boolean>(false)

  // Timer por pregunta
  const QUESTION_TIME = Math.max(5, Number(questionTimeSeconds) || 60)
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME)
  const timerIntervalRef = useRef<number | null>(null)

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60)
    const r = s % 60
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    return `${pad(m)}:${pad(r)}`
  }

  const clearAllTimers = () => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }
  }

  const startTimer = () => {
    clearAllTimers()
    setTimeoutBanner(false)
    setTimeLeft(QUESTION_TIME)
    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // tiempo agotado -> invalidar y avanzar
          if (!invalidatedRef.current) {
            invalidatedRef.current = true
            setInvalidated(true)
            setShowWarning(false)
            setTimeoutBanner(true)
            clearAllTimers()
            autoAdvanceTimerRef.current = setTimeout(() => handleNext(true), 3000)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const registerViolation = () => {
    const now = Date.now()
    if (now - violationCooldownRef.current < 1500 || invalidatedRef.current) return
    violationCooldownRef.current = now

    setShowWarning(true)
    setAttemptsLeft((prev) => {
      const next = prev - 1
      if (next <= 0) {
        invalidatedRef.current = true
        setInvalidated(true)
        setShowWarning(false)
        clearAllTimers()
        autoAdvanceTimerRef.current = setTimeout(() => handleNext(true), 3000)
        return 0
      }
      return next
    })
  }

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) registerViolation()
    }
    const onBlur = () => registerViolation()
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) registerViolation()
    }

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("blur", onBlur)
    document.addEventListener("mouseout", onMouseOut)

    // iniciar timer en la primera pregunta
    startTimer()

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("blur", onBlur)
      document.removeEventListener("mouseout", onMouseOut)
      clearAllTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNext = (fromInvalidation = false) => {
    clearAllTimers()
    violationCooldownRef.current = 0
    invalidatedRef.current = false

    setCurrentIndex((prevIndex) => {
      // Registrar respuesta salvo que venga de invalidación
      if (!fromInvalidation && selectedAnswer !== null) {
        localAnswersRef.current[prevIndex] = selectedAnswer
        onAnswerSubmit(selectedAnswer, prevIndex)
      }

      const isLast = prevIndex >= totalQuestions - 1
      if (isLast) {
        const finalSession: TestSession = {
          ...testSession,
          currentQuestionIndex: prevIndex,
          answers: localAnswersRef.current.map((answer, idx) =>
            idx === prevIndex ? (fromInvalidation ? answer : selectedAnswer) : answer
          ),
        }
        onTestComplete(finalSession)
        return prevIndex
      }

      const nextIndex = prevIndex + 1
      // reset estado de control
      setSelectedAnswer(testSession.answers[nextIndex] ?? null)
      setAttemptsLeft(3)
      setShowWarning(false)
      setInvalidated(false)
      setCheckResult(null)
      startTimer() // nuevo timer
      return nextIndex
    })
  }

  // ------- Render -------
  const isLastQuestion = currentIndex === totalQuestions - 1
  const isBasicLevel = testSession.level?.toString().toLowerCase?.().startsWith("b")
  const questionText = `${currentQuestion?.title ?? ""} ${currentQuestion?.scenario ?? ""}`.toLowerCase()
  const isPresentationAiQuestion =
    questionText.includes("presentaci") ||
    questionText.includes("diapositiv") ||
    questionText.includes("ia generativa") ||
    questionText.includes("inteligencia artificial")
  const showGenerativePresentationDemo = competenceCode === "5.3" && isBasicLevel && isPresentationAiQuestion
  const showArea5DemoControls = demoMode && competenceCode?.startsWith("5.") && isBasicLevel
  const handleCheck = () => {
    const correct = currentQuestion?.correctAnswerIndex
    if (Array.isArray(correct)) {
      const selected = Array.isArray(selectedAnswer) ? selectedAnswer : []
      setCheckResult(correct.length === selected.length && correct.every((i) => selected.includes(i)))
      return
    }
    setCheckResult(selectedAnswer === correct)
  }

  return (
    <div className="min-h-screen bg-[#f3fbfb]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 rounded-b-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between text-white space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard">
                <img
                  src="/ladico_green.png"
                  alt="Ladico Logo"
                  className="w-16 h-16 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>

              <span className="text-[#2e6372] text-xs sm:text-sm opacity-80 bg-white/10 px-2 sm:px-3 py-1 rounded-full text-center">
                {currentQuestion?.dimension} | {competenceCode}
                {competenceName ? ` ${competenceName}` : ""} - {" Nivel "}
                {testSession.level?.toString().toLowerCase?.() === "intermedio"
                  ? "Intermedio"
                  : testSession.level?.toString().toLowerCase?.() === "avanzado"
                  ? "Avanzado"
                  : "Básico"}
              </span>
            </div>

          {/* badges intentos*/}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full border ${
                  invalidated
                    ? "bg-red-100 text-red-700 border-red-300"
                    : attemptsLeft === 3
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : attemptsLeft === 2
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
                title="Intentos restantes para no salir de la página"
              >
                {invalidated ? "Invalidada" : `${attemptsLeft}/3 intentos`}
              </span>
            </div>
          </div>

          {/* Progreso compacto, pegado al header */}
          <div className="mt-1">
            <div className="flex items-center justify-between text-[#286575] mb-1.5">
              <span className="text-xs font-medium bg-white/40 px-2 sm:px-3 py-1 rounded-full">
                Pregunta {currentIndex + 1} de {totalQuestions}
              </span>
              <div className="flex space-x-1 sm:space-x-2">
                {Array.from({ length: totalQuestions }, (_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                      index <= currentIndex ? "bg-[#286575] shadow-lg" : "bg-[#dde3e8]"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="h-1.5 bg-[#dde3e8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#286575] rounded-full transition-all duration-500 ease-in-out shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Banners anti-cheat / timer */}
      {showWarning && !invalidated && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-2">
          <Alert className="border-amber-300 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm flex items-center justify-between">
              <span>
                ⚠️ Has salido de la página o pestaña. Intentos restantes: <b>{attemptsLeft}</b>.{" "}
                Permanece dentro para continuar.
              </span>
              <button
                className="ml-3 rounded p-1 hover:bg-amber-100"
                onClick={() => setShowWarning(false)}
                aria-label="Cerrar advertencia"
              >
                <X className="h-4 w-4 text-amber-700" />
              </button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {timeoutBanner && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-2">
          <Alert className="border-red-300 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              ⏳ Tiempo agotado. La pregunta se ha invalidado. Avanzando…
            </AlertDescription>
          </Alert>
        </div>
      )}

      {invalidated && !timeoutBanner && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-2">
          <Alert className="border-red-300 bg-red-50 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              ❌ Esta pregunta fue invalidada por exceder los 3 intentos. Avanzando automáticamente…
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="h-5 sm:h-6" aria-hidden />

      {/* Tarjeta de pregunta */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
        <Card className="bg-white shadow-2xl rounded-2xl sm:rounded-3xl border-0 transition-all duration-300 relative ring-2 ring-[#286575] ring-opacity-30 shadow-[#286575]/10">
          <CardContent className="p-4 sm:p-6">
            {/* Timer circular */}
            <CircularTimer timeLeft={timeLeft} total={QUESTION_TIME} invalidated={invalidated} />
            {/* (opcional) separador visual para que no choque con el contenido */}
            <div className="h-5" />
            {/* Escenario */}
            <div className="mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                {currentQuestion?.title}
              </h2>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-l-4 border-[#286575]">
                <p className="text-gray-700 leading-snug font-medium text-sm">
                  {currentQuestion?.scenario}
                </p>
              </div>
            </div>

            {showGenerativePresentationDemo && <GenerativePresentationDemo />}

            {/* Título e instrucciones */}
            <div className="mb-5 sm:mb-6">
              <p className="text-xs text-gray-600 mb-3 sm:mb-4 bg-blue-50 px-3 py-1.5 rounded-full inline-block">
                {currentQuestion?.type === "multiple-response" ? "Selección múltiple" : "Selección única"}
              </p>

              {/* Opciones */}
              <div className="space-y-2.5">
                {currentQuestion?.options?.map((option: string, index: number) => {
                  const isSelected = Array.isArray(selectedAnswer)
                    ? selectedAnswer.includes(index)
                    : selectedAnswer === index

                  return (
                  <label
                    key={index}
                    className={`flex items-start space-x-3 p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-200 ${
                      invalidated
                        ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "border-[#286575] bg-[#e6f2f3] shadow-md cursor-pointer"
                        : "border-gray-200 hover:border-[#286575] hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                    }`}
                  >
                    <div className="relative mt-0.5">
                      <input
                        type={currentQuestion.type === "multiple-response" ? "checkbox" : "radio"}
                        name="answer"
                        value={index}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(index)}
                        disabled={invalidated}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all ${
                           isSelected
                            ? "border-[#286575] bg-[#286575]"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>
                    <span className="text-gray-700 leading-snug flex-1 text-sm">
                      {option}
                    </span>
                  </label>
                  )
                })}
              </div>
            </div>

            {/* Navegación */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                {showArea5DemoControls && (
                  <Button
                    asChild
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-[#286675] rounded-xl sm:rounded-2xl font-medium text-white shadow-lg hover:bg-[#3a7d89] transition-all text-sm"
                  >
                    <Link href="/dashboard">Terminar</Link>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
                {showArea5DemoControls && (
                  <>
                    {checkResult !== null && (
                      <span className={`text-xs font-semibold rounded-full px-3 py-1 ${checkResult ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                        {checkResult ? "Correcto" : "Revisar respuesta"}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleCheck}
                      disabled={!hasAnswer || invalidated}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl sm:rounded-2xl border-[#286675] text-[#286675] font-medium shadow-sm hover:bg-[#e4f3f5] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Comprobar
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => handleNext(false)}
                  disabled={!hasAnswer || invalidated}
                  className="flex-1 sm:flex-none px-8 sm:px-10 py-2.5 bg-[#286675] rounded-xl sm:rounded-2xl font-medium text-white shadow-lg hover:bg-[#3a7d89] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLastQuestion ? "Finalizar" : "Siguiente"}
                </Button>
              </div>
            </div>

            {/* Ayuda */}
            {!hasAnswer && !invalidated && (
              <div className="mt-4 flex items-center justify-center space-x-3 text-blue-600 bg-blue-50 p-3 rounded-xl">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium">
                  Por favor, selecciona una respuesta para continuar
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
