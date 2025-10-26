// auth.config.ts - Updated to include image_url
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import { User } from './app/lib/definitions';

// Zod schema for credentials validation
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const authOptions: NextAuthConfig = {
  // Custom auth pages
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Auth providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error('Validation error:', parsed.error.flatten());
          return null;
        }

        const { email, password } = parsed.data;
        const result = await sql`SELECT * FROM users WHERE email=${email}`;
        const user = result.rows[0] as User;
        
        if (!user) {
          console.warn('No user found with those credentials');
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          console.warn('Invalid password for user:', email);
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image_url: user.image_url, // Include image_url in the return
        };
      },
    }),
  ],

  // JWT and session callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image_url = user.image; // Add image_url to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        // Add image_url to the session user object
        session.user.image = token.image_url as string || null;
      }
      return session;
    },
  },

  // Secret for JWT signing
  secret: process.env.NEXTAUTH_SECRET,
};