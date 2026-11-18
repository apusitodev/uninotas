@AGENTS.md

# UniNotas — instrucciones para Claude

## Quién soy y cómo hablarme
- Soy principiante: no sé programar. Explícame todo en español, sin jerga, y define cualquier término técnico la primera vez que salga (commit, rama, deploy, variable de entorno…).
- Usa ejemplos de este proyecto (pantallas, botones y archivos reales de UniNotas), no ejemplos genéricos.
- Mis instrucciones completas de trabajo y seguridad están al final de este archivo. Síguelas siempre.

## Qué es UniNotas
Web/PWA (web que se puede instalar en el móvil como una app) para estudiantes de la EUM: asistencia, horario, calendario de exámenes y trabajos, y cálculo de notas ponderadas.
- En producción: https://uninotas.vercel.app
- Repositorio: https://github.com/apusitodev/uninotas (rama `main`, público)
- Versiones guardadas: etiquetas `v1-estable` y `v2-estable`
- Plan de tareas y estado detallado: `PLAN.md`
- El resumen antiguo de Gemini está desactualizado. Si algo no coincide, manda el código.

## Herramientas (stack)
- **Next.js 16.3 (App Router) + React 19 + TypeScript.** Ojo: Next 16 cambia cosas respecto a versiones antiguas; lee `AGENTS.md` y la documentación de `node_modules/next/dist/docs/` antes de usar algo que no conozcas.
- **Tailwind CSS 4** para estilos. Iconos: `lucide-react` (también está `@tabler/icons-react`). Animaciones: `framer-motion`.
- **Supabase**: login y base de datos (ver abajo).
- **Gemini** (`/api/parse-syllabus`, modelo `gemini-3.8-flash`): lee PDFs de calendario/guía docente en el onboarding.
- **Notificaciones push**: `web-push` + `public/sw.js` + `lib/pushNotifications.ts` + `/api/send-notification`.
- **Vercel**: publica la web (ver abajo).

## Mapa del código
| Ruta / archivo | Qué es |
|---|---|
| `app/page.tsx` (`/`) | Pantalla de entrada: login y registro |
| `app/onboarding/page.tsx` | Asistente de 5 pasos (universidad, festivos/exámenes, asignaturas, horarios, final) |
| `app/dashboard/page.tsx` | Todo el panel en un solo archivo (~92 KB): pestañas General, Diario, Calendario, Asistencia, Notas |
| `app/dashboard/settings/page.tsx` | Ajustes (`/dashboard/settings`): Asignaturas, Pesos, Preferencias, Cuenta |
| `app/api/parse-syllabus/route.ts` | Ruta de servidor: manda un PDF a Gemini |
| `app/api/send-notification/route.ts` | Ruta de servidor: manda notificaciones push |
| `components/Sidebar.tsx` | Menú lateral |
| `components/ui/` | Piezas reutilizables: calendario, anillo de progreso, desplegable |
| `app/legal/*` | Aviso legal, cookies, privacidad, términos |
| `app/maintenance/page.tsx` | Página de "en mantenimiento" (ahora mismo no se usa) |
| `app/sitemap.ts` | Lista de páginas para Google |
| `middleware.ts.bak` | Antiguo bloqueo de mantenimiento. Está desactivado (por el `.bak`). No lo reactives sin preguntarme |
| `lib/supabase.ts` | Conexión única con Supabase (clave pública "anon") |
| `lib/types.ts` | Formas de los datos (asignatura, evento, criterio…) |
| `public/manifest.json` | Ficha de la app instalable (nombre, iconos) |

## Cómo se usa Supabase
- **Login**: email + contraseña (`signInWithPassword` / `signUp` en `app/page.tsx`). No hay login con Google.
- **Tablas** (base de datos):
  - `profiles` — datos del usuario (universidad, etc.)
  - `user_subjects` — sus asignaturas y horarios
  - `evaluation_categories` — criterios de evaluación y su peso (%)
  - `custom_sub_criteria` — sub-criterios que crea el usuario
  - `user_grades` — sus notas
  - `academic_events` — exámenes, trabajos y festivos
  - `attendance_logs` — registro de asistencia
  - `push_subscriptions` — el dispositivo donde recibir notificaciones (una por usuario)
- Cada tabla debe tener RLS (reglas para que cada usuario solo vea y cambie lo suyo). Desde el código no se puede comprobar: está pendiente revisarlo en el panel de Supabase.

