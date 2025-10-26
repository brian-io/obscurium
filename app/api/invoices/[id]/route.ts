import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore} from 'next/cache';
import { InvoiceForm } from '@/app/lib/definitions';
import auth from '@/auth';


async function fetchInvoiceById(id: string) {
    noStore();
  
    try {
      
      const data = await sql<InvoiceForm>`
        SELECT
          invoices.id,
          invoices.customer_id,
          invoices.amount,
          invoices.status
        FROM invoices
        WHERE invoices.id = ${id};
      `;
  
      const invoice = data.rows.map((invoice) => ({
        ...invoice,
        // Convert amount from cents to dollars
        amount: invoice.amount / 100,
      }));
  
      return invoice[0];
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch invoice.');
    }
  }

// GET handler to fetch a specific invoice by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = params.id;

  try {
    const invoice = await fetchInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT handler to update an invoice
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const id = params.id;

  const userId = session.user.id;
  
  try {
    const { customer_id, amount, status } = await request.json();
    
    // Validate input
    if (!customer_id || amount === undefined || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Convert amount to cents for database storage
    const amountInCents = amount * 100;
    const date = new Date().toISOString().slice(0, 10);

    // Update invoice in database
    const result = await sql`
      UPDATE invoices
      SET 
        customer_id = ${customer_id},
         user_id = ${userId},
        amount = ${amountInCents},
        status = ${status}, 
        date = ${date}
      WHERE id = ${id}
      RETURNING id, customer_id, amount, status, date
    `;
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Convert amount back to dollars for response
    const updatedInvoice = {
      ...result.rows[0],
      amount: result.rows[0].amount / 100
    };
    
    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove an invoice
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
        
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const id = params.id;
  
  try {
    const result = await sql`
      DELETE FROM invoices
      WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Invoice deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}