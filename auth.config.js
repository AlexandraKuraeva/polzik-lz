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

        if(!credentials?.email || !credentials?.password){
          throw new Error("Email и пароль обязательны");
        }

				const user = await getUser(credentials.email)
        
        if (!user) {
          throw new Error("Пользователь не найден");
        }

        if (credentials.password !== user.password) {
          throw new Error("Неверный пароль");
        }
        
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