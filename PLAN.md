# UniNotas — PLAN

_Última revisión: 17/11/2026, hecha leyendo el código real (no el resumen de Gemini)._

## Estado actual en una frase
La app funciona de punta a punta (registro → onboarding de 5 pasos → panel con 5 pestañas → ajustes), pero tiene **dos agujeros de seguridad** en las rutas de servidor y varios botones que no hacen lo que dicen.

---

## Fase 0 — Seguridad (urgente, antes que nada)
- [ ] Proteger `/api/send-notification`: ahora **cualquiera** puede llamarla y mandar notificaciones a todos los usuarios. Debe comprobar que quien llama es el administrador.
- [ ] Proteger `/api/parse-syllabus`: ahora cualquiera puede usarla y gastar tu cuota de Gemini. Debe exigir sesión iniciada y limitar usos.
- [ ] Comprobar en Supabase que **las 8 tablas** tienen RLS activado con la regla "cada uno solo lo suyo".
- [ ] Quitar tu correo personal de `middleware.ts.bak` (o borrar ese archivo) — está subido a GitHub.
- [ ] Revisar que en Vercel existen `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT`.
  - Ojo: tu `.env.local` (el archivo de claves de tu ordenador) **no tiene** `SUPABASE_SERVICE_ROLE_KEY` ni `VAPID_SUBJECT`, así que en `npm run dev` el envío de notificaciones no puede funcionar. Las claves que sí tiene no están subidas a GitHub (bien).

## Fase 1 — Arreglar lo que está roto
- [ ] **Botón "Instalar App en el Móvil"**: abre una ventana (`showInstallModal`) que **no existe** en el código, por eso no pasa nada. Además faltan los iconos `icon-192x192.png` e `icon-500x500.png` que pide `manifest.json` (solo existe `icon.png`), y sin iconos Android no ofrece instalar.
- [ ] **Cerrar sesión en Ajustes** lleva a `/login`, página que no existe (error 404). Debe ir a `/`.
- [ ] **Borrar cuenta** está hecho de dos formas distintas:
  - En Ajustes → solo muestra "Contacta con soporte técnico".
  - En el panel → borra tus datos pero **la cuenta de acceso sigue existiendo** y no borra la suscripción push.
  - Hay que dejar una sola versión que lo borre todo de verdad (con una ruta de servidor).
- [ ] **"Reportar problema"** solo te devuelve al panel; no envía nada.
- [ ] **Notificaciones en varios dispositivos**: se guarda una sola suscripción por usuario, así que el último móvil/ordenador que las active "pisa" al anterior.
- [ ] Cambiar los `window.confirm` y `alert` que quedan (unos 20, sobre todo en onboarding y ajustes) por modales propios.

## Fase 2 — Ordenar (sin prisa)
- [ ] Decidir si separar `app/dashboard/page.tsx` (92 KB) en piezas, una pestaña cada vez, empezando por la más sencilla.
- [ ] Borrar archivos sobrantes de la plantilla: `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`; reescribir `README.md`.
- [ ] Modo oscuro: el diseño lo menciona, pero el código casi no lo tiene. Decidir si se hace.

## Fase 3 — Ideas nuevas
- [ ] Centro de notificaciones (componentes de 21st.dev).
- [ ] Exportar exámenes y trabajos a `.ics` (para Google Calendar / Calendario de Apple).
- [ ] v2.0: la IA importa horarios y guías de otras universidades (la base ya existe en `/api/parse-syllabus`).

## Dudas abiertas (necesito tu respuesta)
1. ¿Las 8 tablas de Supabase tienen RLS activado? Desde el código no se puede ver.
2. ¿Quién debe poder mandar notificaciones push: solo tú a mano, o la app sola (por ejemplo, avisos de exámenes)? Ahora mismo ninguna pantalla llama a `/api/send-notification`.
3. ¿En qué cuenta de Vercel está UniNotas? El conector de Vercel conectado a Claude no encuentra el proyecto.
4. ¿El repositorio de GitHub es público o privado? (decide lo urgente que es lo del correo en `middleware.ts.bak`, que además ya queda en el historial).
5. ¿Modo oscuro sí o no? ¿Y "borrar cuenta" debe borrarlo todo al momento?

---

## Páginas que existen
| Dirección | Qué hace | Estado |
|---|---|---|
| `/` | Login y registro (email + contraseña, "recordarme") | Funciona |
| `/onboarding` | 5 pasos: universidad → festivos/exámenes (PDF con IA o a mano) → asignaturas (PDF o a mano) → horarios → final | Funciona |
| `/dashboard` | Pestañas General, Diario, Calendario, Asistencia, Notas + tour de bienvenida | Funciona (botón instalar roto) |
| `/dashboard/settings` | Asignaturas y horarios · Pesos (deben sumar 100 %) · Preferencias (push) · Cuenta | Cerrar sesión y borrar cuenta rotos |
| `/legal/aviso-legal`, `/cookies`, `/privacidad`, `/terminos` | Textos legales | Funciona |
| `/maintenance` | Aviso de mantenimiento | Sin usar (bloqueo desactivado) |
| `/api/parse-syllabus` | Envía un PDF a Gemini y devuelve asignaturas o calendario | Sin protección |
| `/api/send-notification` | Manda notificaciones push | Sin protección |

## Cómo se calcula la nota
Por cada criterio con nota: `nota × peso / 100`. Se suman y se escalan a 10 según el porcentaje ya evaluado (ej.: si llevas un 40 % evaluado con un 3,2 acumulado → 3,2 / 0,4 = 8,0).

## Diseño
Estilo Apple: gris `#f4f5f8`, azul `#0071e3`, tarjetas blancas con desenfoque (`backdrop-blur`), esquinas muy redondeadas, sombras suaves, fuente Geist. Solo modo claro de momento.
