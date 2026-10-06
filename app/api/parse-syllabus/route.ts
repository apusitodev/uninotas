import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { textContent, type } = await req.json();

    if (!textContent) {
      return NextResponse.json({ error: 'No se ha proporcionado contenido para analizar.' }, { status: 400 });
    }

    let prompt = '';

    if (type === 'calendar') {
      prompt = `
        Analiza el siguiente texto extraído de un calendario académico universitario.
        Extrae dos cosas:
        1. "holidays": Un array de días festivos o períodos no lectivos, donde cada objeto tenga:
           - title: Nombre del festivo o evento (string)
           - date: Fecha en formato ISO (YYYY-MM-DD)
           - type: "festivo" o "recuperacion"
        2. "exams": Un array de épocas o periodos de exámenes, donde cada objeto tenga:
           - title: Título del periodo (string)
           - startDate: Fecha de inicio en formato ISO (YYYY-MM-DD)
           - endDate: Fecha de fin en formato ISO (YYYY-MM-DD)

        Devuelve un JSON estrictamente con las claves "holidays" y "exams".

        Texto a analizar:
        ${textContent}
      `;
    } else {
      prompt = `
        Analiza el siguiente texto extraído de un plan de estudios, guía académica u horario universitario. 
        Extrae todas las asignaturas que encuentres junto con sus horarios semanales si los hay.
        Devuelve un JSON estrictamente con un array de objetos bajo la clave "subjects", donde cada objeto tenga:
        - name: Nombre de la asignatura (string)
        - code: Código o siglas (string, ej: "MAT101", si no hay genera uno corto basado en el nombre)
        - credits: Créditos ECTS en número (entero, por defecto 6)
        - period_type: Debe ser estrictamente uno de estos valores: "semester_1", "semester_2", "quarter_1", "quarter_2", "quarter_3", "full_year".
        - slots: Un array de bloques horarios semanales (si se encuentran en el texto), donde cada objeto tenga:
           - day: Día de la semana en número (1: Lunes, 2: Martes, 3: Miércoles, 4: Jueves, 5: Viernes)
           - startHour: Hora de inicio en formato "HH:MM" (ej: "16:00")
           - endHour: Hora de fin en formato "HH:MM" (ej: "19:00")
           - room: Aula o clase (string, ej: "A41", si no hay pon "A41")

        Texto a analizar:
        ${textContent}
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    const data = JSON.parse(resultText || '{}');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error procesando con IA:', error);
    return NextResponse.json({ error: 'Error al analizar el documento con IA.' }, { status: 500 });
  }
}