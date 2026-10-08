import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'calendar';
    const textContent = (formData.get('textContent') as string) || '';

    let fileBase64 = '';
    let mimeType = 'application/pdf';

    if (file) {
      // Validamos que el archivo no supere los 4MB para evitar cortes en Vercel
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ 
          error: 'El archivo PDF es demasiado pesado para subirlo de golpe. Prueba con un PDF más ligero o recorta las páginas clave.' 
        }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBase64 = Buffer.from(arrayBuffer).toString('base64');
      mimeType = file.type || 'application/pdf';
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
        { inlineData: { mimeType: mimeType, data: fileBase64 } },
        { text: prompt }
      ];
    } else {
      parts = [{ text: `${prompt}\n\nTexto:\n${textContent}` }];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'La variable GEMINI_API_KEY no está configurada en Vercel.' }, { status: 500 });
    }

    // Modelos estables oficiales de Google ordenados en cascada para evitar fallos
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    let parsedData = null;
    let lastError = '';

    for (const modelName of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      try {
        const apiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' }
          }),
        });

        if (apiRes.ok) {
          const resJson = await apiRes.json();
          const textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            const jsonMatch = textResponse.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
              break; // ¡Éxito! Salimos del bucle
            }
          }
        } else {
          const errText = await apiRes.text();
          lastError = `Modelo ${modelName} error (${apiRes.status}): ${errText}`;
          console.warn(lastError);
        }
      } catch (e: any) {
        lastError = `Error de red con ${modelName}: ${e.message}`;
        console.warn(lastError);
      }
    }

    if (!parsedData) {
      return NextResponse.json({ error: `No se pudo procesar el archivo. Detalle: ${lastError}` }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error crítico en parse-syllabus:', error);
    return NextResponse.json({ error: `Error del servidor: ${error.message || 'Desconocido'}` }, { status: 500 });
  }
}