import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No se ha proporcionado ningún archivo.' }, { status: 400 });
    }

    // Convertimos el archivo recibido por FormData a Buffer y luego a Base64 de forma limpia
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    let prompt = '';
    if (type === 'calendar') {
      prompt = `
        Analiza el documento PDF adjunto correspondiente al calendario académico universitario.
        Devuelve un JSON estrictamente con dos claves:
        1. "holidays": Array de objetos con { "title": string, "date": "YYYY-MM-DD", "type": "festivo" o "recuperacion" }
        2. "exams": Array de objetos con { "title": string, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }
      `;
    } else {
      prompt = `
        Analiza el documento PDF adjunto de la guía académica u horario. 
        Devuelve un JSON estrictamente con la clave "subjects" (array de objetos) que contenga:
        - name: Nombre (string)
        - code: Código o siglas (string)
        - credits: Créditos ECTS (número, ej: 6)
        - period_type: "semester_1", "semester_2", "quarter_1", "quarter_2", "quarter_3", o "full_year"
        - slots: Array de bloques horarios con { "day": 1 a 5, "startHour": "HH:MM", "endHour": "HH:MM", "room": string }
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type || 'application/pdf',
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text;
    const data = JSON.parse(resultText || '{}');

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error crítico en parse-syllabus:', error);
    return NextResponse.json({ error: `Error del servidor: ${error.message || 'Desconocido'}` }, { status: 500 });
  }
}