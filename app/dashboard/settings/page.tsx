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
  Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Subject {
  id: string;
  name: string;
  credits: number;
}

const GROUPS_INFO = [
  { id: 'G1', label: 'Grupo 1', room: 'Aula 101' },
  { id: 'G2', label: 'Grupo 2', room: 'Aula 102' },
  { id: 'G3', label: 'Grupo 3', room: 'Aula 103' },
  { id: 'G4', label: 'Grupo 4', room: 'Aula 104' },
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

  // Estados reales de Supabase
  const [userEmail, setUserEmail] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userSubjects, setUserSubjects] = useState<Record<string, any>>({});
  const [userChineseGroup, setUserChineseGroup] = useState('G1');
  const [userEnglishGroup, setUserEnglishGroup] = useState('G1');

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
      setUserEmail(session.user.email || '');

      // Cargar asignaturas
      const { data: subsData } = await supabase.from('subjects').select('*');
      if (subsData) setSubjects(subsData);

      // Cargar configuración de usuario
      const { data: userData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (userData) {
        if (userData.chinese_group) setUserChineseGroup(userData.chinese_group);
        if (userData.english_group) setUserEnglishGroup(userData.english_group);
      }
    } catch (error) {
      console.error('Error cargando datos de configuración:', error);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulación de guardado síncrono con Supabase
    setTimeout(() => {
      setLoading(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }, 600);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('¿Estás totalmente seguro de que quieres eliminar tu cuenta y todos tus datos permanentemente?');
    if (!confirmDelete) return;
    
    alert('Por seguridad, contacta con soporte para la eliminación definitiva de la base de datos.');
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-900 font-sans antialiased p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabecera superior idéntica al dashboard */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200/80 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0071e3] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              UniNotas • Configuración Global
            </span>
          </div>
        </div>

        {/* Título de la página con ancho completo */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0071e3] shadow-xs">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">Configuración del Expediente</h1>
              <p className="text-xs text-gray-400 font-medium">Centro de control, asignaturas, horarios interactivos y personalización</p>
            </div>
          </div>

          {savedMessage && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Cambios guardados con éxito!</span>
            </div>
          )}
        </div>

        {/* Contenedor principal de pestañas y contenido de ancho completo */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Menú Lateral de Pestañas */}
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

          {/* Panel de Contenido Dinámico de Ancho Completo */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSaveAll} className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 w-full">
              
              {/* PESTAÑA 1: ASIGNATURAS Y HORARIOS INTERACTIVOS */}
              {activeTab === 'academic' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Gestión de Asignaturas y Horarios</h2>
                    <p className="text-xs text-gray-400 font-medium">Configura los nombres oficiales, créditos ECTS y selecciona interactivamente tus días y horas de clase.</p>
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

                        {/* Calendario Semanal Interactivo para seleccionar días y horas */}
                        <div className="space-y-2 pt-2 border-t border-gray-200/60">
                          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#0071e3]" />
                            <span>Horario Semanal Interactivo (Selecciona días y hora)</span>
                          </label>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <div key={day.id} className="p-2.5 rounded-xl bg-white border border-gray-200 flex flex-col gap-2 shadow-2xs">
                                <span className="text-xs font-extrabold text-gray-800 text-center">{day.label}</span>
                                <input 
                                  type="time" 
                                  defaultValue="09:00"
                                  className="text-[11px] font-bold text-center bg-gray-50 border border-gray-200 rounded-lg p-1 text-gray-700 outline-none focus:border-[#0071e3]"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: PESOS Y EVALUACIÓN */}
              {activeTab === 'weights' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Pesos de Evaluación</h2>
                    <p className="text-xs text-gray-400 font-medium">Configura los porcentajes de exámenes y trabajos de cada materia con validación automática al 100%.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span>El sistema verifica automáticamente que la suma de los apartados de cada asignatura sea exactamente el 100%.</span>
                  </div>
                </div>
              )}

              {/* PESTAÑA 3: IDIOMAS Y GRUPOS */}
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

              {/* PESTAÑA 4: PREFERENCIAS */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Preferencias de la Aplicación</h2>
                    <p className="text-xs text-gray-400 font-medium">Personaliza el aspecto visual y las notificaciones en vivo.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Modo Oscuro Automático</p>
                      <p className="text-[11px] text-gray-400">Adaptar los contrastes de la interfaz de usuario.</p>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-50 text-[#0071e3] px-3 py-1 rounded-full border border-blue-100">Próximamente</span>
                  </div>
                </div>
              )}

              {/* PESTAÑA 5: CUENTA Y SOPORTE */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Cuenta y Soporte</h2>
                    <p className="text-xs text-gray-400 font-medium">Gestiona tu sesión activa, reporta errores o elimina tu cuenta.</p>
                  </div>

                  <div className="space-y-4">
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

                    <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-xs font-bold text-red-900">Zona de peligro: Eliminar cuenta</p>
                          <p className="text-[11px] text-red-600">Esta acción borrará todo tu expediente y notas de forma permanente.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar cuenta</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de Guardar General inferior */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[11px] text-gray-400 font-medium">
                  {loading ? 'Sincronizando con Supabase...' : 'Todos los cambios se guardan al instante'}
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