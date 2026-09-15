'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { GraduationCap, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Configurar persistencia según el check de recordar sesión
      if (!rememberMe) {
        await supabase.auth.setSession({ access_token: '', refresh_token: '' });
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
          });
        }

        setSuccessMsg('¡Cuenta creada con éxito! Redirigiendo al onboarding...');
        setTimeout(() => {
          router.push('/onboarding');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ha ocurrido un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/85 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/80 space-y-7 relative z-10 animate-ios-item-1">
        
        {/* Cabecera con Título Grande y Visible */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0071e3] mx-auto shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0071e3] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              UniNotas • EUM
            </span>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 mt-2">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {isLogin ? 'Accede a tu panel de notas y asistencias' : 'Regístrate gratis para empezar a organizar tu curso'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Correo electrónico</label>
            <input
              type="email"
              required
              placeholder="tu.nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-gray-200 bg-white/60 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#0071e3]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-gray-200 bg-white/60 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#0071e3]"
            />
          </div>

          {/* Opción de Recordar Sesión (Solo visible en Login) */}
          {isLogin && (
            <div className="flex items-center gap-2 pt-1 px-1">
              <input
                type="checkbox"
                id="remember_me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#0071e3] focus:ring-[#0071e3] cursor-pointer"
              />
              <label htmlFor="remember_me" className="text-xs font-semibold text-gray-600 cursor-pointer">
                Guardar inicio de sesión en este dispositivo
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Procesando...' : isLogin ? 'Entrar al Panel' : 'Registrarse'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs font-bold text-gray-500 hover:text-[#0071e3] transition-colors cursor-pointer"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate gratis aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">EUM • Grau en Màrqueting (2n A)</p>
        </div>
      </div>
    </div>
  );
}