# Instrucciones de ajuste — Ejercicios Ladico (Competencia 5)

Documento para el agente/programador. Cada punto indica **archivo(s)**, **problema**, **qué hacer** y, cuando aplica, **texto propuesto**. No cambies la lógica de puntaje salvo que se indique.

## Reglas generales (aplican a TODO)

1. **Doble archivo:** casi todos los ejercicios avanzados tienen una copia a pantalla completa en `.../pantalla/page.tsx`. **Cada cambio de contenido debe aplicarse en el archivo embebido Y en su copia `/pantalla`** para que no se desincronicen.
2. **Mayúscula inicial en todas las respuestas:** toda alternativa/opción de respuesta debe **empezar con mayúscula** (y terminar con punto si es una oración). Aplicar en TODOS los ejercicios (intermedio y avanzado de 5.1, 5.2, 5.3, 5.4). Revisar especialmente las opciones que hoy empiezan en minúscula (p. ej. los "completar la oración").
3. **Sin pistas:** ningún texto (resultado, consecuencia, etiqueta) debe delatar si la elección es correcta o incorrecta. Describir estados de forma neutra, nunca evaluar.

---

## 1) `app/exercises/comp-5-1/avanzado/ej1/page.tsx` (+ `/pantalla`)

### 1.1 Ícono de imagen repetido
- **Problema:** el ícono de imagen (`Image as ImageIcon`) se usa dos veces en la pantalla de inicio: para la app **"Fotos"** y para la app **"Fotos del viaje"** (en `APPS`, `id: "fotos"` usa `icon: ImageIcon`). Se ven dos íconos iguales.
- **Qué hacer:** darle a **"Fotos del viaje"** un ícono distinto. Importar de `lucide-react` uno de: `Images`, `FolderOpen` o `Aperture`, y cambiar en `APPS`:
  - `{ id: "fotos", name: "Fotos del viaje", size: 0.9, use: "ayer", keep: true, icon: Images }`
- Mantener el ícono `ImageIcon` solo para la app de sistema "Fotos" de la pantalla de inicio.

### 1.2 ¿Cómo se acierta la pregunta? (documentación, sin cambio de lógica)
- El punto se obtiene si: **se liberan ≥ 5 GB** (`freed >= NEED_GB`) **Y no se desinstaló ninguna app marcada `keep`** (`removedWrong === false`), y además la cámara llega a funcionar.
- **Camino correcto:** desinstalar desde **Ajustes → Almacenamiento** las dos apps grandes y en desuso: **"Juego 3D Pro" (4,2 GB, hace 3 meses)** + **"Videos guardados" (3,1 GB, hace 2 meses)** = 7,3 GB. Luego abrir **Cámara** → "Foto tomada".
- Apps `keep` (NO se deben desinstalar): **WhatsApp, Fotos del viaje, Cámara**.

### 1.3 ¿Qué pasa si desinstala una app usada recientemente?
- Hoy **ya se penaliza**: desinstalar una app `keep` (WhatsApp o Fotos del viaje, "último uso: hoy/ayer") pone `removedWrong = true` → **0 puntos**, aunque se libere espacio suficiente. Es intencional: la persona debe decidir usando el dato **"último uso"** y **tamaño**.
- **Mejora opcional (recomendada):** reforzar visualmente el dato que sostiene la decisión, destacando "último uso: hoy/ayer" en color de advertencia (p. ej. texto ámbar) para las apps recientes, sin decir que no se deben borrar. Es decisión del validador si se aplica.

---

## 2) `app/exercises/comp-5-1/avanzado/ej2/page.tsx` (+ `/pantalla`) — y GLOBAL

- **Problema:** las respuestas deben **empezar con mayúscula** (aquí y en todos los ejercicios).
- **Qué hacer:** aplicar la Regla General 2. En este ejercicio ya existe el helper `directLabel(...)` que capitaliza; puede reutilizarse el mismo patrón en los demás, **o** (preferible) editar directamente los textos de las opciones en el código fuente para que inicien en mayúscula. Verificar que no quede ninguna opción en minúscula en 5.1/5.2/5.3/5.4.

