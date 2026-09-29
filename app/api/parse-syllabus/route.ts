import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { textContent } = await req.json();

    if (!textContent) {
      return NextResponse.json({ error: 'No se ha proporcionado contenido para analizar.' }, { status: 400 });
    }

    const prompt = `
      Analiza el siguiente texto extraído de un plan de estudios o guía académica universitaria. 
      Extrae todas las asignaturas que encuentres. 
      Devuelve un JSON estrictamente con un array de objetos bajo la clave "subjects", donde cada objeto tenga:
      - name: Nombre de la asignatura (string)
      - code: Código opcional o siglas (string, ej: "MAT101", si no hay pon "ASG")
      - credits: Créditos ECTS en número (entero, por defecto 6)
      - period_type: Debe ser estrictamente uno de estos valores: "semester_1", "semester_2", "quarter_1", "quarter_2", "quarter_3", "full_year".

      Texto a analizar:
      ${textContent}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    const data = JSON.parse(resultText || '{"subjects": []}');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error procesando con IA:', error);
    return NextResponse.json({ error: 'Error al analizar el documento con IA.' }, { status: 500 });
  }
}