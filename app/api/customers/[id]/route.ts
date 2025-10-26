import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';

// GET handler to fetch a specific customer by ID
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
    const result = await sql`
      SELECT 
        c.id, 
        c.name, 
        c.email, 
        c.image_url,
        COUNT(i.id) AS total_invoices,
        SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) AS total_paid
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE c.id = ${id}
      GROUP BY c.id, c.name, c.email, c.image_url
    `;
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Format currency values
    const customer = {
      ...result.rows[0],
      total_pending: result.rows[0].total_pending ? 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.rows[0].total_pending / 100) : 
        '$0.00',
      total_paid: result.rows[0].total_paid ? 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.rows[0].total_paid / 100) : 
        '$0.00'
    };
    
    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT handler to update a customer
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
        
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = params.id;
  
  try {
    const { name, email, image_url } = await request.json();
    
    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required fields' },
        { status: 400 }
      );
    }
    
    // Update customer in database
    const result = await sql`
      UPDATE customers
      SET 
        name = ${name},
        email = ${email},
        image_url = ${image_url || null}
      WHERE id = ${id}
      RETURNING id, name, email, image_url
    `;
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a customer
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
    // Check if customer has invoices
    const invoicesCheck = await sql`
      SELECT id FROM invoices WHERE customer_id = ${id} LIMIT 1
    `;
    
    if (invoicesCheck.rowCount! > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with associated invoices' },
        { status: 400 }
      );
    }
    
    // Delete customer
    const result = await sql`
      DELETE FROM customers
      WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Customer deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}