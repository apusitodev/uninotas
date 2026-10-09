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
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json({ 
          error: 'LIMIT_EXCEEDED',
          message: 'El archivo PDF es demasiado pesado. Por favor, introduce los datos manualmente.' 
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
        Analiza el documento adjunto de la guía académica u horario de asignaturas. 
        Devuelve un JSON estrictamente con la clave "subjects" (array de objetos) que contenga:
        - name: Nombre de la asignatura (string)
        - code: Código o siglas (string)
        - credits: Créditos ECTS (número, ej: 6)
        - period_type: "semester_1", "semester_2", "quarter_1", "quarter_2", "quarter_3", o "full_year"
        - slots: Array de bloques horarios con { "day": número del 1 al 5, "startHour": "HH:MM", "endHour": "HH:MM", "room": string }
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
      return NextResponse.json({ error: 'CONFIG_ERROR', message: 'API Key no configurada.' }, { status: 500 });
    }

    const modelName = 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // Sistema de reintentos automáticos (10 intentos)
    let apiRes = null;
    let maxRetries = 10;
    let delay = 2000;
    let resText = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      apiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { 
            responseMimeType: 'application/json',
            maxOutputTokens: 8192
          }
        }),
      });

      resText = await apiRes.text();

      // Si es un error 429 (cuota excedida), no tiene sentido reintentar, salimos al momento
      if (apiRes.status === 429 || resText.includes('RESOURCE_EXHAUSTED') || resText.includes('quota')) {
        return NextResponse.json({ 
          error: 'QUOTA_EXCEEDED', 
          message: 'Se ha alcanzado el límite temporal de consultas a la inteligencia artificial.' 
        }, { status: 429 });
      }

      if (apiRes.ok) {
        break; // ¡Conseguido con éxito!
      }

      console.warn(`Intento ${attempt} fallido (Status ${apiRes.status}):`, resText);

      if (apiRes.status === 503 && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay += 2000; // Incrementa la espera progresiva
      }
    }

    if (!apiRes || !apiRes.ok) {
      return NextResponse.json({ 
        error: 'AI_UNAVAILABLE', 
        message: 'Los servidores de IA están experimentando alta demanda o la cuota se ha agotado.' 
      }, { status: 503 });
    }

    const resJson = JSON.parse(resText);
    const textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('La respuesta de la IA llegó vacía.');
    }

    let cleanedText = textResponse.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const jsonMatch = cleanedText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!jsonMatch) {
      throw new Error('No se encontró un JSON válido en la respuesta.');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error crítico en parse-syllabus:', error);
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message || 'Error desconocido' }, { status: 500 });
  }
}