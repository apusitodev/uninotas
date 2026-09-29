import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/80 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-[#0071e3] mx-auto flex items-center justify-center shadow-xs">
          <Wrench className="w-8 h-8 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Estamos mejorando UniNotas</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Estamos realizando ajustes de última hora para ofreceros la mejor experiencia académica. Volveremos a estar operativos muy pronto.
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#0071e3] px-3 py-1.5 rounded-full border border-blue-100">
            Modo Mantenimiento Activo
          </span>
        </div>
      </div>
    </div>
  );
}