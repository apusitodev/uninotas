export default function AvisoLegalPage() {
  return (
    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">Aviso Legal</h1>
      <p className="text-xs text-gray-400">Última actualización: Septiembre de 2026</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-gray-900">1. Información General y Naturaleza del Servicio</h2>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que <strong>UniNotas</strong> es una plataforma web independiente desarrollada con fines formativos, de autogestión y organización académica estudiantil.
        </p>
        <p>
          <strong>Importante:</strong> UniNotas no es una aplicación oficial de la Escuela Universitaria Mediterrani (EUM) ni de la Universitat de Girona (UdG). Toda la información relativa a horarios, aulas, asignaturas y criterios evaluativos se muestra con carácter meramente informativo y de apoyo personal para el estudiante.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-gray-900">2. Propiedad Intelectual</h2>
        <p>
          El código fuente, la arquitectura, interfaces gráficas y logotipos correspondientes al entorno aplicativo de UniNotas están protegidos por la normativa de propiedad intelectual. Las marcas, acrónimos o denominaciones de asignaturas pertenecientes a instituciones universitarias se mencionan exclusivamente con fines identificativos dentro del ámbito académico del usuario.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-gray-900">3. Exclusión de Responsabilidad</h2>
        <p>
          El titular del servicio no se hace responsable de posibles divergencias entre las ponderaciones introducidas y las actas académicas oficiales finales expedidas por los profesores o la secretaría académica universitaria. La validez legal de las calificaciones corresponde exclusivamente a los canales oficiales universitarios.
        </p>
      </section>
    </div>
  );
}