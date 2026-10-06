import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { fileBase64, mimeType, type } = await req.json();

    if (!fileBase64) {
      return NextResponse.json({ error: 'No se ha proporcionado ningún archivo.' }, { status: 400 });
    }

    let prompt = '';

    if (type === 'calendar') {
      prompt = `
        Analiza el documento PDF adjunto correspondiente al calendario académico universitario.
        Extrae dos elementos:
        1. "holidays": Array de días festivos o períodos no lectivos con:
           - title: Nombre del evento (string)
           - date: Fecha en formato ISO (YYYY-MM-DD)
           - type: "festivo" o "recuperacion"
        2. "exams": Array de épocas o periodos de exámenes con:
           - title: Título del periodo (string)
           - startDate: Fecha de inicio en formato ISO (YYYY-MM-DD)
           - endDate: Fecha de fin en formato ISO (YYYY-MM-DD)

        Devuelve un JSON estrictamente con las claves "holidays" y "exams".
      `;
    } else {
      prompt = `
        Analiza el documento PDF adjunto correspondiente a la guía académica u horario. 
        Extrae las asignaturas y sus horarios semanales si los hay.
        Devuelve un JSON estrictamente con una clave "subjects" (array de objetos) con:
        - name: Nombre (string)
        - code: Código o siglas (string)
        - credits: Créditos ECTS (entero, por defecto 6)
        - period_type: "semester_1", "semester_2", "quarter_1", "quarter_2", "quarter_3", o "full_year"
        - slots: Array de bloques horarios (si existen) con:
           - day: Número de día (1: Lunes a 5: Viernes)
           - startHour: Hora de inicio "HH:MM"
           - endHour: Hora de fin "HH:MM"
           - room: Aula (string)
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType || 'application/pdf',
          },
        },
        prompt,
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error procesando con IA:', error);
    return NextResponse.json({ error: 'Error al analizar el documento con IA.' }, { status: 500 });
  }
}