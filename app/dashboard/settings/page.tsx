'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
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
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Subject {
  id: string;
  name: string;
  credits: number;
  is_convalidated?: boolean; 
  criteria?: Array<{ id: string; name: string; weight: number }>; 
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

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'EST101', name: 'Estadística I', credits: 6 },
    { id: 'EPP101', name: 'Estrategies productes i preus', credits: 6 },
    { id: 'PUB101', name: 'Publicitat, promoció i RRPP', credits: 6 },
    { id: 'DPM101', name: 'Desenvol. productes i marques', credits: 6 },
    { id: 'EDL101', name: 'Estratègies distribució i logística', credits: 6 },
    { id: 'XIN201', name: 'Xinès II', credits: 3 },
    { id: 'ANG201', name: 'Anglès II', credits: 3 },
  ]);

  const [scheduleConfig, setScheduleConfig] = useState<Record<string, Record<string, { active: boolean; startTime: string; endTime: string }>>>({
    'EST101': { lunes: { active: true, startTime: '16:00', endTime: '19:00' }, miercoles: { active: true, startTime: '19:00', endTime: '20:30' }, martes: { active: false, startTime: '09:00', endTime: '11:00' }, jueves: { active: false, startTime: '09:00', endTime: '11:00' }, viernes: { active: false, startTime: '09:00', endTime: '11:00' } },
    'EPP101': { martes: { active: true, startTime: '16:00', endTime: '19:00' }, jueves: { active: true, startTime: '16:00', endTime: '19:00' }, lunes: { active: false, startTime: '09:00', endTime: '11:00' }, miercoles: { active: false, startTime: '09:00', endTime: '11:00' }, viernes: { active: false, startTime: '09:00', endTime: '11:00' } },
    'PUB101': { lunes: { active: true, startTime: '09:00', endTime: '11:00' }, miercoles: { active: true, startTime: '09:00', endTime: '11:00' }, martes: { active: false, startTime: '09:00', endTime: '11:00' }, jueves: { active: false, startTime: '09:00', endTime: '11:00' }, viernes: { active: false, startTime: '09:00', endTime: '11:00' } },
    'DPM101': { jueves: { active: true, startTime: '16:00', endTime: '19:00' }, lunes: { active: false, startTime: '09:00', endTime: '11:00' }, martes: { active: false, startTime: '09:00', endTime: '11:00' }, miercoles: { active: false, startTime: '09:00', endTime: '11:00' }, viernes: { active: false, startTime: '09:00', endTime: '11:00' } },
    'EDL101': { viernes: { active: true, startTime: '16:00', endTime: '19:00' }, lunes: { active: false, startTime: '09:00', endTime: '11:00' }, martes: { active: false, startTime: '09:00', endTime: '11:00' }, miercoles: { active: false, startTime: '09:00', endTime: '11:00' }, jueves: { active: false, startTime: '09:00', endTime: '11:00' } },
    'XIN201': { miercoles: { active: true, startTime: '19:00', endTime: '20:30' }, lunes: { active: false, startTime: '09:00', endTime: '11:00' }, martes: { active: false, startTime: '09:00', endTime: '11:00' }, jueves: { active: false, startTime: '09:00', endTime: '11:00' }, viernes: { active: false, startTime: '09:00', endTime: '11:00' } },
    'ANG201': { martes: { active: true, startTime: '19:00', endTime: '20:30' }, lunes: { active: false, startTime: '09:00', endTime: '11:00' }, miercoles: { active: false, startTime: '09:00', endTime: '11:00' }, jueves: { active: false, startTime: '09:00', endTime: '11:00' }, viernes: { active: false, startTime: '09:00', endTime: '11:00' } },
  });

  const [userChineseGroup, setUserChineseGroup] = useState('A');
  const [userEnglishGroup, setUserEnglishGroup] = useState('A');

  // Cargar los datos reales de Supabase al abrir la página de ajustes
  useEffect(() => {
    const fetchUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userSubjectsData, error: userError } = await supabase
        .from('user_subjects')
        .select('subject_id, credits, custom_name, schedule, weights')
        .eq('user_id', user.id);

      if (!userError && userSubjectsData && userSubjectsData.length > 0) {
        const loadedSchedules: any = {};
        
        setSubjects((prevSubjects) =>
          prevSubjects.map((sub) => {
            const found = userSubjectsData.find((item: any) => item.subject_id === sub.id);
            if (found) {
              // Cargamos el horario de esta asignatura si existe en Supabase
              if (found.schedule) {
                loadedSchedules[sub.id] = found.schedule;
              }
              return {
                ...sub,
                credits: found.credits ?? sub.credits,
                name: found.custom_name ?? sub.name,
                criteria: found.weights ?? sub.criteria,
              };
            }
            return sub;
          })
        );

        // Actualizamos el estado de los horarios con lo que viene de la base de datos
        if (Object.keys(loadedSchedules).length > 0) {
          setScheduleConfig(loadedSchedules);
        }
      }

      const metadata = user.user_metadata;
      if (metadata) {
        if (metadata.chinese_group) setUserChineseGroup(metadata.chinese_group);
        if (metadata.english_group) setUserEnglishGroup(metadata.english_group);
      }
    } catch (err) {
      console.error('Error cargando la configuración de Supabase:', err);
    }
  };

    fetchUserSettings();
  }, []);

  const handleCreditChange = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, credits: num } : s));
  };

  const handleNameChange = (id: string, val: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name: val } : s));
  };

  const handleToggleConvalidated = (id: string, val: boolean) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, is_convalidated: val } : s));
  };

  const toggleDayActive = (subjectId: string, dayId: string) => {
    setScheduleConfig(prev => {
      const subDays = prev[subjectId] || {};
      const currentDay = subDays[dayId] || { active: false, startTime: '16:00', endTime: '19:00' };
      return {
        ...prev,
        [subjectId]: {
          ...subDays,
          [dayId]: { ...currentDay, active: !currentDay.active }
        }
      };
    });
  };

  const handleTimeChange = (subjectId: string, dayId: string, field: 'startTime' | 'endTime', value: string) => {
    setScheduleConfig(prev => {
      const subDays = prev[subjectId] || {};
      const currentDay = subDays[dayId] || { active: true, startTime: '16:00', endTime: '19:00' };
      return {
        ...prev,
        [subjectId]: {
          ...subDays,
          [dayId]: { ...currentDay, [field]: value }
        }
      };
    });
  };

