'use client';
import { useState, useEffect } from 'react';
import { Smartphone, X, Check } from 'lucide-react';

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosCheck);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Botón oculto en pantallas grandes (ordenador), solo visible en móvil */}
      <div className="md:hidden w-full">
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
          <span>Instalar App en el Móvil</span>
        </button>
      </div>

      {/* Modal flotante con idéntico diseño, blur y estructura que la Guía de Funcionalidades */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/80 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            
            {/* Cabecera idéntica a la Guía */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0071e3] shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-gray-900">
                    Instalar UniNotas
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium">Lleva tu expediente siempre en la pantalla de inicio</p>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido interior explicativo */}
            <div className="space-y-4 py-1">
              {isIOS ? (
                <div className="space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/80 text-xs text-gray-600 leading-relaxed">
                  <p className="font-bold text-[#0071e3]">Instalación en iPhone / iPad:</p>
                  <ol className="list-decimal list-inside space-y-1.5 font-medium">
                    <li>Pulsa el botón de <b>Compartir</b> <span className="inline-block px-1 font-bold">⎋</span> en la barra inferior de Safari.</li>
                    <li>Desplaza el menú y selecciona <b className="text-gray-900">"Añadir a pantalla de inicio"</b>.</li>
                    <li>Confirma arriba a la derecha pulsando <b>Añadir</b>.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/80 text-xs text-gray-600 leading-relaxed">
                  <p className="font-bold text-[#0071e3]">Instalación en Android / PC:</p>
                  <p className="font-medium">Si tu navegador es compatible, pulsa el botón de abajo para instalar la aplicación de forma automática en tu dispositivo.</p>
                </div>
              )}
            </div>

            {/* Pie del modal idéntico al de la Guía */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              {!isIOS && deferredPrompt && (
                <button
                  type="button"
                  onClick={async () => {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') setDeferredPrompt(null);
                    setShowModal(false);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Instalar ahora</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}