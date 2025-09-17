import { clerkMiddleware } from "@clerk/nextjs/server"

// Enable Clerk middleware across app routes so auth() can be used server-side
export default clerkMiddleware()

// Match all routes except static files and Next internals; include API routes
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}