const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      // 1. Validar que los pesos sumen 100% en todas las asignaturas
      for (const sub of subjects) {
        const criteriaList = sub.criteria || [
          { name: 'Examen / Prueba Final', weight: 50 },
          { name: 'Trabajos y Entregas', weight: 50 }
        ];
        const totalWeight = criteriaList.reduce((acc: number, curr: any) => acc + (Number(curr.weight) || 0), 0);

        if (totalWeight !== 100) {
          alert(`⚠️ Error en "${sub.name}": Los apartados suman ${totalWeight}%. Deben sumar exactamente un 100% para continuar.`);
          setLoading(false);
          setActiveTab('weights');
          return;
        }
      }

      // 2. Validación de créditos vacíos o a 0
      const invalidSubject = subjects.find(s => !s.credits || Number(s.credits) <= 0);
      if (invalidSubject) {
        const confirmSave = window.confirm(`⚠️ La asignatura "${invalidSubject.name}" tiene 0 créditos ECTS. ¿Deseas guardar de todos modos?`);
        if (!confirmSave) {
          setLoading(false);
          return;
        }
      }

      // 3. Guardar grupos de idiomas en los metadatos del usuario
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          chinese_group: userChineseGroup,
          english_group: userEnglishGroup,
        }
      });

      if (metaError) throw metaError;

      // 4. Guardar asignaturas, créditos, nombres, horarios, pesos y convalidaciones en Supabase
      for (const sub of subjects) {
        const subSchedule = scheduleConfig[sub.id] || {};
        const subCriteria = sub.criteria || [
          { name: 'Examen / Prueba Final', weight: 50 },
          { name: 'Trabajos y Entregas', weight: 50 }
        ];

        // Comprobamos si ya existe el registro para este usuario y asignatura
        const { data: existing } = await supabase
          .from('user_subjects')
          .select('id')
          .eq('user_id', user.id)
          .eq('subject_id', sub.id)
          .maybeSingle();

        let subError = null;

        if (existing) {
          // Si ya existe, hacemos un UPDATE limpio
          const { error } = await supabase
            .from('user_subjects')
            .update({
              credits: Number(sub.credits) || 0,
              custom_name: sub.name,
              schedule: subSchedule,
              weights: subCriteria,
              is_convalidated: sub.is_convalidated || false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('subject_id', sub.id);
          subError = error;
        } else {
          // Si no existe, hacemos un INSERT
          const { error } = await supabase
            .from('user_subjects')
            .insert({
              user_id: user.id,
              subject_id: sub.id,
              credits: Number(sub.credits) || 0,
              custom_name: sub.name,
              schedule: subSchedule,
              weights: subCriteria,
              is_convalidated: sub.is_convalidated || false,
              updated_at: new Date().toISOString(),
            });
          subError = error;
        }
        
        if (subError) {
          console.error(`Error guardando la asignatura ${sub.id}:`, subError);
        }
      }

      setLoading(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);

    } catch (err) {
      console.error('Error al guardar en Supabase:', err);
      setLoading(false);
      alert('Hubo un error al guardar los cambios en la base de datos.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta permanentemente?')) {
      alert('Contacta con soporte técnico.');
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'academic': return 'Asignaturas y Horarios';
      case 'weights': return 'Pesos y Evaluación';
      case 'languages': return 'Idiomas y Grupos';
      case 'preferences': return 'Preferencias';
      case 'account': return 'Cuenta y Soporte';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-900 font-sans antialiased flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Cabecera general adaptada a ancho completo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 shadow-xl w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shadow-xs shrink-0"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">{getPageTitle()}</h1>
              <p className="text-xs text-gray-400 font-medium">Centro de control, configuración del expediente y sincronización</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedMessage && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-2xl text-xs font-bold animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Guardado correctamente!</span>
              </div>
            )}
          </div>
        </div>

        {/* Menú de pestañas superior horizontal (debajo del título) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
          <button
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'academic' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Asignaturas y Horarios</span>
          </button>

          <button
            onClick={() => setActiveTab('weights')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'weights' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
          >
            <Award className="w-4 h-4" />
            <span>Pesos y Evaluación</span>
          </button>

          <button
            onClick={() => setActiveTab('languages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'languages' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
          >
            <Globe className="w-4 h-4" />
            <span>Idiomas y Grupos</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'preferences' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
          >
            <Sliders className="w-4 h-4" />
            <span>Preferencias</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'account' ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white border border-gray-200/80 text-gray-600 hover:bg-gray-50'}`}
          >
            <User className="w-4 h-4" />
            <span>Cuenta y Soporte</span>
          </button>
        </div>

        {/* Contenedor principal de contenido a ancho completo */}
        <div className="w-full">
          <form onSubmit={handleSaveAll} className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 w-full">
            
            {activeTab === 'academic' && (
                <div className="space-y-6">
                    <div>
                    <h2 className="text-lg font-black text-gray-900">Gestión de Asignaturas, Créditos ECTS y Horarios</h2>
                    <p className="text-xs text-gray-400 font-medium">Configura los créditos (esenciales para el cálculo ponderado de notas) y los días lectivos con sus respectivas horas.</p>
                    </div>

                    <div className="space-y-4">
                    {subjects.map((sub) => {
                        const hasNoCredits = !sub.credits || sub.credits <= 0;
                        return (
                        <div key={sub.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-4 w-full">
                            
                            {hasNoCredits && (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-xl text-[11px] font-bold">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>¡Aviso! Esta asignatura no tiene créditos ECTS asignados.</span>
                            </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nombre de la Asignatura ({sub.id})</label>
                                <input 
                                type="text" 
                                value={sub.name}
                                onChange={(e) => handleNameChange(sub.id, e.target.value)}
                                className="w-full text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#0071e3]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Créditos ECTS</label>
                                <input 
                                type="number" 
                                step="0.5"
                                min="0"
                                value={sub.credits}
                                onChange={(e) => handleCreditChange(sub.id, e.target.value)}
                                className={`w-full text-xs font-bold text-gray-900 bg-white border rounded-xl px-3 py-2.5 outline-none ${hasNoCredits ? 'border-amber-400 bg-amber-50/30' : 'border-gray-200 focus:border-[#0071e3]'}`}
                                />
                            </div>
                            </div>
                            
                            {/* Checkbox para marcar como convalidada */}
                            <div className="flex items-center gap-2 pt-1">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors w-fit shadow-2xs">
                                <input
                                    type="checkbox"
                                    checked={sub.is_convalidated || false}
                                    onChange={(e) => handleToggleConvalidated(sub.id, e.target.checked)}
                                    className="w-4 h-4 text-[#0071e3] rounded-md border-gray-300 focus:ring-[#0071e3] cursor-pointer"
                                />
                                <span>Asignatura convalidada (Sin clases ni exámenes)</span>
                                </label>
                            </div>

                            {/* Si está convalidada, ocultamos el horario y mostramos el aviso. Si no, mostramos el horario interactivo normal */}
                            {sub.is_convalidated ? (
                                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center justify-between">
                                <span>✨ Esta asignatura está convalidada. No requiere horario ni asistencias.</span>
                                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] uppercase font-black">Convalidada</span>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-2">
                                <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Horario y días lectivos</span>
                                {/* A AQUÍ VA TU BLOQUE DE HORARIOS QUE YA TENÍAS */}
                                </div>
                            )}

                            {/* Horarios interactivos específicos por día */}
                            <div className="space-y-3 pt-3 border-t border-gray-200/60">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#0071e3]" />
                                <span>Horario y Días Lectivos Interactivos</span>
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                                {DAYS_OF_WEEK.map((day) => {
                                const dayState = scheduleConfig[sub.id]?.[day.id] || { active: false, startTime: '16:00', endTime: '19:00' };
                                return (
                                    <div 
                                    key={day.id} 
                                    className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                                        dayState.active 
                                        ? 'bg-blue-50/50 border-[#0071e3] shadow-2xs' 
                                        : 'bg-white border-gray-200/80 opacity-80'
                                    }`}
                                    >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-gray-800">{day.label}</span>
                                        <button
                                        type="button"
                                        onClick={() => toggleDayActive(sub.id, day.id)}
                                        className={`text-[10px] uppercase px-2.5 py-1 rounded-full font-extrabold cursor-pointer transition-colors ${
                                            dayState.active ? 'bg-[#0071e3] text-white shadow-xs' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                        >
                                        {dayState.active ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </div>

                                    {dayState.active && (
                                        <div className="space-y-2 pt-2 border-t border-blue-100 animate-fade-in">
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] text-gray-400 font-bold">Inicio:</span>
                                            <input 
                                            type="time" 
                                            value={dayState.startTime}
                                            onChange={(e) => handleTimeChange(sub.id, day.id, 'startTime', e.target.value)}
                                            className="text-[11px] font-bold bg-white border border-gray-200 rounded-xl p-1.5 text-gray-800 outline-none w-full text-center focus:border-[#0071e3]"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] text-gray-400 font-bold">Fin:</span>
                                            <input 
                                            type="time" 
                                            value={dayState.endTime}
                                            onChange={(e) => handleTimeChange(sub.id, day.id, 'endTime', e.target.value)}
                                            className="text-[11px] font-bold bg-white border border-gray-200 rounded-xl p-1.5 text-gray-800 outline-none w-full text-center focus:border-[#0071e3]"
                                            />
                                        </div>
                                        </div>
                                    )}
                                    </div>
                                );
                                })}
                            </div>
                            </div>

                        </div>
                        );
                    })}
                    </div>
                </div>
                )}

            {activeTab === 'weights' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Pesos y Evaluación de Asignaturas</h2>
                  <p className="text-xs text-gray-400 font-medium">Configura los apartados, personaliza sus nombres, ajusta sus porcentajes y añade nuevos criterios. Todo se sincronizará automáticamente con tu página de notas.</p>
                </div>

                <div className="space-y-6">
                  {subjects.map((sub) => {
                    // Estado local o simulado para los apartados de cada asignatura
                    // (Esto se conectará directamente a los arrays de Supabase de cada subject)
                    const criteriaList = (sub as any).criteria || [
                      { id: 'ex', name: 'Examen', weight: 60 },
                      { id: 'trab', name: 'Trabajos', weight: 40 }
                    ];

                    // Calcular la suma total de los porcentajes de esta asignatura
                    const totalWeight = criteriaList.reduce((acc: number, curr: any) => acc + (Number(curr.weight) || 0), 0);
                    const isValid100 = totalWeight === 100;

                    return (
                      <div key={sub.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-4 w-full">
                        
                        {/* Cabecera de la asignatura y aviso del 100% */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-200/60">
                          <div>
                            <span className="text-xs font-black text-gray-900 uppercase tracking-wider">{sub.name}</span>
                            <span className="text-[10px] text-gray-400 ml-2 font-medium">({sub.id})</span>
                          </div>

                          {/* Aviso visual del 100% */}
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold ${
                            isValid100 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            <span>Total: {totalWeight}% {isValid100 ? '✓ (Correcto)' : '⚠️ (Debe sumar 100%)'}</span>
                          </div>
                        </div>

                        {/* Listado de apartados editables */}
                        <div className="space-y-3">
                          {criteriaList.map((crit: any, index: number) => (
                            <div key={crit.id || index} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
                              
                              {/* Nombre del apartado */}
                              <div className="flex-1">
                                <input 
                                  type="text"
                                  value={crit.name}
                                  onChange={(e) => {
                                    // Lógica para actualizar el nombre del apartado al vuelo
                                    const updated = [...criteriaList];
                                    updated[index].name = e.target.value;
                                    setSubjects(prev => prev.map(s => s.id === sub.id ? { ...s, criteria: updated } as any : s));
                                  }}
                                  placeholder="Nombre del apartado (ej. Parcial 1)"
                                  className="w-full text-xs font-bold text-gray-800 bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0071e3]"
                                />
                              </div>

                              {/* Porcentaje editable */}
                              <div className="w-28 flex items-center gap-1">
                                <input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={crit.weight}
                                  onChange={(e) => {
                                    // Lógica para actualizar el peso al vuelo
                                    const val = parseFloat(e.target.value) || 0;
                                    const updated = [...criteriaList];
                                    updated[index].weight = val;
                                    setSubjects(prev => prev.map(s => s.id === sub.id ? { ...s, criteria: updated } as any : s));
                                  }}
                                  className="w-full text-xs font-bold text-gray-900 bg-gray-50/50 border border-gray-200 rounded-lg px-2 py-2 text-center outline-none focus:border-[#0071e3]"
                                />
                                <span className="text-xs font-bold text-gray-400">%</span>
                              </div>

                              {/* Botón de eliminar apartado con confirmación */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`¿Estás seguro de que deseas eliminar el apartado "${crit.name}"?`)) {
                                    const updated = criteriaList.filter((_: any, i: number) => i !== index);
                                    setSubjects(prev => prev.map(s => s.id === sub.id ? { ...s, criteria: updated } as any : s));
                                  }
                                }}
                                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer shrink-0"
                                title="Eliminar apartado"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Botón para añadir un nuevo apartado en esta asignatura */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const newCrit = { id: `crit_${Date.now()}`, name: 'Nuevo apartado', weight: 0 };
                              const updated = [...criteriaList, newCrit];
                              setSubjects(prev => prev.map(s => s.id === sub.id ? { ...s, criteria: updated } as any : s));
                            }}
                            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-300 hover:border-[#0071e3] bg-white hover:bg-blue-50/30 text-xs font-bold text-gray-600 hover:text-[#0071e3] transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>+ Añadir nuevo apartado a {sub.name}</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'languages' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Idiomas y Grupos</h2>
                  <p className="text-xs text-gray-400 font-medium">Selecciona tus grupos asignados (A, B, C o D).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-3">
                    <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Grupo de Xinès II</span>
                    <div className="grid grid-cols-2 gap-2">
                      {GROUPS_INFO.map((g) => (
                        <button
                          key={`ch_${g.id}`}
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
                          key={`en_${g.id}`}
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

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Preferencias de la Aplicación</h2>
                  <p className="text-xs text-gray-400 font-medium">Personaliza el aspecto visual.</p>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Cuenta y Soporte</h2>
                  <p className="text-xs text-gray-400 font-medium">Gestiona tu sesión o elimina tu cuenta.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <MessageSquareWarning className="w-5 h-5 text-[#0071e3] shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">¿Has encontrado un error o tienes una sugerencia?</p>
                        <p className="text-[11px] text-gray-500">Envíanos un reporte directo.</p>
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

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-gray-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Cerrar sesión actual</p>
                        <p className="text-[11px] text-gray-500">Finalizarás tu sesión de forma segura.</p>
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

                  <div className="pt-4 border-t border-gray-200/80">
                    <div className="p-5 rounded-2xl bg-red-50/80 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-red-900">Zona de peligro: Eliminar cuenta</p>
                          <p className="text-[11px] text-red-600">Esta acción borrará todo tu expediente y notas permanentemente.</p>
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

            {/* Botón Guardar Inferior */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[11px] text-gray-400 font-medium">
                {loading ? 'Guardando...' : 'Cambios listos para sincronizar'}
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

      {/* Footer fijado correctamente abajo del todo */}
      <footer className="w-full max-w-7xl mx-auto pt-8 pb-4 text-center text-xs text-gray-400 border-t border-gray-200/60 mt-12">
        <p>UniNotas • EUM • Gestión Académica</p>
      </footer>
    </div>
  );
}