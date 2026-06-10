import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) return;
  if (pathname === "/login") {
    if (isLoggedIn) {
      return Response.redirect(new URL("/passages", req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "admin") {
    return Response.redirect(new URL("/passages", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