---

## 3) `app/exercises/comp-5-1/avanzado/ej3/page.tsx` (+ `/pantalla`)

- **Problema:** hay una tarjeta **"Control remoto"** (`InfoCard title="Control remoto"`) con una imagen decorativa de un control. No es interactiva (solo el celular lo es) y confunde: no cumple ninguna función.
- **Qué hacer (opción recomendada):** **eliminar por completo** la tarjeta "Control remoto" (el bloque `<InfoCard title="Control remoto" .../>`). La red de la TV ya se comunica en la tarjeta "Smart TV" ("Red: MiRedCasa"), así que el control no aporta.
- **Opción alternativa:** si se quiere conservar la idea del control, convertir la info de red de la TV en algo que el usuario deba "descubrir", pero **solo si se hace realmente interactivo**; de lo contrario, eliminarlo (recomendado).
- Tras eliminarlo, quedan dos tarjetas de solo lectura (Smart TV y Router) + el celular interactivo.

---

## 4) `app/exercises/comp-5-3/intermedio/ej1/page.tsx` (+ no tiene `/pantalla`)

- **Problema:** las 4 situaciones son **demasiado evidentes** para distinguir "centrado en las personas" vs "no centrado". Se necesita que cuesten más y exijan análisis.
- **Qué hacer:** reemplazar el arreglo `SITS` por situaciones más sutiles (cada una mezcla elementos atractivos y fricciones, pero mantiene una respuesta defendible). `correct: 0 = centrado en las personas`, `1 = NO centrado`.

### Opción recomendada (reemplazo de las 4 situaciones)

```
1. { correct: 0 } — "Una municipalidad lanza una app de trámites con un diseño sencillo; tardó varios meses más de lo previsto porque incorporó las pruebas y comentarios de vecinos mayores, y permite deshacer cada paso antes de confirmar."
   Razón: prioriza necesidades y control del usuario aunque sea más lenta de desarrollar → centrado.

2. { correct: 1 } — "Una app de finanzas muy elogiada por su diseño y su rapidez personaliza la experiencia recopilando datos de uso en segundo plano; no explica qué datos toma ni ofrece una forma de desactivarlo."
   Razón: lo llamativo (rápida, premiada, 'personaliza') oculta falta de transparencia y control → no centrado.

3. { correct: 0 } — "Una plataforma de salud reduce funciones vistosas para cargar rápido en teléfonos antiguos y con poca señal, e incluye una versión por teléfono para quienes no usan la app."
   Razón: sacrifica atractivo para incluir a más personas y ofrece alternativa → centrado.

4. { correct: 1 } — "Un servicio de atención reemplaza a sus operadores por un asistente automático disponible las 24 horas que resuelve más rápido; no ofrece una vía para hablar con una persona cuando el caso es complejo."
   Razón: la eficiencia y disponibilidad suenan positivas, pero no deja salida humana ante casos difíciles → no centrado.
```

- Mantener el resto del ejercicio igual (etiquetas `LABELS`, puntaje `ok >= 3`).
- Nota: dejar el orden mezclado (no 0,1,0,1 evidente) es opcional; el patrón actual 0,1,0,1 puede mantenerse.
- Si el validador quiere más dificultad aún, se pueden pedir 2–3 situaciones adicionales del mismo estilo para rotar.

---

## 5) `app/exercises/comp-5-3/intermedio/ej3/page.tsx`

- **Problema:** algunas opciones incluyen una cláusula explicativa ("aunque…", "…para generar…", "sin su consentimiento…") que **delata** la respuesta. Ejemplo: *"Comprar publicidad pagada dirigida a todo el país, **aunque el presupuesto es limitado y la campaña es local**."*
- **Qué hacer:** en `OPTIONS`, **quitar las cláusulas evaluativas** y dejar solo la acción, de forma neutra. La opción debe seguir siendo incorrecta por su fondo, no por el texto. Mantener `CORRECT = new Set([0, 1, 3, 5])`.

### Texto propuesto (reemplazo del arreglo `OPTIONS`, mismo orden)

