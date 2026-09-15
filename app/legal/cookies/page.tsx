export default function CookiesPage() {
  return (
    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">Política de Cookies</h1>
      <p className="text-xs text-gray-400">Conforme al artículo 22.2 de la LSSI-CE</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-gray-900">1. ¿Qué son las cookies?</h2>
        <p>
          Una cookie es un pequeño fichero que se descarga en tu navegador web al acceder a determinadas páginas o aplicaciones web para permitir recordar información de navegación.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-gray-900">2. Cookies utilizadas en UniNotas</h2>
        <p>
          UniNotas utiliza <strong>únicamente cookies técnicas y estrictamente necesarias</strong> para el funcionamiento del servicio.
        </p>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-xs">
          <p><strong>• Cookies de Autenticación (Supabase Auth):</strong> Mantienen la sesión del usuario abierta de forma segura durante la navegación entre páginas.</p>
          <p><strong>• Almacenamiento local (localStorage):</strong> Guarda preferencias puntuales de visualización de interfaz en el dispositivo del usuario.</p>
        </div>
        <p>
          UniNotas <strong>no utiliza cookies de seguimiento publicitario ni cookies de terceros para elaboración de perfiles comerciales</strong>. Al ser de naturaleza estrictamente técnica para posibilitar el acceso a la cuenta, no requieren banner de consentimiento publicitario previo según el criterio de la AEPD.
        </p>
      </section>
    </div>
  );
}