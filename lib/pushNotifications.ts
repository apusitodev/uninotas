import { supabase } from '@/lib/supabase';

const convertedVapidKey = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return null;
  }

  try {
    // 1. Registrar el Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // 2. Pedir permisos de notificación
    const permissionResult = await window.Notification.requestPermission();
    if (permissionResult !== 'granted') {
      throw new Error('Permiso de notificaciones denegado por el usuario.');
    }

    // 3. Obtener la clave pública VAPID de las variables de entorno
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error('La clave VAPID pública no está configurada.');
    }

    // 4. Suscribirse al Push Manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey(vapidPublicKey),
    });

    // 5. Guardar la suscripción en Supabase
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado.');
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        subscription: subscription.toJSON(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      throw error;
    }

    console.log('¡Suscripción a notificaciones push guardada con éxito!');
    return subscription;
  } catch (error) {
    console.error('Error al suscribir al usuario a las push:', error);
    throw error;
  }
}