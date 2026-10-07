import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
        Analiza el documento PDF adjunto correspondiente al calendario académico universitario.
        Extrae dos elementos en formato JSON estrictamente:
        1. "holidays": Array de días festivos o períodos no lectivos con:
           - title: Nombre del evento (string)
           - date: Fecha en formato ISO (YYYY-MM-DD)
           - type: "festivo" o "recuperacion"
        2. "exams": Array de épocas o periodos de exámenes con:
           - title: Título del periodo (string)
           - startDate: Fecha de inicio en formato ISO (YYYY-MM-DD)
           - endDate: Fecha de fin en formato ISO (YYYY-MM-DD)
      `;
    } else {
      prompt = `
        Analiza el documento PDF adjunto de la guía académica u horario. 
        Extrae las asignaturas y sus horarios semanales.
        Devuelve un JSON estrictamente con la clave "subjects" (array de objetos) que contenga:
        - name: Nombre (string)
        - code: Código o siglas (string)
        - credits: Créditos ECTS (entero, por defecto 6)
        - period_type: "semester_1", "semester_2", "quarter_1", "quarter_2", "quarter_3", o "full_year"
        - slots: Array de bloques horarios con:
           - day: Número de día (1: Lunes a 5: Viernes)
           - startHour: Hora de inicio "HH:MM"
           - endHour: Hora de fin "HH:MM"
           - room: Aula (string)
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
        {
          text: prompt,
        },
      ];
    } else {
      contents = [{ text: `${prompt}\n\nTexto a analizar:\n${textContent}` }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    const data = JSON.parse(resultText || '{}');

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error detallado en parse-syllabus:', error);
    return NextResponse.json({ error: `Error del servidor: ${error.message || 'Desconocido'}` }, { status: 500 });
  }
}