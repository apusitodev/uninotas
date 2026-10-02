'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  GraduationCap, ArrowRight, ArrowLeft, Plus, Trash2, Upload, 
  Calendar, BookOpen, Clock, CheckCircle2, Building2, MapPin, Sparkles 
} from 'lucide-react';

interface HolidayInput {
  id: string;
  title: string;
  date: string;
  type: string; // 'festivo' | 'recuperacion'
}

interface ExamPeriodInput {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface ClassSlotInput {
  id: string;
  day: number; // 1: Lunes ... 5: Viernes
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

// Listas de sugerencias para autocompletar
const POPULAR_UNIVERSITIES = [
  'EUM (Escola Universitària del Maresme)',
  'Universitat Autònoma de Barcelona (UAB)',
  'Universitat de Barcelona (UB)',
  'Universitat Politècnica de Catalunya (UPC)',
  'Universitat Pompeu Fabra (UPF)',
  'Universitat de Girona (UdG)',
  'Universitat de Lleida (UdL)',
  'Universitat Rovira i Virgili (URV)',
  'Universitat Oberta de Catalunya (UOC)',
  'Universitat Ramon Llull (URL)'
];

const POPULAR_CITIES = ['Mataró', 'Barcelona', 'Badalona', 'Sabadell', 'Terrassa', 'Girona', 'Tarragona', 'Lleida', 'Madrid', 'Valencia'];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [parsingCalendar, setParsingCalendar] = useState(false);
  const [parsingSubjects, setParsingSubjects] = useState(false);
  
  // Control de Pasos (1 al 5)
  const [step, setStep] = useState<number>(1);

  // Paso 1: Información General
  const [university, setUniversity] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [systemType, setSystemType] = useState<string>('semester');

  // Paso 2: Calendario Anual (Festivos y Exámenes)
  const [holidays, setHolidays] = useState<HolidayInput[]>([]);
  const [newHolidayTitle, setNewHolidayTitle] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayType, setNewHolidayType] = useState('festivo');