## Cómo se publica en Vercel
- Al subir cambios a `main` en GitHub, Vercel construye y publica la web sola en https://uninotas.vercel.app.
- Las claves se configuran en Vercel → Settings → Environment Variables. Nombres que usa el código (nunca escribas sus valores aquí):
  - Públicas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_SITE_URL`
  - Secretas: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- Pendiente: el conector de Vercel de Claude no encuentra el proyecto; hay que confirmar en qué cuenta está.

## Estado (revisado el 18/11/2026; detalle en `PLAN.md`)
**Funciona:** registro y login · onboarding de 5 pasos (con PDF + IA o a mano) · panel con sus 5 pestañas · ajustes de asignaturas, horarios y pesos · cálculo de notas · páginas legales.

**A medias / roto:**
- Botón "Instalar App en el Móvil": abre una ventana que no existe en el código; además faltan los iconos `icon-192x192.png` e `icon-500x500.png` que pide `manifest.json`.
- "Cerrar sesión" en Ajustes lleva a `/login`, que no existe (error 404).
- "Borrar cuenta": en Ajustes solo dice "Contacta con soporte técnico"; en el panel borra los datos pero no la cuenta ni la suscripción push.
- "Reportar problema" no envía nada.
- Notificaciones: solo se guarda un dispositivo por usuario (el último pisa al anterior). Ninguna pantalla llama aún a `/api/send-notification`.
- Quedan ~19 `window.confirm`/`alert` (sobre todo en onboarding y ajustes) por cambiar a modales propios.
- Modo oscuro: casi no existe en el código.

**Problemas conocidos (seguridad, urgente):**
- `/api/send-notification` y `/api/parse-syllabus` no comprueban quién llama: cualquiera puede usarlas.
- `middleware.ts.bak` contiene un correo personal y está subido a GitHub (repositorio público).

**Otros:**
- `app/sitemap.ts` usa `https://uninotas.app` si falta `NEXT_PUBLIC_SITE_URL`, pero la web real es `uninotas.vercel.app`.
- La carpeta del proyecto está en el Escritorio, que se sincroniza con iCloud: si Git da errores raros o hay archivos que no se pueden abrir, puede ser por eso.

## Diseño (respétalo)
Estilo Apple: fondo gris `#f4f5f8`, azul `#0071e3`, tarjetas blancas semitransparentes con `backdrop-blur`, esquinas `rounded-2xl`/`rounded-3xl`, sombras suaves, textos pequeños y en negrita. Fuente Geist. Por ahora solo hay modo claro.

## Normas técnicas
1. **Cambios pequeños.** Una cosa cada vez. Nada de reescribir archivos enteros si no te lo pido.
2. **`app/dashboard/page.tsx` es frágil**: está todo junto a propósito porque separarlo dio problemas. Si hay que separarlo, será poco a poco y avisándome antes.
3. **Prueba antes de dar algo por terminado**: `npm run build` (comprueba que la web se construye sin errores) y, si toca pantallas, `npm run dev` para verla en http://localhost:3000.
4. **Git**: no hagas `push` a `main` sin que yo diga "sí". Propón el mensaje del commit (la "foto" guardada de los cambios) en español y explícamelo.
5. **Antes de algo arriesgado** (borrar datos, tocar la base de datos, cambiar el login), avísame y propón crear una etiqueta de seguridad (como `v2-estable`).
6. **Textos de la web en español.** Ventanas de confirmación: usa modales propios, no `window.confirm` ni `alert`.
7. **Al terminar una tarea, actualiza `PLAN.md`** (estado y lo que falta) y, si cambia algo importante, este archivo.

## Seguridad técnica (obligatorio)
- Las claves van **solo** en `.env.local` (en mi ordenador) y en Vercel. Nunca en el código ni en GitHub. No abras ni muestres `.env.local`.
- Solo pueden empezar por `NEXT_PUBLIC_` las claves que pueden verse en el navegador.
- Las claves secretas solo se usan dentro de `app/api/`.
- Toda ruta de `app/api/` debe comprobar quién llama (usuario con sesión iniciada) antes de hacer nada.
- No pongas correos personales ni datos privados en el código.

## Comandos útiles
- `npm install` — instala las piezas que necesita el proyecto
- `npm run dev` — abre la web en tu ordenador (http://localhost:3000)
- `npm run build` — comprueba que todo se construye bien (lo mismo que hará Vercel)
- `npm run lint` — busca errores típicos en el código

---

## Mis instrucciones del proyecto (copiadas tal cual)

Soy principiante y no sé programar. Explícame todo en español y sin jerga; si usas una palabra técnica, explícala.
Uso un MacBook. El proyecto usa VSCode, GitHub, Supabase y Vercel.

### Forma de trabajar
- Antes de cambiar nada, explícame qué vas a hacer y por qué, y espera a que te diga que sí.
- Divide cada tarea en pasos. Hazlos de uno en uno y explícame cada uno.
- No pases al siguiente paso hasta que yo te diga que el anterior está completado.
- No me pases código ni lo escribas en los archivos hasta que yo te lo pida.
- Después de cada cambio, dime cómo comprobar que funciona.

### Seguridad
- Nunca muestres ni subas a GitHub contraseñas o claves (archivos .env).
- Si no estás seguro de algo, pregúntame.
