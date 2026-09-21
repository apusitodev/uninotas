// app/loading.tsx
import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#f4f5f8] py-12">
      {/* Espaciador superior */}
      <div />

      {/* Contenido central: Botella animada y texto */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center justify-center my-1">
          <svg
            viewBox="0 0 205 615"
            className="cola w-[45px] fill-transparent stroke-[#0071e3] stroke-[15px] stroke-linecap-round"
          >
            <path d="M47 595c-8 0-26-6-26-34V261c0-17 9-29 16-38s16-28 16-28L68 59l-4-5s3-30 7-36 14-6 32-6 28 0 32 6 7 36 7 36l-4 5 15 136s9 19 16 28 16 21 16 38v300c0 28-18 34-26 34H47z" />
          </svg>

          <style>{`
            .cola {
              --pathlength: 1384;
              stroke-dashoffset: var(--pathlength);
              stroke-dasharray: 0 var(--pathlength);
              animation: loader 3s cubic-bezier(0.5, 0.1, 0.5, 1) infinite both;
            }

            @keyframes loader {
              90%, 100% {
                stroke-dashoffset: 0;
                stroke-dasharray: var(--pathlength) 0;
              }
            }
          `}</style>
        </div>

        <p className="text-xs text-gray-400 font-medium tracking-wide animate-pulse">Sincronizando expediente...</p>
      </div>

      {/* Footer inferior */}
      <div className="text-center">
        <p className="text-[11px] text-gray-400 font-normal">
          © 2026 UniNotas. Uso académico personal.
        </p>
      </div>
    </div>
  );
}