import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

const JWT_SECRET = process.env.JWT_SECRET!;

// POST /api/auth
export async function POST(req: NextRequest) {
  try{
  const { email, password, name } = await req.json();


  // Validate input
  if (!name || !email || !password) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  }
  const result = await sql`SELECT * FROM users WHERE email=${email}`;
  const existingUser = result.rows[0];

  if (existingUser) {
    return NextResponse.json(
      { message: 'User already exists with this email' },
      { status: 409 }
    );
  }
  // register flow
  const hashedPassword = await bcrypt.hash(password, 10);
  const regUser = await sql`INSERT INTO users (name, email, password)
                       VALUES (${name}, ${email}, ${hashedPassword}) 
                       RETURNING id, name, email, image_url`;
  const user = regUser.rows[0];

  console.log(user);

  const { password: _, ...userWithoutPassword } = user;

  
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  const res = NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    );
  // set HttpOnly cookie
  res.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
  } catch(error){
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
