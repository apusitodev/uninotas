import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Función con reintento automático por si la API parpadea
async function generateWithRetry(contents: any, config: any, retries = 3, delay = 2000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model: 'gemini-3.8-flash', // Modelo actualizado que exige tu API Key
        contents,
        config,
      });
    } catch (error: any) {
      console.warn(`Intento ${i + 1} fallido. Reintentando en ${delay}ms...`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileBase64, mimeType, type, textContent } = body;

    if (!fileBase64 && !textContent) {
      return NextResponse.json({ error: 'No se ha proporcionado ningún archivo o contenido.' }, { status: 400 });
    }

    let prompt = '';
    if (type === 'calendar') {
      prompt = `
        Analiza el documento adjunto correspondiente al calendario académico universitario.
        Devuelve un JSON estrictamente con dos claves:
        1. "holidays": Array de objetos con { "title": string, "date": "YYYY-MM-DD", "type": "festivo" o "recuperacion" }
        2. "exams": Array de objetos con { "title": string, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }
      `;
    } else {
      prompt = `
        Analiza el documento adjunto de la guía académica u horario. 
        Devuelve un JSON estrictamente con la clave "subjects" (array de objetos) que contenga:
        - name: Nombre (string)
        - code: Código o siglas (string)
        - credits: Créditos ECTS (número, ej: 6)
        - period_type: "semester_1", "semester_2", "quarter_1", "quarter_2", "quarter_3", o "full_year"
        - slots: Array de bloques horarios con { "day": 1 a 5, "startHour": "HH:MM", "endHour": "HH:MM", "room": string }
      `;
    }

    let contents: any[] = [];
    if (fileBase64) {
      contents = [
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType || 'application/pdf',
          },
        },
        { text: prompt },
      ];
    } else {
      contents = [{ text: `${prompt}\n\nTexto:\n${textContent}` }];
    }

    const response = await generateWithRetry(contents, {
      responseMimeType: 'application/json',
    });

    const resultText = response.text;
    const data = JSON.parse(resultText || '{}');

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error detallado en parse-syllabus:', error);
    return NextResponse.json({ error: `Error de la IA: ${error.message || 'Servidor saturado'}` }, { status: 500 });
  }
}