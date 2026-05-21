import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Important:
  // Guest mode should hide public login UI only.
  // It must never block /admin or /api/admin.
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static
     * - _next/image
     * - favicon/icon files
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|favicon-32.png|favicon-64.png|apple-touch-icon.png|icon-192.png|icon-512.png|site.webmanifest|placeholder.svg).*)",
  ],
};