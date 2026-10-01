'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { GraduationCap, CheckCircle2, ArrowRight, Plus, Trash2, Upload, Calendar } from 'lucide-react';

interface CustomSubjectInput {
  id: string;
  name: string;
  code: string;
  credits: number;
  period_type: string;
  is_convalidated: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [parsingFile, setParsingFile] = useState(false);
  
  // Preferencias de perfil
  const [systemType, setSystemType] = useState<string>('semester'); // 'semester' o 'quarter'

  // Lista dinámica de asignaturas creadas por el usuario
  const [subjects, setSubjects] = useState<CustomSubjectInput[]>([]);
  
  // Formulario temporal para añadir nueva asignatura manualmente
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

      // Comprobar si ya completó el onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_seen_tour, academic_system')
        .eq('id', user.id)
        .single();

      if (profile && profile.has_seen_tour) {
        router.push('/dashboard');
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          period_type: sub.period_type || 'full_year',
          is_convalidated: false,
        }));
        setSubjects(prev => [...prev, ...formattedSubjects]);
      } else {
        alert('La IA no pudo extraer asignaturas claras. Prueba a introducirlas manualmente.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al leer el archivo.');
    } finally {
      setParsingFile(false);
    }
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSub: CustomSubjectInput = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      code: newCode.trim() || 'ASG',
      credits: Number(newCredits) || 6,
      period_type: newPeriod,
      is_convalidated: false,
    };

    setSubjects([...subjects, newSub]);
    setNewName('');
    setNewCode('');
    setNewCredits(6);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleToggleConvalidated = (id: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, is_convalidated: !s.is_convalidated } : s));
  };

  const handleSaveOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Guardar o actualizar perfil del usuario incluyendo el tipo de sistema académico
      await supabase.from('profiles').upsert({
        id: userId,
        academic_system: systemType,
        has_seen_tour: true,
      });

      // 2. Guardar las asignaturas personalizadas directamente en la tabla unificada user_subjects
      for (const sub of subjects) {
        await supabase.from('user_subjects').upsert({
          user_id: userId,
          subject_id: sub.id, // ID único para la asignatura del usuario
          name: sub.name,
          code: sub.code,
          ects: sub.credits,
          period_type: sub.period_type,
          is_convalidated: sub.is_convalidated,
          missed_classes: 0,
          weights: { ex: 50, trab: 50 },
        }, { onConflict: 'user_id,subject_id' });
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Error guardando onboarding:', err);
      alert('Hubo un error al guardar la configuración.');
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
      <div className="w-full max-w-2xl bg-white/85 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/80 space-y-8">
        
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#0071e3] mx-auto shadow-2xs flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Configura tu perfil académico</h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Define tu estructura de estudios, sube tus guías o añade tus asignaturas manualmente para empezar.
          </p>
        </div>

        <form onSubmit={handleSaveOnboarding} className="space-y-6">
          
          {/* Selección del Sistema Académico */}
          <div className="space-y-3 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/70">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Sistema Académico General</h3>
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
                Por Semestres (1r y 2n Semestre)
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
                Por Trimestres (1r, 2n y 3r Trimestre)
              </button>
            </div>
          </div>

          {/* Sección de Subida por IA */}
          <div className="space-y-3 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#0071e3]" /> Subir Plan de Estudios (IA)
              </h3>
              <span className="text-[10px] bg-blue-100 text-[#0071e3] px-2 py-0.5 rounded-full font-bold">
                {parsingFile ? 'Analizando...' : 'Automático'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <label className="flex-1 border-2 border-dashed border-blue-200 hover:border-[#0071e3] bg-white rounded-xl p-4 text-center cursor-pointer transition-colors block">
                <span className="text-xs font-bold text-gray-700 flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-[#0071e3]" /> 
                  {parsingFile ? 'Procesando documento con IA...' : 'Sube tu PDF o archivo de texto'}
                </span>
                <input type="file" accept=".txt,.pdf,.csv" onChange={handleFileUpload} disabled={parsingFile} className="hidden" />
              </label>
            </div>
          </div>

          {/* Formulario rápido para añadir asignatura manualmente */}
          <div className="space-y-3 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/70">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">O añadir manualmente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
              <input
                type="text"
                placeholder="Nombre (ej. Matemáticas)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="sm:col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0071e3]"
              />
              <input
                type="text"
                placeholder="Código (ej. MAT1)"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                className="sm:col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0071e3]"
              />
              <select
                value={newPeriod}
                onChange={e => setNewPeriod(e.target.value)}
                className="sm:col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0071e3]"
              >
                <option value="semester_1">1r Semestre / Trimestre</option>
                <option value="semester_2">2n Semestre / Trimestre</option>
                {systemType === 'quarter' && <option value="quarter_3">3r Trimestre</option>}
                <option value="full_year">Todo el curso</option>
              </select>
              <button
                type="button"
                onClick={handleAddSubject}
                className="sm:col-span-2 bg-[#0071e3] hover:bg-[#005bb5] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Añadir
              </button>
            </div>
          </div>

          {/* Listado de asignaturas añadidas */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Tus Asignaturas Configuradas ({subjects.length})</h3>
            {subjects.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
                No hay asignaturas añadidas todavía. Agrega al menos una para continuar.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {subjects.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{sub.code}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{sub.name}</p>
                        <p className="text-[10px] text-gray-400">Periodo: {sub.period_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[10px] font-bold text-gray-600 cursor-pointer bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={sub.is_convalidated}
                          onChange={() => handleToggleConvalidated(sub.id)}
                          className="w-3 h-3 text-[#0071e3] rounded-sm cursor-pointer"
                        />
                        Convalidada
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón de Acceso Final */}
          <button
            type="submit"
            disabled={submitting || subjects.length === 0}
            className="w-full py-4 px-6 bg-[#0071e3] hover:bg-[#005bb5] disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold tracking-wide shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{submitting ? 'Guardando...' : 'Acceder a UniNotas'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>
      </div>
    </div>
  );
}