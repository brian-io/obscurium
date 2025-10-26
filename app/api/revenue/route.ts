import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { sql } from '@vercel/postgres';
import auth from '@/auth';

async function fetchRevenue(userId: string) {
  noStore();

  try {
    const data = await sql`
      SELECT * FROM revenue
      WHERE user_id = ${userId}
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const revenue = await fetchRevenue(session.user.id);
    return NextResponse.json(revenue, { status: 200 });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
