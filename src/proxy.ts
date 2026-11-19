import { NextResponse, type NextRequest } from "next/server";

// Cheap gate: bounce visitors without a session cookie away from the app.
// Real session validation happens on the server in requireUser().
export function proxy(request: NextRequest) {
  if (!request.cookies.has("fl_session")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/forms/:path*", "/account/:path*", "/preview/:path*"],
};
