'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  GraduationCap, ArrowRight, ArrowLeft, Plus, Trash2, Upload, 
  Calendar, BookOpen, Clock, CheckCircle2, Building2, MapPin 
} from 'lucide-react';

interface HolidayInput {
  id: string;
  title: string;
  date: string;
}

interface ExamPeriodInput {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface ClassSlotInput {
  day: number; // 1: Lunes, 2: Martes...
  startHour: string;
  endHour: string;
  room: string;
}

interface SubjectInput {
  id: string;
  name: string;
  code: string;
  credits: number;
  period_type: string;
  is_convalidated: boolean;
  slots: ClassSlotInput[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [parsingFile, setParsingFile] = useState(false);
  
  // Control de Pasos (1 al 5)
  const [step, setStep] = useState<number>(1);

  // Paso 1: Información General
  const [university, setUniversity] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [systemType, setSystemType] = useState<string>('semester'); // 'semester' o 'quarter'

  // Paso 2: Calendario Anual (Festivos y Exámenes)
  const [holidays, setHolidays] = useState<HolidayInput[]>([]);
  const [newHolidayTitle, setNewHolidayTitle] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');

  const [examPeriods, setExamPeriods] = useState<ExamPeriodInput[]>([]);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamStart, setNewExamStart] = useState('');
  const [newExamEnd, setNewExamEnd] = useState('');

