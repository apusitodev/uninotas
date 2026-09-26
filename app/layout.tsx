import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniNotas EUM",
  description: "Gestión académica y notas",
  manifest: "/manifest.json", 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[#f4f5f8] flex flex-col justify-between font-sans text-gray-900">
        
        {/* Contenedor dinámico de tus páginas */}
        <div className="flex-1 w-full">
          {children}
        </div>

        {/* Footer global anclado al fondo */}
        <footer className="w-full max-w-7xl mx-auto py-6 px-4 text-center text-xs text-gray-400 border-t border-gray-200/60 mt-auto">
          <p>© 2026 UniNotas. Uso académico personal.</p>
        </footer>

      </body>
    </html>
  );
}