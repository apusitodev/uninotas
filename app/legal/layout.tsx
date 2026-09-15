import React from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-900 font-sans antialiased">
      <header className="border-b border-gray-200/70 bg-white/70 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0071e3]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-900">UniNotas Legal</span>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6 sm:p-10 my-8 bg-white/80 rounded-3xl border border-gray-200/80 shadow-sm">
        {children}
      </main>
    </div>
  );
}