'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  BookOpen, 
  BookMarked,
  Globe, 
  Sliders,
  User, 
  ArrowLeft, 
  ShieldAlert, 
  Save, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'subjects' | 'academic' | 'languages' | 'preferences' | 'account'>('subjects');
  const [savedMessage, setSavedMessage] = useState(false);

  // Estado de ejemplo para las asignaturas (puedes conectarlo con tu base de datos)
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Matemáticas Aplicadas', credits: 6, schedule: 'Lunes y Miércoles 09:00' },
    { id: 2, name: 'Sistemas de Información', credits: 6, schedule: 'Martes y Jueves 11:00' },
    { id: 3, name: 'Fundamentos de Marketing', credits: 4.5, schedule: 'Viernes 08:30' }
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-900 font-sans antialiased p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera con botón para volver */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200/80 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </button>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0071e3] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            UniNotas • Ajustes
          </span>
        </div>

        {/* Título de la página */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0071e3] shadow-xs">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">Configuración</h1>
              <p className="text-xs text-gray-400 font-medium">Centro de control y personalización de tu expediente</p>
            </div>
          </div>

          {savedMessage && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Cambios guardados con éxito!</span>
            </div>
          )}
        </div>

        {/* Estructura Principal: Pestañas + Contenido */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Menú Lateral de Pestañas */}
          <div className="md:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('subjects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'subjects' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
            >
              <BookMarked className="w-4 h-4" />
              <span>Asignaturas y Horarios</span>
            </button>

            <button
              onClick={() => setActiveTab('academic')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'academic' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Pesos y Evaluación</span>
            </button>

            <button
              onClick={() => setActiveTab('languages')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'languages' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
            >
              <Globe className="w-4 h-4" />
              <span>Idiomas y Grupos</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'preferences' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
            >
              <Sliders className="w-4 h-4" />
              <span>Preferencias</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'account' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
            >
              <User className="w-4 h-4" />
              <span>Cuenta y Soporte</span>
            </button>
          </div>

          {/* Panel de Contenido Dinámico */}
          <div className="md:col-span-3">
            <form onSubmit={handleSave} className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              {/* PESTAÑA 1: GESTIÓN DE ASIGNATURAS */}
              {activeTab === 'subjects' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-black text-gray-900">Gestión de Asignaturas y Horarios</h2>
                    <p className="text-xs text-gray-400 font-medium">Modifica los nombres oficiales, créditos ECTS y horarios de tus clases.</p>
                  </div>

                  <div className="space-y-3">
                    {subjects.map((sub, index) => (
                      <div key={sub.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/60 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="w-full">
                            <label className="text-[10px] font-extrabold uppercase text-gray-400">Nombre de la asignatura</label>
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) => {
                                const updated = [...subjects];
                                updated[index].name = e.target.value;
                                setSubjects(updated);
                              }}
                              className="w-full text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-[#0071e3]"
                            />
                          </div>

                          <div className="w-28 shrink-0">
                            <label className="text-[10px] font-extrabold uppercase text-gray-400">Créditos ECTS</label>
                            <input
                              type="number"
                              step="0.5"
                              value={sub.credits}
                              onChange={(e) => {
                                const updated = [...subjects];
                                updated[index].credits = Number(e.target.value);
                                setSubjects(updated);
                              }}
                              className="w-full text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-[#0071e3]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Horario de clases
                          </label>
                          <input
                            type="text"
                            value={sub.schedule}
                            onChange={(e) => {
                              const updated = [...subjects];
                              updated[index].schedule = e.target.value;
                              setSubjects(updated);
                            }}
                            className="w-full text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:border-[#0071e3]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: PESOS Y EVALUACIÓN */}
              {activeTab === 'academic' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-black text-gray-900">Pesos de Evaluación</h2>
                    <p className="text-xs text-gray-400 font-medium">Configura los porcentajes de exámenes y trabajos de cada materia.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>Control de validación de porcentajes al 100% por asignatura.</span>
                  </div>
                </div>
              )}

              {/* PESTAÑA 3: IDIOMAS Y GRUPOS */}
              {activeTab === 'languages' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-black text-gray-900">Idiomas y Convalidaciones</h2>
                    <p className="text-xs text-gray-400 font-medium">Selecciona tus grupos de clase o asignaturas convalidadas.</p>
                  </div>
                </div>
              )}

              {/* PESTAÑA 4: PREFERENCIAS */}
              {activeTab === 'preferences' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-black text-gray-900">Preferencias de la Aplicación</h2>
                    <p className="text-xs text-gray-400 font-medium">Personaliza el aspecto visual y los avisos.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                    <span>Modo oscuro (Próximamente)</span>
                    <span className="text-[10px] font-bold bg-gray-200 px-2.5 py-1 rounded-lg">Pronto</span>
                  </div>
                </div>
              )}

              {/* PESTAÑA 5: CUENTA Y SOPORTE */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-black text-gray-900">Cuenta y Soporte</h2>
                    <p className="text-xs text-gray-400 font-medium">Gestiona tu sesión o reporta cualquier incidencia.</p>
                  </div>

                  {/* Reportar problema integrado */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                    <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                      ¿Has encontrado un error o tienes una sugerencia?
                    </h4>
                    <p className="text-[11px] text-gray-600">Envíanos un reporte directo para revisarlo al momento.</p>
                    <button type="button" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs">
                      Reportar un problema
                    </button>
                  </div>

                  {/* Cerrar sesión */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Cerrar sesión actual</h4>
                      <p className="text-[11px] text-gray-400">Finalizarás tu sesión en este dispositivo de forma segura.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 font-bold hover:bg-red-50 cursor-pointer text-xs transition-colors shadow-xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Botón Guardar Cambios Global */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar cambios</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}