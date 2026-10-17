import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

// Configurar web-push con las claves VAPID del servidor
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@uninotas.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, message, url } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (title, message)' },
        { status: 400 }
      );
    }

    let query = supabase.from('push_subscriptions').select('subscription, user_id');

    // Si se especifica un userId, enviamos solo a ese usuario. Si no, enviamos a todos (masiva).
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No hay suscripciones activas encontradas.' });
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-192x192.png',
      url: url || '/dashboard'
    });

    // Enviar las notificaciones a todas las suscripciones encontradas
    const results = await Promise.allSettled(
      subscriptions.map(async (subRecord) => {
        try {
          const pushSubscription = subRecord.subscription;
          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, userId: subRecord.user_id };
        } catch (err: any) {
          // Si la suscripción ya no es válida (ej. el usuario la revocó), podemos limpiarla
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('user_id', subRecord.user_id);
          }
          return { success: false, userId: subRecord.user_id, error: err.message };
        }
      })
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Error al enviar notificaciones push:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}