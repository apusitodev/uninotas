'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Languages } from 'lucide-react';

const GROUPS = [
  { id: 'A', room: 'A41', label: 'Grupo A' },
  { id: 'B', room: 'A42', label: 'Grupo B' },
  { id: 'C', room: 'A51', label: 'Grupo C' },
  { id: 'D', room: 'A52', label: 'Grupo D' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  const [chineseGroup, setChineseGroup] = useState<string>('A');
  const [englishGroup, setEnglishGroup] = useState<string>('A');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }
    setUserId(user.id);
    setUserEmail(user.email || '');

    // Comprobar si ya completó el perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('chinese_group, english_group')
      .eq('id', user.id)
      .single();

    if (profile && profile.chinese_group && profile.english_group) {
      router.push('/dashboard');
      return;
    }

    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        email: userEmail,
        chinese_group: chineseGroup,
        english_group: englishGroup,
      });

      if (!error) {
        router.push('/dashboard');
      } else {
        console.error(error);
        alert('Hubo un problema guardando tu perfil.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f8] text-gray-400 text-xs font-semibold">
        Cargando configuración...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 sm:p-10 border border-white/80 shadow-2xl bg-white/80 backdrop-blur-xl space-y-8 animate-ios-item-1">
        
        {/* Encabezado */}
        <div className="space-y-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0071e3] mx-auto shadow-xs">
            <Languages className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Personaliza tu Horario</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Selecciona el grupo de nivel que tienes asignado en Chino e Inglés para mostrar tu aula exacta en el horario.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Grupo de Chino */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                Xinès II
              </label>
              <span className="text-[11px] font-semibold text-gray-400">Dilluns i Dimecres • 19:00</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {GROUPS.map((g) => {
                const isSelected = chineseGroup === g.id;
                return (
                  <button
                    key={`chin_${g.id}`}
                    type="button"
                    onClick={() => setChineseGroup(g.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0071e3] bg-[#0071e3] text-white shadow-sm scale-102'
                        : 'border-gray-200/80 bg-white/70 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <p className="text-xs font-black">{g.label}</p>
                    <p className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      Aula {g.room}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grupo de Inglés */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                Anglès II
              </label>
              <span className="text-[11px] font-semibold text-gray-400">Dimarts i Dijous • 19:00[cite: 1]</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {GROUPS.map((g) => {
                const isSelected = englishGroup === g.id;
                return (
                  <button
                    key={`eng_${g.id}`}
                    type="button"
                    onClick={() => setEnglishGroup(g.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0071e3] bg-[#0071e3] text-white shadow-sm scale-102'
                        : 'border-gray-200/80 bg-white/70 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <p className="text-xs font-black">{g.label}</p>
                    <p className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      Aula {g.room}[cite: 1]
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón Guardar */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-98 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{saving ? 'Guardando...' : 'Comenzar Curso'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium">
            Podrás cambiar de grupo en cualquier momento si te reasignan de clase[cite: 1].
          </p>
        </div>
      </div>
    </div>
  );
}