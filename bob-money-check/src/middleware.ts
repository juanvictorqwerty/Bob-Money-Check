import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export default async function middleware(request: NextRequest) {
    const authToken = request.cookies.get('authToken')?.value;
    const { pathname } = request.nextUrl;

    const protectedRoutes = ['/', '/Account'];
    const isProtectedRoute = protectedRoutes.includes(pathname);
    
    const authRoutes = ['/auth/login', '/auth/signUPnormal'];
    const isAuthRoute = authRoutes.includes(pathname);

  // No token + accessing protected route → redirect to login
    if (!authToken && isProtectedRoute) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

  // Has token → call API to validate
    if (authToken) {
        try {
        const response = await fetch(new URL('/api/checkauth', request.url), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authToken }),
        });

        const data = await response.json();

      // API unreachable or server error (offline)
        if (!response.ok && response.status === 503) {
            if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/noInternet', request.url));
            }
        }

      // Token invalid
        if (!data.valid && isProtectedRoute) {
            const redirectResponse = NextResponse.redirect(new URL('/auth/login', request.url));
            redirectResponse.cookies.delete('authToken');
            return redirectResponse;
        }

      // Already logged in + accessing auth page → redirect to home
        if (data.valid && isAuthRoute) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    } catch (error) {
      // Network error - offline
        console.error('Auth check failed:', error);
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/noInternet', request.url));
        }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
