import Credentials from "next-auth/providers/credentials";
import { getUser } from './app/lib/data'
export const authConfig = {

  providers: [
		Credentials({
			credentials: {
				email: {  },
				password: { },
			},

			async authorize(credentials){

				const user = await getUser(credentials.email)
        
        if (!user) return null
        return user

			}
		}),
	],

  pages: {
    signIn: '/login',
  },

	callbacks: {
    async authorized({ auth, request: { nextUrl } }) {

      const isLoggedIn = !!auth?.user;

      console.log("isLoggedIn", isLoggedIn);

      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {

        if (isLoggedIn) return true;

        return false; 

      } else if (isLoggedIn) {
       
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },


  },
  
  
	
  

} ;