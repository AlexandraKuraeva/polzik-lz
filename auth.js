

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

import { z } from 'zod'



export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)