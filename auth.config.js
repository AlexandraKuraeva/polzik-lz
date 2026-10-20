import Credentials from "next-auth/providers/credentials";
import { fetchUserByEmail } from './app/lib/data'
import { normalizeEmail } from './app/lib/utils'

export const authConfig = {
	providers: [
		Credentials({
			credentials: {
				email: {},
				password: {},
			},

			// Ошибки из authorize next-auth v5 превращает в CallbackRouteError (error=Configuration),
			// поэтому при неверных данных возвращаем null — это даёт обычный CredentialsSignin
			async authorize(credentials) {
				const email = normalizeEmail(credentials?.email)
				const password = String(credentials?.password ?? '')

				if (!email || !password) return null

				let user
				try {
					user = await fetchUserByEmail(email)
				} catch (error) {
					console.error('[auth] не удалось получить пользователя из БД:', error)
					return null
				}

				if (!user) {
					console.warn('[auth] пользователь не найден:', email)
					return null
				}

				if (password !== user.password) {
					console.warn('[auth] неверный пароль для:', email)
					return null
				}

				return {
					id: user.id,
					email: user.email,
					role: user.role,
					name: user.name,
				}
			},
		}),
	],

	pages: {
		signIn: '/login',
	},

	callbacks: {
		async authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user

			const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')

			if (isOnDashboard) {
				if (isLoggedIn) return true

				return false
			}
			return true
		},

		async jwt({ token, user }) {
     
			if (user) {
				token.id = user.id
				token.role = user.role
				token.name = user.name
			}

		
			return token
		},

		async session({ session, token }) {

			if (token) {
				session.user.id = token.id
				session.user.role = token.role
				session.user.name = token.name
			}

			return session
		},
	},
} ;