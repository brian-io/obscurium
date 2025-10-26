import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import auth from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user ID from the URL parameter
    const userId = params.id;
    
    // Check if the user is authenticated and authorized
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user details from the database
    const result = await sql`
      SELECT id, name, email, image_url 
      FROM users 
      WHERE id = ${userId}
    `;
    
    // If user not found
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return user data
    const user = result.rows[0];
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image_url: user.image_url,
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}