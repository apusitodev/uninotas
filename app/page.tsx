'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, GraduationCap, ArrowRight, Loader2, Sparkles, BookOpen, Calendar, Award } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Sesión iniciada con éxito. Cargando tu panel...' });
        
        // Redirige automáticamente al dashboard tras iniciar sesión
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);

      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Cuenta creada. Ya puedes iniciar sesión.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error en la autenticación.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-8 lg:p-16 bg-[#f4f5f8]">
      <div className="w-full max-w-[1360px] grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Columna Izquierda */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-[#0071e3] text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plataforma Académica EUM • Grado en Marketing</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
              Control total de tus <span className="text-[#0071e3]">notas y asistencias</span>.
            </h1>
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl leading-relaxed">
              Calcula medias ponderadas automáticas, controla el margen de faltas por asignatura en tiempo real y gestiona tus horarios de clase en una interfaz moderna y clara.
            </p>
          </div>

          {/* Tarjetas de características */}
          <div className="grid grid-cols-3 gap-5 pt-2">
            <div className="glass-subcard rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">7 Asignaturas S1</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Ponderación automática por porcentajes y créditos ECTS.</p>
            </div>

            <div className="glass-subcard rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Asistencia Real</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Contador de faltas y cálculo en vivo con límite del 60%.</p>
            </div>

            <div className="glass-subcard rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Aulas y Grupos</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Filtro por grupos (A/B/C/D) para Chino II e Inglés II.</p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Acceso */}
        <div className="lg:col-span-5">
          <div className="w-full glass-panel rounded-3xl p-8 lg:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#0071e3] shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h2>
                <p className="text-xs text-gray-500">
                  {isLogin ? 'Introduce tus datos para entrar al dashboard' : 'Regístrate para sincronizar tu curso'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tunombre@ejemplo.com"
                    className="w-full ios-input rounded-xl py-3 pl-11 pr-4 text-sm font-medium placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Contraseña
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full ios-input rounded-xl py-3 pl-11 pr-4 text-sm font-medium placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold ${
                    message.type === 'error'
                      ? 'bg-red-50 border border-red-200 text-red-600'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full ios-button rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Entrar al Panel' : 'Crear Cuenta'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-gray-200 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage(null);
                }}
                className="text-xs text-[#0071e3] font-semibold hover:underline cursor-pointer"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate gratis' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}