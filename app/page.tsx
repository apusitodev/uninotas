'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,  
  Shield,
  AlertTriangle,
  Loader2,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true,
    agreeToTerms: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (authMode === 'login') {
        if (!formData.rememberMe) {
          await supabase.auth.setSession({ access_token: '', refresh_token: '' });
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        if (formData.rememberMe) {
          localStorage.setItem('userEmail', formData.email);
          localStorage.setItem('rememberMe', 'true');
        }

        router.push('/dashboard');
        
      } else if (authMode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        if (!formData.agreeToTerms) {
          throw new Error('Debes aceptar los términos y condiciones.');
        }

        // Supabase enviará automáticamente el correo de confirmación configurado en su panel
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name },
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
          });
        }

        setSuccessMsg('¡Cuenta creada con éxito! Revisa tu correo para confirmarla.');
        setTimeout(() => {
          setAuthMode('login');
        }, 3000);
        
      } else if (authMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
        if (error) throw error;
        setSuccessMsg('¡Correo de recuperación enviado!');
        setTimeout(() => setAuthMode('login'), 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ha ocurrido un error en la autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 space-y-6 relative z-10">
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0071e3] mx-auto shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0071e3] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              UniNotas • EUM
            </span>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 mt-2">
              {authMode === 'login' ? 'Iniciar Sesión' : authMode === 'reset' ? 'Recuperar Contraseña' : 'Crear Cuenta'}
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {authMode === 'login' ? 'Accede a tu panel de notas y asistencias' : authMode === 'reset' ? 'Introduce tu correo para recuperar el acceso' : 'Regístrate gratis para empezar'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center">
            {successMsg}
          </div>
        )}

        {authMode !== 'reset' && (
          <div className="flex bg-gray-100/80 p-1 rounded-2xl">
            <button
              onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${authMode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              type="button"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${authMode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              type="button"
            >
              Registro
            </button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 ml-1">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white/60 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#0071e3]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="tu.nombre@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white/60 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          {authMode !== 'reset' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white/60 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#0071e3]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 ml-1">Confirmar contraseña</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white/60 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#0071e3]"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {authMode === 'login' && (
            <div className="flex items-center justify-between pt-1 px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 rounded text-[#0071e3] focus:ring-[#0071e3] cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-600">Recordarme</span>
              </label>
              <button type="button" onClick={() => { setAuthMode('reset'); setErrorMsg(''); setSuccessMsg(''); }} className="text-xs font-bold text-[#0071e3] hover:underline cursor-pointer">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {authMode === 'signup' && (
            <label className="flex items-start gap-2.5 cursor-pointer text-xs px-1 pt-1">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#0071e3] focus:ring-[#0071e3] cursor-pointer"
              />
              <span className="text-gray-500 font-medium">Acepto los términos de servicio y la política de privacidad</span>
            </label>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (authMode === 'login' ? 'Entrar al Panel' : authMode === 'reset' ? 'Enviar Enlace' : 'Registrarse')}
            {!isLoading && authMode === 'login' && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {authMode === 'reset' && (
          <div className="text-center pt-2">
            <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className="text-xs font-bold text-[#0071e3] hover:underline cursor-pointer">
              Volver al inicio de sesión
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">EUM • Grau en Màrqueting (2n A)</p>
        </div>
      </div>
    </div>
  );
}