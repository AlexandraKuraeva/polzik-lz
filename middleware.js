
import { auth } from "@/auth"
import { NextResponse } from "next/server"



export default auth((req) => {

  const { auth } = req

  const pathname = req.nextUrl.pathname
	
   const isLoggedIn = !!auth?.user

   const userRole = auth?.user?.role

   const isAdminRoute = pathname.startsWith("/dashboard/users")

   const isProtectedRoute = ["/dashboard", "/admin", "/dashboard/users"].some((path) =>

     pathname.startsWith(path)

   )

   if (isProtectedRoute && !isLoggedIn) {

     const loginUrl = new URL("/login", req.url)

     loginUrl.searchParams.set("callbackUrl", pathname)

     return NextResponse.redirect(loginUrl)

   }

  
    if ( isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/unauthorized", req.url)) // или верни 403
    }
   

   return NextResponse.next()

})

// Указываем маршруты, на которые работает middleware
export const config = {

  matcher: [

    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",

  ],
  
}
