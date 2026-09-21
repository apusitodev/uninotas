'use client';
import React, { useState, useEffect } from 'react';

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  if (!isVisible && !isIOS) return null;

  return (
    <div className="w-full mt-2">
      {isVisible ? (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-600 transition-colors cursor-pointer border border-indigo-200/50"
        >
          <span>📱</span>
          <span>Instalar Aplicación</span>
        </button>
      ) : isIOS ? (
        <div className="px-3 py-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1 border border-slate-200">
          <p className="font-semibold text-slate-800">Para instalar en tu iPhone:</p>
          <p>Toca el botón de <strong>Compartir</strong> en Safari y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</p>
        </div>
      ) : null}
    </div>
  );
}