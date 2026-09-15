export default function PrivacidadPage() {
  return (
    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">Política de Privacidad</h1>
      <p className="text-xs text-gray-400">En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la LOPDGDD 3/2018</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-gray-900">1. Responsable del Tratamiento</h2>
        <p>
          El responsable del tratamiento de los datos recabados en UniNotas es el equipo de administración de la plataforma. Para cualquier ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación u Oposición) o consulta sobre tus datos, puedes gestionarlo directamente desde tu panel o solicitando la eliminación de cuenta.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-gray-900">2. Finalidad del Tratamiento de Datos</h2>
        <p>Los datos recabados se destinan exclusivamente a:</p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
          <li>Gestión de acceso e inicio de sesión de usuario (correo electrónico autenticado).</li>
          <li>Almacenamiento de faltas de asistencia, notas ponderadas y entregas creadas por el usuario.</li>
          <li>Asignación de aula en función del grupo de idiomas (Chino e Inglés) seleccionado por el estudiante.</li>
        </ul>
        <p>UniNotas <strong>no comercializa ni cede</strong> datos a terceros con fines publicitarios o lucrativos.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-gray-900">3. Infraestructura y Alojamiento</h2>
        <p>
          Los datos se almacenan de manera cifrada a través de <strong>Supabase</strong> (PostgreSQL bajo protocolos TLS y políticas estrictas de aislamiento Row-Level Security, donde cada estudiante únicamente tiene acceso y control sobre sus propios registros).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-gray-900">4. Derechos del Usuario</h2>
        <p>
          Tienes derecho a acceder a todos tus datos, solicitar la rectificación de cualquier error o la supresión completa de tu usuario y registros de la base de datos en cualquier momento.
        </p>
      </section>
    </div>
  );
}