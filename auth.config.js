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
        console.log(user.id, user.name );
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        };

			},

     
		}),
	],

  pages: {
    signIn: '/login',
  },

	callbacks: {
     async authorized({ auth, request: { nextUrl } }) {

       const isLoggedIn = !!auth?.user;

       const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

       if (isOnDashboard) {

         if (isLoggedIn) return true;

         return false; 

       }
       return true;
     },

    async jwt({ token, user }) {
      console.log(user);
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }

      console.log("token", token);
      return token;
    },

    async session({ session, token }) {
      console.log("session", session);
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name;
      return session;
    }


  },
  
  
	
  

} ;