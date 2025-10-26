// app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { sql, type QueryResult } from '@vercel/postgres';
import { InvoicesTable } from '@/app/lib/definitions';
import auth from '@/auth';

const ITEMS_PER_PAGE = 6;

async function fetchFilteredInvoices(
  query: string,
  currentPage: number
): Promise<InvoicesTable[]> {
  // noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // If there's a search term, include a WHERE clause; otherwise omit it
  let invoicesResult: QueryResult<InvoicesTable>;
  if (query) {
    invoicesResult = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset}
    `;
  } else {
    invoicesResult = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset}
    `;
  }


  return invoicesResult.rows;
}

async function fetchInvoicesPages(query: string): Promise<number> {
  // noStore();

  // If there's a search term, include a WHERE clause; otherwise omit it
  let countResult: QueryResult<{ count: string }>;
  if (query) {
    countResult = await sql`
      SELECT COUNT(*) FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
    `;
  } else {
    countResult = await sql`
      SELECT COUNT(*) FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
    `;
  }

  // simulate latency (remove in production)
  await new Promise((r) => setTimeout(r, 3000));

  const totalCount = Number(countResult.rows[0].count);
  return Math.ceil(totalCount / ITEMS_PER_PAGE);
}

// GET handler to fetch invoices with pagination and optional filtering
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const page = Number(searchParams.get('page') || '1');

  try {
    const [invoices, totalPages] = await Promise.all([
      fetchFilteredInvoices(query, page),
      fetchInvoicesPages(query),
    ]);
    return NextResponse.json({ invoices, totalPages });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST handler remains unchanged...
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { customerId, amount, status } = await request.json();
    console.log({ customerId, amount, status });
    if (!customerId || amount === undefined || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const amountInCents = amount * 100;
    const date = new Date().toISOString().slice(0, 10);
    const result = await sql`
      INSERT INTO invoices (customer_id, user_id, amount, status, date)
      VALUES (${customerId}, ${userId},${amountInCents}, ${status}, ${date})
      RETURNING id, customer_id, amount, status, date
    `;
    const newInvoice = {
      ...result.rows[0],
      amount: result.rows[0].amount / 100,
    };
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (err) {
    console.error('Error creating invoice:', err);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
