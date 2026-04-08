import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public: home, auth pages, post list, post detail (not edit/new)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/sso-callback(.*)',
  '/posts',
  '/posts/:id(\\d+)',
  '/api/webhooks/(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
