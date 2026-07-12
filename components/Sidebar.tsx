"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Home, Award, Settings, Menu, X, LogOut, HelpCircle, CheckSquare, Eye } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { firstExerciseRoute } from "@/lib/firstExerciseRoute"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Competencias", href: "/dashboard", icon: Award },
]

const AREA3_DEMO_COMPETENCES = [
  { id: "3.1", label: "Desarrollo de contenidos digitales" },
  { id: "3.2", label: "Integración y reelaboración" },
  { id: "3.3", label: "Derechos de autor y licencias" },
  { id: "3.4", label: "Pensamiento computacional y programación" },
] as const

const AREA5_DEMO_COMPETENCES = [
  { id: "5.1", label: "Identificar y resolver problemas técnicos" },
  { id: "5.2", label: "Necesidades y respuestas tecnológicas" },
  { id: "5.3", label: "Uso creativo de tecnologías digitales" },
  { id: "5.4", label: "Necesidades de competencia digital" },
] as const

export default function Sidebar() {
  const { logout, userData, user, isProfesor } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const isAdmin = user?.email?.endsWith('@admin.com') || false
  const demoMode = isProfesor || isAdmin

  const goToDemo = (competenceId: string, level: "basico" | "intermedio" | "avanzado") => {
    setIsOpen(false)
    router.push(firstExerciseRoute(competenceId, level))
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[110] p-2 bg-[#286675] text-white rounded-full shadow-lg focus:outline-none"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        style={{ margin: 0, border: 0 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[100]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed top-0 left-0 h-[100dvh] w-[70vw] max-w-xs lg:top-6 lg:bottom-6 lg:left-6 lg:h-auto lg:w-56 bg-[#286675] rounded-3xl shadow-xl z-[110] transition-transform duration-300
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ willChange: 'transform', contain: 'layout style paint' }}>
        <div className="flex flex-col h-full">
          <div className="pt-5 px-4">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-[#94b2ba] rounded-full flex items-center justify-center text-white-200 hover:text-white hover:bg-[#94b2ba] transition-colors lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex justify-center py-4 lg:justify-center">
                <Link href="/" onClick={() => setIsOpen(false)}>
                <img
                  src="/ladico_white.png"
                  alt="Ladico Logo"
                  className="w-32 max-w-full object-contain ml-7"
                />
                </Link>
              </div>
              <div className="w-8 lg:hidden"></div>
            </div>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-transparent text-white transition-colors hover:bg-[#94b2ba]"
              >
                <Home className="w-5 h-5 mr-3" />
                Inicio
              </Link>

              <Link
                href="/certification"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-transparent text-white transition-colors hover:bg-[#94b2ba]"
              >
                <Award className="w-5 h-5 mr-3" />
                Certificación
              </Link>

              {/*
              <Link
                href="/multiple-response"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-transparent text-white transition-colors hover:bg-[#94b2ba]"
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                Multiple Response
              </Link> */}

              <div className="pt-6">
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-transparent text-white transition-colors hover:bg-[#94b2ba]"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Administración
                  </Link>
                )}
              </div>
            </nav>
          </div>

          <div className="flex-1"></div>

          <div className="px-4 pb-4">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center p-3 bg-indigo-100/10 rounded-xl border border-indigo-100/10 mb-3">
                <div className="w-10 h-10 bg-indigo-100/70 rounded-full flex items-center justify-center text-white font-medium border border-indigo-100/70 text-sm">
                  {userData?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm text-white truncate">{userData?.name || 'Usuario'}</p>
                </div>
              </div>

            </Link>

            {demoMode && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-xl text-white hover:bg-[#94b2ba] hover:text-white transition-colors mb-2 border border-white/20"
                    >
                      <Eye className="w-5 h-5 mr-3" />
                      Demo Área 3
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-64 border border-slate-200 bg-white text-slate-800 shadow-lg"
                    style={{ zIndex: 9999 }}
                  >
                    <DropdownMenuLabel className="text-slate-700">
                      Elige competencia y nivel
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200" />
                    {AREA3_DEMO_COMPETENCES.map((comp) => (
                      <DropdownMenuSub key={comp.id}>
                        <DropdownMenuSubTrigger className="focus:bg-slate-100 data-[state=open]:bg-slate-100">
                          {comp.id} — {comp.label}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent
                            className="border border-slate-200 bg-white text-slate-800 shadow-lg"
                            style={{ zIndex: 9999 }}
                          >
                            <DropdownMenuItem
                              className="cursor-pointer focus:bg-slate-100"
                              onSelect={() => goToDemo(comp.id, "intermedio")}
                            >
                              Intermedio
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer focus:bg-slate-100"
                              onSelect={() => goToDemo(comp.id, "avanzado")}
                            >
                              Avanzado
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-xl text-white hover:bg-[#94b2ba] hover:text-white transition-colors mb-2 border border-white/20"
                    >
                      <Eye className="w-5 h-5 mr-3" />
                      Demo Área 5
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-72 border border-slate-200 bg-white text-slate-800 shadow-lg"
                    style={{ zIndex: 9999 }}
                  >
                    <DropdownMenuLabel className="text-slate-700">
                      Elige competencia y nivel
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200" />
                    {AREA5_DEMO_COMPETENCES.map((comp) => (
                      <DropdownMenuSub key={comp.id}>
                        <DropdownMenuSubTrigger className="focus:bg-slate-100 data-[state=open]:bg-slate-100">
                          {comp.id} — {comp.label}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent
                            className="border border-slate-200 bg-white text-slate-800 shadow-lg"
                            style={{ zIndex: 9999 }}
                          >
                            <DropdownMenuItem
                              className="cursor-pointer focus:bg-slate-100"
                              onSelect={() => goToDemo(comp.id, "basico")}
                            >
                              Básico
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer focus:bg-slate-100"
                              onSelect={() => goToDemo(comp.id, "intermedio")}
                            >
                              Intermedio
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer focus:bg-slate-100"
                              onSelect={() => goToDemo(comp.id, "avanzado")}
                            >
                              Avanzado
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <button
              onClick={logout}
              className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-xl text-white hover:bg-[#94b2ba] hover:text-white transition-colors mb-4"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar sesión
            </button>

          </div>
        </div>
      </div>
    </>
  )
}
