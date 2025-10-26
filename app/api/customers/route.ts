import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatCurrency } from '@/app/lib/utils';
import { CustomerField, CustomersTableType } from '@/app/lib/definitions';
import { unstable_noStore as noStore} from 'next/cache';
import { auth } from '@/auth';


async function fetchCustomers(userId: string) {
    noStore();
  
    try {
      const data = await sql<CustomerField>`
        SELECT
          id,
          name, 
          email, 
          image_url
        FROM customers
        WHERE customers.user_id = ${userId}
        ORDER BY name ASC
      `;
  
      const customers = data.rows;
      return customers;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch all customers.');
    }
  }
  
  export async function fetchFilteredCustomers(query: string, userId: string) {
    noStore();
  
    try {
      const data = await sql<CustomersTableType>`
          SELECT
            customers.id,
            customers.name,
            customers.email,
            customers.image_url,
            COUNT(invoices.id) AS total_invoices,
            SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
            SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
          FROM customers
          LEFT JOIN invoices ON customers.id = invoices.customer_id
          WHERE
            (customers.name ILIKE ${`%${query}%`} OR
            customers.email ILIKE ${`%${query}%`}) AND
            customers.user_id = ${userId}

          GROUP BY customers.id, customers.name, customers.email, customers.image_url
          ORDER BY customers.name ASC
        `;
  
      const customers = data.rows.map((customer) => ({
        ...customer,
        total_pending: formatCurrency(customer.total_pending),
        total_paid: formatCurrency(customer.total_paid),
      }));
  
      return customers;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch customer table.');
    }
  }
  
// GET handler to fetch customers with optional filtering
export async function GET(request: Request) {
  const session = await auth();
      
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  
  try {
    // if (query) {
    const customers = await fetchFilteredCustomers(query, userId);
    return NextResponse.json({ customers }, { status: 200 });
    // } else {
    //   const customers = await fetchCustomers(userId);
      
    //   return NextResponse.json(customers, { status: 200 });
    // }
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST handler to create a new customer
export async function POST(request: Request) {
  try {
    const session = await auth();
      
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    const { name, email, image_url } = await request.json();
    
    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required fields' },
        { status: 400 }
      );
    }
    
    // Check if customer with this email already exists
    const existingCustomer = await sql`
      SELECT id FROM customers WHERE email = ${email}
    `;
    
    if (existingCustomer.rowCount! > 0) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new customer
    const result = await sql`
      INSERT INTO customers (name, email, image_url, user_id)
      VALUES (${name}, ${email}, ${image_url || ''}, ${userId})
      RETURNING id, name, email, image_url
    `;
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}