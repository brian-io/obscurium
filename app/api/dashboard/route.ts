import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import { formatCurrency } from '@/app/lib/utils';
import { LatestInvoiceRaw } from '@/app/lib/definitions';
import { auth } from '@/auth';

/**
 * Fetches dashboard card data for a specific user
 */
export async function fetchCardData(userId: string) {
  noStore();
  try {
    // Optimized to use a single SQL query with better aggregation
    const result = await sql`
      SELECT
        (SELECT COUNT(*) FROM invoices WHERE user_id = ${userId}) AS invoice_count,
        (SELECT COUNT(*) FROM customers WHERE user_id = ${userId}) AS customer_count,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paid_total,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pending_total
      FROM invoices
      WHERE user_id = ${userId};
    `;
    
    const row = result.rows[0];
    
    return {
      numberOfInvoices: Number(row.invoice_count ?? 0),
      numberOfCustomers: Number(row.customer_count ?? 0),
      totalPaidInvoices: formatCurrency(row.paid_total),
      totalPendingInvoices: formatCurrency(row.pending_total)
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data');
  }
}

/**
 * Fetches latest invoices for a specific user
 */
export async function fetchLatestInvoices(userId: string) {
  noStore();
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT 
        i.amount, 
        c.name, 
        c.image_url, 
        c.email, 
        i.id
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = ${userId}
      ORDER BY i.date DESC
      LIMIT 5;
    `;
    
    return data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices');
  }
}

/**
 * API handler for fetching dashboard data
 */
export async function GET(request: Request) {
  noStore();
  
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Fetch dashboard data in parallel for better performance
    const [cardData, latestInvoices] = await Promise.all([
      fetchCardData(userId),
      fetchLatestInvoices(userId)
    ]);
      
    return NextResponse.json({
      cardData,
      latestInvoices
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' }, 
      { status: 500 }
    );
  }
}