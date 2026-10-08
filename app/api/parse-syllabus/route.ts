import { NextResponse } from 'next/server';

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
        Devuelve un JSON estrictamente con dos claves:
        1. "holidays": Array de objetos con { "title": string, "date": "YYYY-MM-DD", "type": "festivo" o "recuperacion" }
        2. "exams": Array de objetos con { "title": string, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }
        No incluyas texto conversacional ni guiones antes del JSON.
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
        No incluyas texto conversacional ni guiones antes del JSON.
      `;
    }

    let parts: any[] = [];
    if (fileBase64) {
      parts = [
        {
          inlineData: {
            mimeType: mimeType || 'application/pdf',
            data: fileBase64
          }
        },
        { text: prompt }
      ];
    } else {
      parts = [{ text: `${prompt}\n\nTexto:\n${textContent}` }];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'La variable de entorno GEMINI_API_KEY não está configurada.' }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Error de la API de Google (${apiRes.status}): ${errText}`);
    }

    const data = await apiRes.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('La respuesta de la IA llegó vacía.');
    }

    // EXTRACCIÓN INTELIGENTE: Busca exclusivamente el primer '{' o '[' y el último '}' o ']'
    const jsonMatch = textResponse.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!jsonMatch) {
      throw new Error('La IA no ha devuelto un formato JSON válido.');
    }

    const cleanJsonString = jsonMatch[0];
    const parsedData = JSON.parse(cleanJsonString);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error crítico en parse-syllabus:', error);
    return NextResponse.json({ error: `Error del servidor: ${error.message || 'Desconocido'}` }, { status: 500 });
  }
}