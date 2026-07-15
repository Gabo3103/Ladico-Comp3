"use client"
import { useEffect, useState, type ReactNode } from "react"
import { Flag, ChevronDown, HelpCircle, Calendar, User, Lock, CheckCircle } from "lucide-react"

const KEY = "ladico:5.2:avanzado:ej1:marks"

export default function PortalPage() {
  const [marks, setMarks] = useState<Set<string>>(new Set())

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setMarks(new Set(JSON.parse(raw) as string[])) } catch { /* no-op */ }
  }, [])

  const toggle = (id: string) => setMarks(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id)
    try { localStorage.setItem(KEY, JSON.stringify([...n])) } catch { /* no-op */ }
    return n
  })

  const Z = ({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) => {
    const on = marks.has(id)
    return (
      <button type="button" onClick={() => toggle(id)}
        className={`relative text-left rounded-lg transition outline-none ${on ? "ring-2 ring-red-500 bg-red-50" : "ring-1 ring-transparent hover:ring-gray-300"} ${className}`}>
        {on && <span className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1 shadow"><Flag className="w-3 h-3" /></span>}
        {children}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200 py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto mb-4 rounded-xl bg-[#286575] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow">
        <p className="text-sm">Marque (haga clic para resaltar en rojo) <b>únicamente</b> los elementos que son una barrera de accesibilidad. Puede volver a hacer clic para desmarcar.</p>
        <button onClick={() => window.close()} className="text-sm bg-white text-[#286575] font-medium rounded-lg px-4 py-2 shrink-0 flex items-center gap-1 hover:bg-gray-100"><CheckCircle className="w-4 h-4" /> Guardar y volver al ejercicio</button>
      </div>

      <div className="max-w-5xl mx-auto rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-300">
        {/* Barra del navegador */}
        <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-2">
          <span className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-400" /></span>
          <div className="flex-1 mx-3 bg-white rounded-full border px-3 py-1 flex items-center gap-2 text-xs text-gray-500"><Lock className="w-3 h-3 text-gray-400" /> https://agenda.saludpublica.cl/reservar</div>
        </div>

        {/* Cabecera del portal */}
        <div className="bg-[#0b4f6c] text-white px-5 py-4 flex items-center justify-between gap-3">
          <span className="font-semibold text-base sm:text-lg">Portal de Agenda de Horas Médicas</span>
          <div className="flex items-center gap-2">
            {/* BARRERA: botones de ícono sin etiqueta */}
            <Z id="btns" className="flex items-center gap-1 p-1">
              <span className="w-9 h-9 rounded bg-white/20 flex items-center justify-center"><User className="w-5 h-5" /></span>
              <span className="w-9 h-9 rounded bg-white/20 flex items-center justify-center"><Calendar className="w-5 h-5" /></span>
            </Z>
            {/* facilitador: control de tamaño de texto */}
            <Z id="texto" className="px-2.5 py-1.5 bg-white/15 rounded text-sm font-medium">A+ / A−</Z>
            {/* facilitador: enlace de ayuda descriptivo */}
            <Z id="ayuda" className="px-2.5 py-1.5 rounded text-sm flex items-center gap-1"><HelpCircle className="w-4 h-4" /> Ayuda para completar el formulario</Z>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* facilitador: enlace de saltar al contenido */}
          <Z id="saltar" className="inline-block text-sm text-[#0b4f6c] underline">Saltar al contenido principal</Z>

          {/* BARRERA: texto de bajo contraste (gris claro casi ilegible) */}
          <Z id="contraste" className="block">
            <span className="block text-base" style={{ color: "#cfd4d8" }}>Complete todos los campos para reservar su hora médica. Si tiene dudas, consulte la sección de ayuda.</span>
          </Z>

          {/* BARRERA: menú solo con mouse */}
          <Z id="menu" className="w-full sm:w-80 p-3.5 border border-gray-200 rounded-lg bg-gray-50">
            <span className="flex items-center justify-between text-sm text-gray-700">Especialidades <ChevronDown className="w-4 h-4" /></span>
            <span className="block text-[12px] text-gray-400 mt-1">Desplegable que solo se abre y navega con el mouse.</span>
          </Z>

          {/* BARRERA: información dada solo por color (WCAG 1.4.1 Uso del color) — disponibilidad indicada solo por color, sin texto */}
          <Z id="color" className="block">
            <span className="block text-sm text-gray-700 mb-1.5">Horas para hoy:</span>
            <span className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-md bg-green-500 text-white text-sm">09:00</span>
              <span className="px-3 py-1.5 rounded-md bg-green-500 text-white text-sm">10:30</span>
              <span className="px-3 py-1.5 rounded-md bg-red-500 text-white text-sm">12:00</span>
              <span className="px-3 py-1.5 rounded-md bg-red-500 text-white text-sm">15:00</span>
            </span>
          </Z>

          {/* facilitador: instrucción general de campos obligatorios, buen contraste (W3C WAI Forms — overall instructions) */}
          <p className="text-sm text-gray-700">Los campos marcados como <b>(obligatorio)</b> deben completarse.</p>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* facilitador: campos separados, con etiqueta visible y requisito indicado con texto (WCAG 3.3.2 / 1.3.1, W3C WAI Forms) */}
            <Z id="campoOk" className="block">
              <span className="block mb-3">
                <span className="block text-sm text-gray-700 mb-1 font-medium">Nombre <span className="text-gray-500 font-normal">(obligatorio)</span></span>
                <span className="block text-xs text-gray-600 mb-1.5">Tal como aparece en su documento de identidad.</span>
                <span className="block h-10 rounded-lg border border-gray-300 bg-white" />
              </span>
              <span className="block">
                <span className="block text-sm text-gray-700 mb-1 font-medium">Apellidos <span className="text-gray-500 font-normal">(obligatorio)</span></span>
                <span className="block text-xs text-gray-600 mb-1.5">Escriba sus dos apellidos si corresponde.</span>
                <span className="block h-10 rounded-lg border border-gray-300 bg-white" />
              </span>
            </Z>
            {/* BARRERA: fecha con asterisco sin explicación y sin indicar el formato esperado */}
            <Z id="aster" className="block">
              <span className="block text-sm text-gray-600 mb-1.5">Fecha de la hora <span className="text-red-500 font-bold">*</span></span>
              <span className="block h-10 rounded-lg border border-gray-200 bg-white" />
            </Z>
          </div>

          {/* BARRERA: mensaje de error genérico */}
          <Z id="error" className="w-full block p-4 rounded-lg bg-red-100/70 border border-red-200">
            <span className="text-sm text-red-700">Ha ocurrido un error. Intente nuevamente.</span>
          </Z>

          {/* facilitador: opción real con etiquetas claras (canal alternativo de confirmación) */}
          <Z id="confirm" className="w-full block p-4 rounded-lg border border-gray-200 bg-gray-50">
            <span className="block text-sm text-gray-700 mb-2 font-medium">¿Cómo desea recibir la confirmación de la reserva?</span>
            <span className="flex flex-wrap gap-5">
              <span className="flex items-center gap-2 text-sm text-gray-700"><span className="w-4 h-4 rounded-full border-2 border-[#0b4f6c] inline-block" /> Por SMS</span>
              <span className="flex items-center gap-2 text-sm text-gray-700"><span className="w-4 h-4 rounded-full border-2 border-gray-400 inline-block" /> Por correo electrónico</span>
            </span>
          </Z>

          {/* BARRERA: letra diminuta */}
          <Z id="diminuto" className="block">
            <span className="block text-gray-500" style={{ fontSize: "8px", lineHeight: "12px" }}>Al reservar, usted acepta los términos y condiciones del servicio, la política de datos personales y el protocolo de atención vigente publicado por la institución.</span>
          </Z>

          <div className="flex justify-end">
            <span className="px-5 py-2.5 rounded-lg bg-[#0b4f6c] text-white text-sm">Reservar hora</span>
          </div>
        </div>
      </div>

      <p className="max-w-5xl mx-auto text-center text-xs text-gray-500 mt-3">Elementos marcados como barrera: {marks.size} · Puede cerrar esta ventana cuando termine.</p>
    </div>
  )
}
