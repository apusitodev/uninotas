// components/InstallPWAButton.tsx
'use client';
import React, { useState, useEffect } from 'react';

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar si es dispositivo iOS
    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIosDevice) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async (evt: React.MouseEvent) => {
    evt.preventDefault();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // Si es iOS o no hay prompt nativo, mostramos el modal flotante explicativo
      setShowIOSModal(true);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-600 transition-colors cursor-pointer border border-indigo-200/50 mt-2"
      >
        <span>📱</span>
        <span>Instalar App en el Móvil</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold text-gray-900">Instalar Uninotas</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Para instalar esta app en tu iPhone, pulsa el botón de <b>Compartir</b> <span className="inline-block text-blue-600 font-bold">⎋</span> en la barra de Safari y selecciona <span className="font-semibold text-gray-800">"Añadir a pantalla de inicio"</span>.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-gray-900 text-white font-semibold py-2 rounded-xl text-xs cursor-pointer"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}