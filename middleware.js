
import { auth } from "@/auth"
import { NextResponse } from "next/server"



export default auth((req) => {
  const { auth } = req
	
   const isLoggedIn = !!auth?.user
   const isProtectedRoute = ["/dashboard", "/admin"].some((path) =>
     req.nextUrl.pathname.startsWith(path)
   )

   if (isProtectedRoute && !isLoggedIn) {
     const loginUrl = new URL("/login", req.url)
     loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
     return NextResponse.redirect(loginUrl)
   }

   return NextResponse.next()
})

// Указываем маршруты, на которые работает middleware
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
