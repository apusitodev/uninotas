'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  BookOpen, 
  Globe, 
  User, 
  ArrowLeft, 
  ShieldAlert, 
  Save, 
  CheckCircle2,
  Calendar,
  Award,
  Sliders,
  LogOut,
  Trash2,
  AlertTriangle,
  MessageSquareWarning,
  Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Subject {
  id: string;
  name: string;
  credits: number;
}

const GROUPS_INFO = [
  { id: 'A', label: 'Grupo A', room: 'Aula A41' },
  { id: 'B', label: 'Grupo B', room: 'Aula A42' },
  { id: 'C', label: 'Grupo C', room: 'Aula A43' },
  { id: 'D', label: 'Grupo D', room: 'Aula A44' },
];

const DAYS_OF_WEEK = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'academic' | 'weights' | 'languages' | 'preferences' | 'account'>('academic');
  const [savedMessage, setSavedMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userChineseGroup, setUserChineseGroup] = useState('A');
  const [userEnglishGroup, setUserEnglishGroup] = useState('A');

  // Estado para controlar qué días tiene clase cada asignatura
  const [classDays, setClassDays] = useState<Record<string, Record<string, boolean>>>({
    'EST101': { lunes: true, miercoles: true, martes: false, jueves: false, viernes: false },
    'EPP101': { lunes: false, martes: true, miercoles: false, jueves: true, viernes: false },
    'PUB101': { lunes: true, martes: true, miercoles: true, jueves: true, viernes: true },
    'DPM101': { lunes: false, martes: false, miercoles: true, jueves: true, viernes: false },
    'EDL101': { lunes: true, martes: false, miercoles: false, jueves: false, viernes: true },
    'XIN201': { lunes: false, martes: true, miercoles: true, jueves: false, viernes: false },
    'ANG201': { lunes: true, martes: false, miercoles: false, jueves: true, viernes: false },
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: subsData } = await supabase.from('subjects').select('*');
      if (subsData && subsData.length > 0) {
        setSubjects(subsData);
      } else {
        // Datos por defecto si Supabase está vacío de momento
        setSubjects([
          { id: 'EST101', name: 'Estadística I', credits: 6 },
          { id: 'EPP101', name: 'Estrategies productes i preus', credits: 6 },
          { id: 'PUB101', name: 'Publicitat, promoció i RRPP', credits: 6 },
          { id: 'DPM101', name: 'Desenvol. productes i marques', credits: 6 },
          { id: 'EDL101', name: 'Estratègies distribució i logística', credits: 6 },
          { id: 'XIN201', name: 'Xinès II', credits: 3 },
          { id: 'ANG201', name: 'Anglès II', credits: 3 },
        ]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const toggleDay = (subjectId: string, dayId: string) => {
    setClassDays(prev => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || {}),
        [dayId]: !(prev[subjectId]?.[dayId])
      }
    }));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }, 600);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('¿Estás totalmente seguro de que quieres eliminar tu cuenta y todos tus datos permanentemente?');
    if (!confirmDelete) return;
    alert('Por seguridad, contacta con soporte para la eliminación definitiva.');
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-900 font-sans antialiased p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabecera idéntica a las páginas principales (con título a la izquierda y notificaciones a la derecha) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 shadow-xl w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shadow-xs"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">Configuración del Expediente</h1>
              <p className="text-xs text-gray-400 font-medium">Centro de control, asignaturas, horarios interactivos y personalización</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedMessage && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-2xl text-xs font-bold animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Guardado!</span>
              </div>
            )}
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 relative shadow-xs">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>
        </div>

        {/* Contenido Principal con Pestañas y Formularios */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Menú Lateral de Configuración */}
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('academic')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'academic' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Asignaturas y Horarios</span>
            </button>

            <button
              onClick={() => setActiveTab('weights')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'weights' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
            >
              <Award className="w-4 h-4" />
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

          {/* Panel Dinámico */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSaveAll} className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 w-full">
              
              {/* ASIGNATURAS Y HORARIOS */}
              {activeTab === 'academic' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Gestión de Asignaturas y Horarios</h2>
                    <p className="text-xs text-gray-400 font-medium">Modifica los nombres oficiales, créditos ECTS y activa los días de clase reales.</p>
                  </div>

                  <div className="space-y-4">
                    {subjects.map((sub) => (
                      <div key={sub.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="w-full sm:w-2/3 space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nombre de la Asignatura ({sub.id})</label>
                            <input 
                              type="text" 
                              defaultValue={sub.name}
                              className="w-full text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#0071e3]"
                            />
                          </div>
                          <div className="w-full sm:w-1/4 space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Créditos ECTS</label>
                            <input 
                              type="number" 
                              defaultValue={sub.credits}
                              className="w-full text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#0071e3]"
                            />
                          </div>
                        </div>

                        {/* Selector interactivo de días de clase (Activar/Desactivar por día) */}
                        <div className="space-y-2 pt-2 border-t border-gray-200/60">
                          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#0071e3]" />
                            <span>Días lectivos (Haz clic para activar o desactivar el día de clase)</span>
                          </label>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {DAYS_OF_WEEK.map((day) => {
                              const isActive = classDays[sub.id]?.[day.id] ?? false;
                              return (
                                <button
                                  key={day.id}
                                  type="button"
                                  onClick={() => toggleDay(sub.id, day.id)}
                                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                    isActive 
                                      ? 'bg-blue-50 border-[#0071e3] text-[#0071e3] font-bold shadow-xs' 
                                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                                  }`}
                                >
                                  <span className="text-xs">{day.label}</span>
                                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#0071e3] text-white font-extrabold' : 'bg-gray-100 text-gray-500'}`}>
                                    {isActive ? 'Sí tiene' : 'No tiene'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESOS Y EVALUACIÓN */}
              {activeTab === 'weights' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Pesos de Evaluación</h2>
                    <p className="text-xs text-gray-400 font-medium">Configura los porcentajes de exámenes y trabajos de cada materia.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span>El sistema verifica automáticamente que la suma de los apartados sea exactamente el 100%.</span>
                  </div>
                </div>
              )}

              {/* IDIOMAS Y GRUPOS (Con Grupos A, B, C, D) */}
              {activeTab === 'languages' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Idiomas y Grupos</h2>
                    <p className="text-xs text-gray-400 font-medium">Selecciona tus grupos asignados para Inglés II y Chino II.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-3">
                      <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Grupo de Xinès II</span>
                      <div className="grid grid-cols-2 gap-2">
                        {GROUPS_INFO.map((g) => (
                          <button
                            key={`set_ch_${g.id}`}
                            type="button"
                            onClick={() => setUserChineseGroup(g.id)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              userChineseGroup === g.id ? 'border-[#0071e3] bg-[#0071e3] text-white font-bold shadow-xs' : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            <p className="text-xs font-black">{g.label}</p>
                            <p className={`text-[10px] mt-0.5 ${userChineseGroup === g.id ? 'text-white/80' : 'text-gray-400'}`}>{g.room}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-3">
                      <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Grupo de Anglès II</span>
                      <div className="grid grid-cols-2 gap-2">
                        {GROUPS_INFO.map((g) => (
                          <button
                            key={`set_en_${g.id}`}
                            type="button"
                            onClick={() => setUserEnglishGroup(g.id)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              userEnglishGroup === g.id ? 'border-[#0071e3] bg-[#0071e3] text-white font-bold shadow-xs' : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            <p className="text-xs font-black">{g.label}</p>
                            <p className={`text-[10px] mt-0.5 ${userEnglishGroup === g.id ? 'text-white/80' : 'text-gray-400'}`}>{g.room}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PREFERENCIAS */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Preferencias de la Aplicación</h2>
                    <p className="text-xs text-gray-400 font-medium">Personaliza el aspecto visual y las notificaciones.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Modo Oscuro Automático</p>
                      <p className="text-[11px] text-gray-400">Adaptar los contrastes de la interfaz.</p>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-50 text-[#0071e3] px-3 py-1 rounded-full border border-blue-100">Próximamente</span>
                  </div>
                </div>
              )}

              {/* CUENTA Y SOPORTE (Con Cerrar Sesión y Zona de Peligro Separada) */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Cuenta y Soporte</h2>
                    <p className="text-xs text-gray-400 font-medium">Gestiona tu sesión activa, reporta errores o elimina tu cuenta.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Botón de Reportar Problema */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquareWarning className="w-5 h-5 text-[#0071e3]" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">¿Has encontrado un error o tienes una sugerencia?</p>
                          <p className="text-[11px] text-gray-500">Envíanos un reporte directo para revisarlo al momento.</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-bold hover:bg-[#0077ed] cursor-pointer"
                      >
                        Reportar problema
                      </button>
                    </div>

                    {/* Botón de Cerrar Sesión */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">Cerrar sesión actual</p>
                          <p className="text-[11px] text-gray-500">Finalizarás tu sesión en este dispositivo de forma segura.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>

                    {/* ZONA DE PELIGRO: Eliminar cuenta en grid independiente y separado */}
                    <div className="pt-4 border-t border-gray-200/80">
                      <div className="p-5 rounded-2xl bg-red-50/80 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-red-900">Zona de peligro: Eliminar cuenta permanentemente</p>
                            <p className="text-[11px] text-red-600">Esta acción borrará todo tu expediente, notas y asistencias sin opción de recuperación.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar cuenta</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón Inferior de Guardar */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[11px] text-gray-400 font-medium">
                  {loading ? 'Guardando cambios...' : 'Cambios listos para sincronizar'}
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Guardando...' : 'Guardar cambios'}</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}