```
0. "Crear un grupo de WhatsApp con los vecinos para coordinar puntos de recolección, horarios y voluntarios."            (correcta)
1. "Diseñar un afiche digital gratuito con una herramienta en línea y difundirlo por las redes sociales del barrio."      (correcta)
2. "Comprar publicidad pagada dirigida a todo el país para la campaña."                                                    (incorrecta)
3. "Crear una planilla compartida en línea para registrar las donaciones recibidas y a qué familia se destinan."          (correcta)
4. "Publicar fotografías de las familias afectadas en las redes sociales del barrio."                                      (incorrecta)
5. "Usar un mapa en línea para compartir con los vecinos la ubicación de los puntos de recolección."                       (correcta)
```

- Regla para el agente: **ninguna opción debe contener "porque", "aunque", "ya que", "para (generar/evitar)…"** ni juicios; solo la acción.

---

## 6) `app/exercises/comp-5-3/avanzado/ej2/page.tsx` (+ `/pantalla`)

- **Problema:** al avanzar, la pantalla del computador muestra textos que **delatan** que la elección fue mala. Ejemplo: *"Formulario impreso — Vuelve al papel, justo lo que la herramienta digital evitaba."* Eso avisa que va por mal camino.
- **Qué hacer:** en las opciones incorrectas (las que tienen `screen: { title, text }`), reescribir `text` para que sea **puramente descriptivo del estado**, sin evaluar. Mantener títulos y lógica; solo neutralizar el `text`. Las pantallas correctas (`"forms"`, `"formQ"`, `"responses"`, `"summary"`) se dejan igual.

### Texto propuesto (solo el campo `text` de cada opción incorrecta)

```
1b Word            title "Documento de Word"            text "Las preguntas quedan escritas en un documento para imprimir."
1c Correo          title "Correo electrónico"           text "Se abre un correo nuevo para escribir a los vecinos."
1d Pago            title "Programa de encuestas de pago" text "La página pide una suscripción para descargar el programa."
2b Sin título      title "Formulario sin título"        text "El formulario queda con una sola pregunta abierta."
2c Copiar          title "Preguntas pegadas"            text "Se pegan en el formulario preguntas de otra encuesta."
2d Muchas          title "Formulario extenso"           text "El formulario queda con muchas preguntas."
3b Firmar          title "Datos personales solicitados" text "El formulario pide nombre y RUT en cada respuesta."
3c Imprimir        title "Formulario impreso"           text "El formulario se imprime en papel."
3d Redes personales title "Enlace en redes personales"  text "El enlace queda publicado en el perfil personal."
4b Reiniciar       title "Equipo reiniciado"            text "El computador se reinicia."
4c 10 respuestas   title "Diez respuestas"              text "Se toma una decisión con las primeras diez respuestas."
4d Reenviar        title "Reenvío diario"               text "El formulario se reenvía cada día a los vecinos."
```

- Regla: describir **qué quedó en pantalla**, nunca si estuvo bien o mal.
- Nota de diseño: como las pantallas correctas muestran el avance real del formulario y las incorrectas muestran otra ventana, sigue habiendo una diferencia visual. Si el validador quiere quitar TODA señal, la alternativa es que la pantalla no cambie de "camino" y solo registre la acción; pero eso contradice el pedido previo de "que la pantalla refleje lo que elijo". Se recomienda dejar el reflejo visual + textos neutros (lo anterior).

---

## Checklist final para el agente

- [ ] 5.1 av ej1: ícono distinto para "Fotos del viaje" (embebido + `/pantalla`).
- [ ] Mayúscula inicial en TODAS las opciones de todos los ejercicios.
- [ ] 5.1 av ej3: eliminar tarjeta "Control remoto" (embebido + `/pantalla`).
- [ ] 5.3 int ej1: reemplazar las 4 situaciones por las sutiles.
- [ ] 5.3 int ej3: quitar cláusulas "aunque/para/sin…" de las opciones (C y E).
- [ ] 5.3 av ej2: neutralizar el `text` de las 12 pantallas incorrectas (embebido + `/pantalla`).
- [ ] Verificar tipos/compilación tras los cambios.