  const [examPeriods, setExamPeriods] = useState<ExamPeriodInput[]>([]);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamStart, setNewExamStart] = useState('');
  const [newExamEnd, setNewExamEnd] = useState('');

  // Paso 3: Asignaturas
  const [subjects, setSubjects] = useState<SubjectInput[]>([]);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCredits, setNewCredits] = useState<number>(6);
  const [newPeriod, setNewPeriod] = useState('semester_1');

  // Paso 4: Horarios temporales seleccionados por asignatura activa
  const [selectedSubjectForSlot, setSelectedSubjectForSlot] = useState<string>('');
  const [slotDay, setSlotDay] = useState<number>(1);
  const [slotStart, setSlotStart] = useState('08:00');
  const [slotEnd, setSlotEnd] = useState('10:00');
  const [slotRoom, setSlotRoom] = useState('');

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

  // IA: Analizar Calendario (Paso 2)
  const handleCalendarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingCalendar(true);
    try {
      const textContent = await file.text();
      const res = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent, type: 'calendar' }),
      });

      const data = await res.json();
      if (data.holidays && Array.isArray(data.holidays)) {
        const formattedHols = data.holidays.map((h: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          title: h.title || 'Festivo',
          date: h.date || new Date().toISOString().split('T')[0],
          type: h.type || 'festivo',
        }));
        setHolidays(prev => [...prev, ...formattedHols]);
      }
      if (data.exams && Array.isArray(data.exams)) {
        const formattedExams = data.exams.map((ex: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          title: ex.title || 'Época de Exámenes',
          startDate: ex.startDate || new Date().toISOString().split('T')[0],
          endDate: ex.endDate || new Date().toISOString().split('T')[0],
        }));
        setExamPeriods(prev => [...prev, ...formattedExams]);
      }
      alert('¡Calendario analizado con éxito por la IA! Revisa los datos añadidos.');
    } catch (err) {
      console.error(err);
      alert('Error al leer el archivo de calendario.');
    } finally {
      setParsingCalendar(false);
    }
  };

  // IA: Analizar Asignaturas y Horarios (Paso 3)
  const handleSubjectsFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingSubjects(true);
    try {
      const textContent = await file.text();
      const res = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent, type: 'subjects' }),
      });

      const data = await res.json();
      if (data.subjects && Array.isArray(data.subjects)) {
        const formattedSubs = data.subjects.map((sub: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          name: sub.name || 'Asignatura',
          code: sub.code || generateCode(sub.name || 'ASG'),
          credits: Number(sub.credits) || 6,
          period_type: sub.period_type || 'semester_1',
          is_convalidated: false,
          slots: sub.slots || [],
        }));
        setSubjects(prev => [...prev, ...formattedSubs]);
        if (formattedSubs.length > 0 && !selectedSubjectForSlot) {
          setSelectedSubjectForSlot(formattedSubs[0].id);
        }
      }
      alert('¡Plan de estudios y horarios extraídos correctamente por la IA!');
    } catch (err) {
      console.error(err);
      alert('Error al procesar el archivo de asignaturas.');
    } finally {
      setParsingSubjects(false);
    }
  };

  // Generador automático de código si está vacío
  const generateCode = (name: string) => {
    if (!name) return 'ASG';
    const clean = name.trim().toUpperCase().replace(/[^A-Z]/g, '');
    return clean.slice(0, 5) || 'ASG';
  };

  const handleAddHoliday = () => {
    if (!newHolidayTitle.trim() || !newHolidayDate) return;
    setHolidays([...holidays, { id: Math.random().toString(36).substring(2, 9), title: newHolidayTitle, date: newHolidayDate, type: newHolidayType }]);
    setNewHolidayTitle('');
    setNewHolidayDate('');
  };

  const handleAddExamPeriod = () => {
    if (!newExamTitle.trim() || !newExamStart || !newExamEnd) return;
    setExamPeriods([...examPeriods, { id: Math.random().toString(36).substring(2, 9), title: newExamTitle, startDate: newExamStart, endDate: newExamEnd }]);
    setNewExamTitle('');
    setNewExamStart('');
    setNewExamEnd('');
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const finalCode = newCode.trim() ? newCode.trim().toUpperCase() : generateCode(newName);
    const newSubId = Math.random().toString(36).substring(2, 9);

    setSubjects([...subjects, {
      id: newSubId,
      name: newName.trim(),
      code: finalCode,
      credits: Number(newCredits) || 6,
      period_type: newPeriod,
      is_convalidated: false,
      slots: [],
    }]);

    if (!selectedSubjectForSlot) setSelectedSubjectForSlot(newSubId);

    setNewName('');
    setNewCode('');
    setNewCredits(6);
  };

  const handleAddSlotToSubject = () => {
    if (!selectedSubjectForSlot) return;
    setSubjects(subjects.map(sub => {
      if (sub.id === selectedSubjectForSlot) {
        return {
          ...sub,
          slots: [
            ...sub.slots,
            {
              id: Math.random().toString(36).substring(2, 9),
              day: slotDay,
              startHour: slotStart,
              endHour: slotEnd,
              room: slotRoom.trim() || 'Aula N/D',
            }
          ]
        };
      }
      return sub;
    }));
    setSlotRoom('');
  };

  const handleRemoveSlot = (subId: string, slotId: string) => {
    setSubjects(subjects.map(sub => {
      if (sub.id === subId) {
        return { ...sub, slots: sub.slots.filter(s => s.id !== slotId) };
      }
      return sub;
    }));
  };

  const handleSaveOnboarding = async () => {
    setSubmitting(true);
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        academic_system: systemType,
        university: university,
        city: city,
        has_seen_tour: true,
      });

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

      for (const hol of holidays) {
        await supabase.from('academic_events').insert({
          user_id: userId,
          title: hol.title,
          event_type: hol.type, // 'festivo' o 'recuperacion'
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

          {/* PASO 1: Información General con Autocompletado */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">1. Información de la Universidad</h3>
              
              <div className="space-y-3">
                <div className="relative">
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
                  {university && !POPULAR_UNIVERSITIES.includes(university) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {POPULAR_UNIVERSITIES.filter(u => u.toLowerCase().includes(university.toLowerCase())).map((uni, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setUniversity(uni)}
                          className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer text-gray-700"
                        >
                          {uni}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Ciudad</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Ej. Mataró / Barcelona"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                  {city && !POPULAR_CITIES.includes(city) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {POPULAR_CITIES.filter(c => c.toLowerCase().includes(city.toLowerCase())).map((c, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setCity(c)}
                          className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer text-gray-700"
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
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

          {/* PASO 2: Calendario Anual Moderno (Festivos, Recuperaciones y Exámenes) */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">2. Festivos y Épocas de Exámenes</h3>
                <label className="text-[10px] bg-blue-50 text-[#0071e3] border border-blue-100 px-3 py-1.5 rounded-xl font-bold cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> {parsingCalendar ? 'Analizando...' : 'Autocompletar con IA'}
                  <input type="file" accept=".txt,.pdf,.csv" onChange={handleCalendarFileUpload} disabled={parsingCalendar} className="hidden" />
                </label>
              </div>

              {/* Festivos / No lectivos / Recuperaciones */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/70 space-y-3">
                <h4 className="text-[11px] font-extrabold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" /> Días Festivos y Recuperaciones ({holidays.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (ej. Navidad / Recuperación)"
                    value={newHolidayTitle}
                    onChange={e => setNewHolidayTitle(e.target.value)}
                    className="sm:col-span-5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                  <select
                    value={newHolidayType}
                    onChange={e => setNewHolidayType(e.target.value)}
                    className="sm:col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  >
                    <option value="festivo">Festivo</option>
                    <option value="recuperacion">Recuperación / Extraordinaria</option>
                  </select>
                  <input
                    type="date"
                    value={newHolidayDate}
                    onChange={e => setNewHolidayDate(e.target.value)}
                    className="sm:col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddHoliday}
                    className="sm:col-span-1 bg-gray-900 text-white p-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-800 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                  {holidays.map(h => (
                    <div key={h.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-200 text-xs shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${h.type === 'festivo' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        <span className="font-bold text-gray-800">{h.title}</span>
                        <span className="text-[10px] text-gray-400">({h.date})</span>
                      </div>
                      <button onClick={() => setHolidays(holidays.filter(x => x.id !== h.id))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Épocas de Exámenes (Rangos) */}
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
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-0.5">Desde</span>
                      <input
                        type="date"
                        value={newExamStart}
                        onChange={e => setNewExamStart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-0.5">Hasta</span>
                      <input
                        type="date"
                        value={newExamEnd}
                        onChange={e => setNewExamEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div className="flex items-end pt-4">
                      <button
                        type="button"
                        onClick={handleAddExamPeriod}
                        className="bg-[#0071e3] text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#005bb5]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                  {examPeriods.map(e => (
                    <div key={e.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-200 text-xs shadow-2xs">
                      <span className="font-bold text-gray-800">{e.title} <span className="text-[10px] text-gray-400 font-normal">({e.startDate} al {e.endDate})</span></span>
                      <button onClick={() => setExamPeriods(examPeriods.filter(x => x.id !== e.id))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Plan de Estudios y Asignaturas (Con IA y ECTS y Código Opcional) */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">3. Tus Asignaturas ({subjects.length})</h3>
                <label className="text-[10px] bg-blue-50 text-[#0071e3] border border-blue-100 px-3 py-1.5 rounded-xl font-bold cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> {parsingSubjects ? 'Analizando...' : 'Subir Guía con IA'}
                  <input type="file" accept=".txt,.pdf,.csv" onChange={handleSubjectsFileUpload} disabled={parsingSubjects} className="hidden" />
                </label>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="text-[11px] font-bold text-gray-700">Añadir Asignatura Manualmente</h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (ej. Matemáticas)"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="sm:col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Código (opcional)"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                  />
                  <input
                    type="number"
                    placeholder="ECTS"
                    value={newCredits}
                    onChange={e => setNewCredits(Number(e.target.value))}
                    className="sm:col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                    min={1}
                    max={30}
                  />
                  <select
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value)}
                    className="sm:col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
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
                    className="bg-[#0071e3] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[#005bb5]"
                  >
                    <Plus className="w-4 h-4" /> Añadir Asignatura
                  </button>
                </div>
              </div>

              {/* Listado de asignaturas */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {subjects.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
                    No hay asignaturas añadidas todavía. Agrega al menos una para continuar.
                  </div>
                ) : (
                  subjects.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-xl text-xs shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{sub.name}</span>
                          <span className="font-mono text-[10px] bg-blue-50 text-[#0071e3] px-1.5 py-0.5 rounded font-bold">{sub.code}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">{sub.credits} ECTS • {sub.period_type}</p>
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

          {/* PASO 4: Horarios Semanales Interactivos */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">4. Horarios Semanales por Asignatura</h3>
              <p className="text-xs text-gray-500">
                Configura o revisa los días y horas de clase para cada asignatura. Si subiste tu guía con IA, aparecerán aquí pre-cargadas.
              </p>

              {subjects.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
                  Primero debes añadir asignaturas en el paso anterior.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selector de asignatura */}
                  <div className="flex gap-2 items-center">
                    <select
                      value={selectedSubjectForSlot}
                      onChange={e => setSelectedSubjectForSlot(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                    >
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* Creador de bloque horario para la asignatura seleccionada */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                    <h4 className="text-[11px] font-bold text-gray-700">Añadir Franja Horaria</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <select
                        value={slotDay}
                        onChange={e => setSlotDay(Number(e.target.value))}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      >
                        <option value={1}>Lunes</option>
                        <option value={2}>Martes</option>
                        <option value={3}>Miércoles</option>
                        <option value={4}>Jueves</option>
                        <option value={5}>Viernes</option>
                      </select>
                      <input
                        type="time"
                        value={slotStart}
                        onChange={e => setSlotStart(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                      <input
                        type="time"
                        value={slotEnd}
                        onChange={e => setSlotEnd(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Aula (ej. A-201)"
                        value={slotRoom}
                        onChange={e => setSlotRoom(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSlotToSubject}
                        className="bg-[#0071e3] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-[#005bb5]"
                      >
                        <Plus className="w-4 h-4" /> Añadir
                      </button>
                    </div>
                  </div>

                  {/* Listado de franjas horarias agrupadas por asignatura */}
                  <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
                    {subjects.map(sub => (
                      <div key={sub.id} className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                          <span className="text-xs font-extrabold text-gray-900">{sub.name} <span className="text-[10px] text-gray-400 font-mono">({sub.code})</span></span>
                          <span className="text-[10px] bg-blue-50 text-[#0071e3] px-2 py-0.5 rounded-full font-bold">{sub.slots.length} clases/sem</span>
                        </div>
                        {sub.slots.length === 0 ? (
                          <p className="text-[11px] text-gray-400 italic">Sin horarios añadidos aún.</p>
                        ) : (
                          <div className="space-y-1">
                            {sub.slots.map(slot => {
                              const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
                              return (
                                <div key={slot.id} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg text-xs">
                                  <span className="font-medium text-gray-700">{dayNames[slot.day]} de {slot.startHour} a {slot.endHour} <span className="text-gray-400">({slot.room})</span></span>
                                  <button onClick={() => handleRemoveSlot(sub.id, slot.id)} className="text-red-400 hover:text-red-600">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <span className="text-gray-500">Festivos / Recuperaciones:</span>
                  <span className="font-bold text-gray-800">{holidays.length} días</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Épocas de exámenes:</span>
                  <span className="font-bold text-gray-800">{examPeriods.length} periodos</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Asignaturas totales:</span>
                  <span className="font-bold text-gray-800">{subjects.length} materias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total de clases semanales:</span>
                  <span className="font-bold text-gray-800">{subjects.reduce((acc, s) => acc + s.slots.length, 0)} bloques</span>
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