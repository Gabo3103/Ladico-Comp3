"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Question } from "@/types"
import QuestionPreview from "@/components/QuestionPreview"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Trash } from "lucide-react" // Icono de eliminar

const COMPETENCES = ["1", "2", "3", "4", "5"]

const DEFAULT_SUBCOMPETENCES: Record<string, string[]> = {
  "1": ["1.1", "1.2", "1.3"],
  "2": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"],
  "3": ["3.1", "3.2", "3.3", "3.4"],
  "4": ["4.1", "4.2", "4.3", "4.4"],
  "5": ["5.1", "5.2", "5.3", "5.4"],
}

export default function QuestionsAdminPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [competenceFilter, setCompetenceFilter] = useState("all")
  const [subcompetenceFilter, setSubcompetenceFilter] = useState("all")
  const router = useRouter()
  const loadQuestionsRan = useRef(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (loadQuestionsRan.current) return
    loadQuestionsRan.current = true
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      if (!db) return
      const querySnapshot = await getDocs(collection(db, "questions"))
      const loadedQuestions: Question[] = []
      querySnapshot.forEach((doc) => {
        loadedQuestions.push({ id: doc.id, ...doc.data() } as Question)
      })
      setQuestions(loadedQuestions)
    } catch (error) {
      console.error("Error loading questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const subcompetences = useMemo(() => {
    if (competenceFilter === "all") return []
    const available = questions
      .map((question) => question.competence)
      .filter((code) => code?.startsWith(`${competenceFilter}.`))

    return Array.from(
      new Set([...(DEFAULT_SUBCOMPETENCES[competenceFilter] || []), ...available])
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }, [questions, competenceFilter])

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesCompetence =
        competenceFilter === "all" || question.competence?.startsWith(`${competenceFilter}.`)
      const matchesSubcompetence =
        subcompetenceFilter === "all" || question.competence === subcompetenceFilter
      return matchesCompetence && matchesSubcompetence
    })
  }, [questions, competenceFilter, subcompetenceFilter])

  const visibleIds = filteredQuestions.map((question) => question.id)
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someVisibleSelected
  }, [someVisibleSelected])

  const clearSelectionForNewFilter = () => {
    setSelectedIds(new Set())
    setSelectedQuestion(null)
  }

  const handleCompetenceChange = (value: string) => {
    setCompetenceFilter(value)
    setSubcompetenceFilter("all")
    clearSelectionForNewFilter()
  }

  const handleSubcompetenceChange = (value: string) => {
    setSubcompetenceFilter(value)
    clearSelectionForNewFilter()
  }

  const toggleQuestion = (questionId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id))
      else visibleIds.forEach((id) => next.add(id))
      return next
    })
  }

  const deleteQuestions = async (questionIds: string[]) => {
    if (!db || questionIds.length === 0) return

    const message = questionIds.length === 1
      ? "¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer."
      : `¿Estás seguro de que deseas eliminar ${questionIds.length} preguntas? Esta acción no se puede deshacer.`
    if (!confirm(message)) return

    setDeleting(true)
    try {
      await Promise.all(questionIds.map((questionId) => deleteDoc(doc(db, "questions", questionId))))
      const deletedIds = new Set(questionIds)
      setQuestions((current) => current.filter((question) => !deletedIds.has(question.id)))
      setSelectedIds((current) => {
        const next = new Set(current)
        questionIds.forEach((id) => next.delete(id))
        return next
      })
      if (selectedQuestion && deletedIds.has(selectedQuestion.id)) setSelectedQuestion(null)
    } catch (error) {
      console.error("Error eliminando preguntas:", error)
      alert("No se pudieron eliminar todas las preguntas. Recarga la página para comprobar el estado.")
      await loadQuestions()
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#286675]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Banco de Preguntas</h1>
            <p className="text-gray-600">Gestiona y visualiza todas las preguntas del sistema.</p>
          </div>
          <Button onClick={() => router.push("/admin")} className="text-white bg-[#286675] hover:bg-[#3a7d89] rounded-xl">
            Agregar Nueva Pregunta
          </Button>
        </div>

        <Card className="mb-6 rounded-xl">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Competencia</span>
                <select
                  value={competenceFilter}
                  onChange={(event) => handleCompetenceChange(event.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-gray-900 focus:border-[#286675] focus:outline-none focus:ring-2 focus:ring-[#286675]/20"
                >
                  <option value="all">Todas</option>
                  {COMPETENCES.map((competence) => (
                    <option key={competence} value={competence}>Competencia {competence}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Subcompetencia</span>
                <select
                  value={subcompetenceFilter}
                  onChange={(event) => handleSubcompetenceChange(event.target.value)}
                  disabled={competenceFilter === "all"}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 focus:border-[#286675] focus:outline-none focus:ring-2 focus:ring-[#286675]/20"
                >
                  <option value="all">Todas</option>
                  {subcompetences.map((subcompetence) => (
                    <option key={subcompetence} value={subcompetence}>
                      Subcompetencia {subcompetence}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Preguntas disponibles ({filteredQuestions.length} de {questions.length})
              </h2>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={() => deleteQuestions(Array.from(selectedIds))}
                  className="rounded-xl"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {deleting ? "Eliminando..." : `Eliminar seleccionadas (${selectedIds.size})`}
                </Button>
              )}
            </div>

            {filteredQuestions.length > 0 && (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 font-medium text-gray-800 shadow-sm">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  disabled={deleting}
                  className="h-5 w-5 rounded border-gray-300 accent-[#286675]"
                />
                <span>Todas ({filteredQuestions.length})</span>
              </label>
            )}

            {questions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No hay preguntas en el banco de datos.</p>
                  <Button className="mt-4 Ladico-button-primary" onClick={() => router.push("/admin")}>
                    Agregar Primera Pregunta
                  </Button>
                </CardContent>
              </Card>
            ) : filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No hay preguntas para los filtros seleccionados.</p>
                </CardContent>
              </Card>
            ) : (
              filteredQuestions.map((question) => (
                <Card
                  key={question.id}
                  className={`cursor-pointer transition-all rounded-xl hover:shadow-lg relative ${
                    selectedQuestion?.id === question.id ? "ring-2 ring-[#286675]" : ""
                  }`}
                  onClick={() => setSelectedQuestion(question)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(question.id)}
                          disabled={deleting}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => toggleQuestion(question.id)}
                          aria-label={`Seleccionar ${question.title}`}
                          className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 accent-[#286675]"
                        />
                        <h3 className="font-semibold text-gray-900 truncate">{question.title}</h3>
                      </div>
                      <div className="flex shrink-0 items-center space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {question.country || "Sin país"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.competence}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deleting}
                          aria-label="Eliminar pregunta"
                          onClick={(event) => {
                            event.stopPropagation()
                            deleteQuestions([question.id])
                          }}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 line-clamp-2">{question.scenario}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {question.level}
                      </Badge>
                      {question.pais && <span className="text-xs text-gray-500">🌎 {question.pais}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="sticky top-8">
            {selectedQuestion ? (
              <QuestionPreview question={selectedQuestion} />
            ) : (
              <Card className="rounded-xl shadow-lg">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Selecciona una pregunta para ver la vista previa.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
