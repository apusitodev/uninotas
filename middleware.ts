import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // 1. Permitir acceso libre a la página de mantenimiento y a la raíz (donde está el login)
  if (path.startsWith('/maintenance') || path === '/') {
    return response;
  }

  // 2. Tu correo de administrador/tester
  const MY_ADMIN_EMAIL = 'paubassols@gmail.com'; 

  // 3. Si eres tú, te dejamos pasar a cualquier parte
  if (user && user.email === MY_ADMIN_EMAIL) {
    return response;
  }

  // 4. Para cualquier otro usuario que intente entrar al dashboard u otras páginas, redirigir a mantenimiento
  url.pathname = '/maintenance';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};