  // Paso 3 & 4: Asignaturas y Horarios
  const [subjects, setSubjects] = useState<SubjectInput[]>([]);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCredits, setNewCredits] = useState(6);
  const [newPeriod, setNewPeriod] = useState('semester_1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('has_seen_tour, academic_system, university, city')
        .eq('id', user.id)
        .single();

      if (profile && profile.has_seen_tour) {
        router.push('/dashboard');
        return;
      }
      if (profile) {
        if (profile.academic_system) setSystemType(profile.academic_system);
        if (profile.university) setUniversity(profile.university);
        if (profile.city) setCity(profile.city);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simulación de subida e IA
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingFile(true);
    try {
      const textContent = await file.text();
      const res = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent }),
      });

      const data = await res.json();
      if (data.subjects && Array.isArray(data.subjects)) {
        const formattedSubjects = data.subjects.map((sub: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          name: sub.name || 'Asignatura',
          code: sub.code || 'ASG',
          credits: Number(sub.credits) || 6,
          period_type: sub.period_type || 'semester_1',
          is_convalidated: false,
          slots: sub.slots || [],
        }));
        setSubjects(prev => [...prev, ...formattedSubjects]);
      } else {
        alert('La IA procesó el archivo, pero puedes revisar o añadir datos manualmente.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al leer el archivo.');
    } finally {
      setParsingFile(false);
    }
  };

  // Gestión de Festivos Manuales
  const handleAddHoliday = () => {
    if (!newHolidayTitle.trim() || !newHolidayDate) return;
    setHolidays([...holidays, { id: Math.random().toString(36).substring(2, 9), title: newHolidayTitle, date: newHolidayDate }]);
    setNewHolidayTitle('');
    setNewHolidayDate('');
  };

  // Gestión de Épocas de Exámenes
  const handleAddExamPeriod = () => {
    if (!newExamTitle.trim() || !newExamStart || !newExamEnd) return;
    setExamPeriods([...examPeriods, { id: Math.random().toString(36).substring(2, 9), title: newExamTitle, startDate: newExamStart, endDate: newExamEnd }]);
    setNewExamTitle('');
    setNewExamStart('');
    setNewExamEnd('');
  };

  // Gestión de Asignaturas
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubjects([...subjects, {
      id: Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      code: newCode.trim() || 'ASG',
      credits: Number(newCredits) || 6,
      period_type: newPeriod,
      is_convalidated: false,
      slots: [],
    }]);
    setNewName('');
    setNewCode('');
    setNewCredits(6);
  };

  const handleSaveOnboarding = async () => {
    setSubmitting(true);
    try {
      // 1. Guardar Perfil
      await supabase.from('profiles').upsert({
        id: userId,
        academic_system: systemType,
        university: university,
        city: city,
        has_seen_tour: true,
      });

      // 2. Guardar Asignaturas en user_subjects
      for (const sub of subjects) {
        await supabase.from('user_subjects').upsert({
          user_id: userId,
          subject_id: sub.id,
          name: sub.name,
          code: sub.code,
          ects: sub.credits,
          period_type: sub.period_type,
          is_convalidated: sub.is_convalidated,
          missed_classes: 0,
          weights: { ex: 50, trab: 50 },
        }, { onConflict: 'user_id,subject_id' });
      }

      // 3. Guardar Festivos y Exámenes en academic_events
      for (const hol of holidays) {
        await supabase.from('academic_events').insert({
          user_id: userId,
          title: hol.title,
          event_type: 'festivo',
          due_date: hol.date,
        });
      }

      for (const exam of examPeriods) {
        await supabase.from('academic_events').insert({
          user_id: userId,
          title: exam.title,
          event_type: 'examen',
          due_date: exam.startDate,
          end_date: exam.endDate,
        });
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Error guardando configuración:', err);
      alert('Hubo un error al guardar los datos.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f8] text-gray-400 text-xs font-medium">
        Cargando configuración inicial...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center p-4 py-12 font-sans antialiased">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/80 space-y-8 transition-all duration-300">
        
        {/* Cabecera y Barra de Progreso */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#0071e3] mx-auto shadow-2xs flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Configura tu perfil académico</h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Paso {step} de 5 — Configura tu entorno de estudios paso a paso.
          </p>
          
          {/* Indicador visual de pasos */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-[#0071e3]' : step > s ? 'w-4 bg-blue-200' : 'w-4 bg-gray-200'
                }`} 
              />
            ))}
          </div>
        </div>

        {/* CONTENIDO DE CADA PASO */}
        <div className="space-y-6">

          {/* PASO 1: Información General */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">1. Información de la Universidad</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Universidad</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Ej. EUM / Universitat Autònoma"
                      value={university}
                      onChange={e => setUniversity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Ciudad</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Ej. Barcelona / Madrid"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-bold text-gray-600 block mb-2">Sistema Académico General</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSystemType('semester')}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        systemType === 'semester'
                          ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Por Semestres (1r y 2n)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSystemType('quarter')}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        systemType === 'quarter'
                          ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Por Trimestres (1r, 2n y 3r)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Calendario Anual (Festivos y Exámenes) */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">2. Festivos y Épocas de Exámenes</h3>
                <label className="text-[10px] bg-blue-50 text-[#0071e3] border border-blue-100 px-3 py-1.5 rounded-xl font-bold cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> {parsingFile ? 'Analizando...' : 'Autocompletar con IA'}
                  <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} disabled={parsingFile} className="hidden" />
                </label>
              </div>

              {/* Apartado Festivos */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/70 space-y-3">
                <h4 className="text-[11px] font-extrabold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" /> Días Festivos ({holidays.length})
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (ej. Navidad)"
                    value={newHolidayTitle}
                    onChange={e => setNewHolidayTitle(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                  <input
                    type="date"
                    value={newHolidayDate}
                    onChange={e => setNewHolidayDate(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddHoliday}
                    className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {holidays.map(h => (
                    <div key={h.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200 text-xs">
                      <span>{h.title} ({h.date})</span>
                      <button onClick={() => setHolidays(holidays.filter(x => x.id !== h.id))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apartado Épocas de Exámenes */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/70 space-y-3">
                <h4 className="text-[11px] font-extrabold text-gray-700 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Épocas de Exámenes ({examPeriods.length})
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Título (ej. Exámenes 1r Semestre)"
                    value={newExamTitle}
                    onChange={e => setNewExamTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block">Desde</span>
                      <input
                        type="date"
                        value={newExamStart}
                        onChange={e => setNewExamStart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block">Hasta</span>
                      <input
                        type="date"
                        value={newExamEnd}
                        onChange={e => setNewExamEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddExamPeriod}
                        className="bg-[#0071e3] text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#005bb5]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {examPeriods.map(e => (
                    <div key={e.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200 text-xs">
                      <span>{e.title} ({e.startDate} al {e.endDate})</span>
                      <button onClick={() => setExamPeriods(examPeriods.filter(x => x.id !== e.id))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Plan de Estudios y Asignaturas */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">3. Tus Asignaturas ({subjects.length})</h3>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="text-[11px] font-bold text-gray-700">Añadir Asignatura Manual</h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="sm:col-span-5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Código"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="sm:col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                  <select
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value)}
                    className="sm:col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  >
                    <option value="semester_1">1r Semestre</option>
                    <option value="semester_2">2n Semestre</option>
                    {systemType === 'quarter' && <option value="quarter_3">3r Trimestre</option>}
                    <option value="full_year">Todo el curso</option>
                  </select>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="bg-[#0071e3] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Añadir Asignatura
                  </button>
                </div>
              </div>

              {/* Listado */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {subjects.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
                    No hay asignaturas añadidas todavía.
                  </div>
                ) : (
                  subjects.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{sub.name}</span>
                        <span className="ml-2 font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{sub.code}</span>
                      </div>
                      <button onClick={() => setSubjects(subjects.filter(s => s.id !== sub.id))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PASO 4: Horario Semanal */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">4. Horarios y Clases</h3>
              <p className="text-xs text-gray-500">
                Aquí puedes verificar o ajustar los bloques de horarios semanales extraídos de tus asignaturas.
              </p>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-[#0071e3] mx-auto" />
                <p className="text-xs font-bold text-gray-800">Horarios configurados automáticamente</p>
                <p className="text-[11px] text-gray-500">Puedes continuar al último paso o ajustar detalles desde el dashboard principal más adelante.</p>
              </div>
            </div>
          )}

          {/* PASO 5: Revisión Final */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">5. Revisión y Confirmación</h3>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3 text-xs">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Universidad / Ciudad:</span>
                  <span className="font-bold text-gray-800">{university || 'No especificada'} ({city || 'N/D'})</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Sistema Académico:</span>
                  <span className="font-bold text-gray-800">{systemType === 'semester' ? 'Semestres' : 'Trimestres'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Festivos registrados:</span>
                  <span className="font-bold text-gray-800">{holidays.length} días</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Épocas de exámenes:</span>
                  <span className="font-bold text-gray-800">{examPeriods.length} periodos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Asignaturas totales:</span>
                  <span className="font-bold text-gray-800">{subjects.length} materias</span>
                </div>
              </div>
            </div>
          )}

          {/* BOTONES DE NAVEGACIÓN INFERIORES */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="py-3 px-6 bg-[#0071e3] hover:bg-[#005bb5] text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20 transition-all"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveOnboarding}
                disabled={submitting || subjects.length === 0}
                className="py-3 px-6 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-green-600/20 transition-all"
              >
                <span>{submitting ? 'Guardando...' : 'Confirmar y Acceder'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}