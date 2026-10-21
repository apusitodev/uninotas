import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@uninotas.app',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const body = await request.json();
    const { userId, title, message, url } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (title, message)' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('push_subscriptions').select('subscription, user_id');

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

    const results = await Promise.allSettled(
      subscriptions.map(async (subRecord) => {
        try {
          const pushSubscription = subRecord.subscription;
          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, userId: subRecord.user_id };
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabaseAdmin
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