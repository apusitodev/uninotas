'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
}

const GROUPS_INFO = [
  { id: 'A', label: 'Grupo A (Aula A41)' },
  { id: 'B', label: 'Grupo B (Aula A42)' },
  { id: 'C', label: 'Grupo C (Aula A51)' },
  { id: 'D', label: 'Grupo D (Aula A52)' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [userId, setUserId] = useState<string>('');
  const [chineseGroup, setChineseGroup] = useState<string>('A');
  const [englishGroup, setEnglishGroup] = useState<string>('A');
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [convalidatedIds, setConvalidatedIds] = useState<Record<string, boolean>>({});

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

      const { data: subs } = await supabase.from('subjects').select('id, name, code, semester');
      if (subs) setSubjects(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConvalidated = (subjectId: string) => {
    setConvalidatedIds(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const handleSaveOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await supabase.from('profiles').upsert({
        id: userId,
        chinese_group: chineseGroup,
        english_group: englishGroup,
      });

      for (const sub of subjects) {
        const isConv = !!convalidatedIds[sub.id];
        
        await supabase.from('user_subjects').upsert({
          user_id: userId,
          subject_id: sub.id,
          is_convalidated: isConv,
          missed_classes: 0
        }, { onConflict: 'user_id,subject_id' });
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Error guardando onboarding:', err);
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
      <div className="w-full max-w-xl bg-white/85 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/80 space-y-7">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0071e3] mx-auto shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Configura tu perfil</h1>
          <p className="text-xs text-gray-400 font-medium">
            Selecciona tus grupos de idiomas y marca si tienes alguna asignatura convalidada.
          </p>
        </div>

        <form onSubmit={handleSaveOnboarding} className="space-y-6">
          <div className="space-y-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/70">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Grupos de Idiomas</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Xinès II</label>
                <div className="grid grid-cols-4 gap-2">
                  {GROUPS_INFO.map(g => (
                    <button
                      key={`ch_${g.id}`}
                      type="button"
                      onClick={() => setChineseGroup(g.id)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        chineseGroup === g.id ? 'border-[#0071e3] bg-[#0071e3] text-white shadow-xs' : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      {g.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Anglès II</label>
                <div className="grid grid-cols-4 gap-2">
                  {GROUPS_INFO.map(g => (
                    <button
                      key={`en_${g.id}`}
                      type="button"
                      onClick={() => setEnglishGroup(g.id)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        englishGroup === g.id ? 'border-[#0071e3] bg-[#0071e3] text-white shadow-xs' : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      {g.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/70">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Asignaturas Convalidadas</h3>
              <span className="text-[11px] text-gray-400 font-medium">Opcional</span>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {subjects.map(sub => {
                const isConv = !!convalidatedIds[sub.id];
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleToggleConvalidated(sub.id)}
                    className={`p-3 rounded-xl border flex items-center justify-center sm:justify-between cursor-pointer transition-all ${
                      isConv ? 'border-emerald-300 bg-emerald-50/60' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold text-[#0071e3] bg-blue-50 px-2 py-0.5 rounded">{sub.code}</span>
                      <span className={`text-xs font-semibold ${isConv ? 'line-through text-emerald-900 font-bold' : 'text-gray-800'}`}>{sub.name}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${isConv ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-white'}`}>
                      {isConv && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-extrabold shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Guardando...' : 'Acceder a UniNotas'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}