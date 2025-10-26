import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import auth from '@/auth';
import type { User } from '@/app/lib/definitions';

// Constants
const USERS_TABLE = 'users';

// Database service layer
const UserService = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT *
      FROM users
      WHERE email = ${email}
    `;
    return result.rows[0] as User || null;
  },

  async checkEmailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const query = excludeUserId  ? sql`SELECT 1 FROM users WHERE email = ${email} AND id != ${excludeUserId} LIMIT 1`
      : sql`SELECT 1 FROM users WHERE email = ${email} LIMIT 1`;
    
    const result = await query;
    return result.rowCount! > 0;
  },

  async updateUser(
    userId: string, 
    updates: { name?: string; email?: string; image_url?: string }
  ): Promise<User | null> {
    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) {
      fields.push('name');
      values.push(updates.name);
    }
    
    if (updates.email !== undefined) {
      fields.push('email');
      values.push(updates.email);
    }
    
    if (updates.image_url !== undefined) {
      fields.push('image_url');
      values.push(updates.image_url);
    }
    
    if (fields.length === 0) return null;
    
    const setClause = fields.map((f, i) => `${f} = $${i+1}`).join(', ');
    values.push(userId);
    
    const query = `
      UPDATE users
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING id, name, email, image_url, created_at, updated_at;
    `;

    const result = await sql.query(query, values);
    return result.rows[0] as User || null;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM users
      WHERE id = ${userId}
    `;
    return result.rowCount! > 0;
  }
};

// Validation schemas
const querySchema = z.object({ 
  email: z.string().email('Invalid email format') 
});

const updateSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  name: z.string().min(1, 'Name cannot be empty').optional(),
  email: z.string().email('Invalid email format').optional(),
  image_url: z.string().url('Invalid image URL').optional()
});

const deleteSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

// Authentication middleware
const withAuth = (handler: Function) => async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handler(request, session);
};

// GET: fetch user by email
export const GET = withAuth(async (request: NextRequest, session: any) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  const parsed = querySchema.safeParse({ email });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid email parameter' },
      { status: 400 }
    );
  }

  const user = await UserService.findByEmail(parsed.data.email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
});

// PUT: update user's profile
export const PUT = withAuth(async (request: NextRequest, session: any) => {
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { userId, name, email, image_url } = parsed.data;
  
  // Authorization check
  if (session.user.id !== userId) {
    return NextResponse.json(
      { error: 'Cannot update other user profile' },
      { status: 403 }
    );
  }

  // Check for email conflicts if updating email
  if (email && await UserService.checkEmailExists(email, userId)) {
    return NextResponse.json(
      { error: 'Email already in use' },
      { status: 409 }
    );
  }

  // Check for at least one field to update
  if (!name && !email && !image_url) {
    return NextResponse.json(
      { error: 'No fields provided for update' },
      { status: 400 }
    );
  }

  const updatedUser = await UserService.updateUser(userId, { name, email, image_url });
  if (!updatedUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(
    { message: 'Profile updated successfully', user: updatedUser }
  );
});

// DELETE: delete user account
export const DELETE = withAuth(async (request: NextRequest, session: any) => {
  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { userId } = parsed.data;
  
  // Authorization check
  if (session.user.id !== userId) {
    return NextResponse.json(
      { error: 'Cannot delete other user accounts' },
      { status: 403 }
    );
  }

  const deleted = await UserService.deleteUser(userId);
  if (!deleted) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(
    { message: 'Account deleted successfully' }
  );
});