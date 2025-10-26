import NextAuth from 'next-auth';
import { authOptions } from './auth.config';

// Define types for better type safety
import { Session } from 'next-auth';

// Define custom user type
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  image_url?: string | null;
}

// Extend the Session type to include token
export interface CustomSession extends Session {
  token?: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image_url?: string | null;
  };
}

// Create the auth object with handlers
export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);

// For compatibility with older code - optional default export
export default auth;