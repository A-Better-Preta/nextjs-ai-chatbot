import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 1. Define which routes are "Public" (accessible without logging in)
// Usually, you want the landing page or login page to be public.
const isPublicRoute = createRouteMatcher([
  '/login(.*)', 
  '/register(.*)',
  '/api/public(.*)',
  '/ping'
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // 2. Handle the "Ping" for Playwright/Health checks
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // 3. Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // 4. Redirect logged-in users away from auth pages
  const { userId } = await auth();
  if (userId && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};