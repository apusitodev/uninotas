import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let fileBase64 = '';
    let mimeType = 'application/pdf';
    let type = '';
    let textContent = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      type = (formData.get('type') as string) || 'calendar';
      textContent = (formData.get('textContent') as string) || '';

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        fileBase64 = Buffer.from(arrayBuffer).toString('base64');
        mimeType = file.type || 'application/pdf';
      }
    } else {
      const body = await req.json();
      fileBase64 = body.fileBase64;
      mimeType = body.mimeType || 'application/pdf';
      type = body.type || 'calendar';
      textContent = body.textContent;
    }

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
        Devuelve ÚNICAMENTE el objeto JSON puro, sin bloques markdown ni texto adicional.
      `;
    } else {
      prompt = `
        Analiza el documento adjunto de la guía académica u horario. 
        Devuelve un JSON estrictamente con la clave "subjects" (array de objetos) que contenga:
        - name: Nombre (string)
        - code: Código o siglas (string)
        - credits: Créditos ECTS (número, ej: 6)
        - period_type: "semester_1", "semester_2", "quarter_1", "quarter_2", "quarter_3", o "full_year"
        - slots: Array de bloques horarios con { "day": 1 al 5, "startHour": "HH:MM", "endHour": "HH:MM", "room": string }
        Devuelve ÚNICAMENTE el objeto JSON puro, sin bloques markdown ni texto adicional.
      `;
    }

    let parts: any[] = [];
    if (fileBase64) {
      parts = [
        {
          inlineData: {
            mimeType: mimeType,
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
      return NextResponse.json({ error: 'La variable GEMINI_API_KEY no está configurada en Vercel.' }, { status: 500 });
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

    const data = await apiRes.json();

    if (!apiRes.ok) {
      throw new Error(`Google API Error (${apiRes.status}): ${JSON.stringify(data)}`);
    }

    const candidate = data.candidates?.[0];
    const textResponse = candidate?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error('La respuesta de la IA llegó vacía.');
    }

    const jsonMatch = textResponse.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!jsonMatch) {
      throw new Error('No se encontró un JSON válido en la respuesta.');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error crítico en parse-syllabus:', error);
    return NextResponse.json({ error: `Error del servidor: ${error.message || 'Desconocido'}` }, { status: 500 });
  }
}