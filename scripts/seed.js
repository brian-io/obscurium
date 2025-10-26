const { db } = require('@vercel/postgres');
const {
  users,
  customers,
  invoices,
  revenue,
} = require('./placeholder-data.js');
const bcrypt = require('bcrypt');

async function resetTables(client) {
  await client.sql`
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS revenue;
    DROP TABLE IF EXISTS users;
  `;
}

async function createTables(client) {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // Users table
  await client.sql`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      image_url TEXT
    );
  `;

  // Customers table
  await client.sql`
    CREATE TABLE customers (
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) ,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  // Invoices table
  await client.sql`
    CREATE TABLE invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  // Revenue table
  await client.sql`
    CREATE TABLE revenue (
      month VARCHAR(4) PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      revenue INT NOT NULL
    );
  `;
}

async function seedUsers(client) {
  const inserted = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client.sql`
        INSERT INTO users (id, name, email, password, image_url)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword}, ${user.image_url})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );

  console.log(`Seeded ${inserted.length} users`);
}

async function seedCustomers(client) {
  const inserted = await Promise.all(
    customers.map((customer) =>
      client.sql`
        INSERT INTO customers (id, name, email, image_url, user_id)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url}, ${customer.user_id})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  console.log(`Seeded ${inserted.length} customers`);
}

async function seedInvoices(client) {
  const inserted = await Promise.all(
    invoices.map((invoice) =>
      client.sql`
        INSERT INTO invoices (customer_id, user_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.user_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  console.log(`Seeded ${inserted.length} invoices`);
}

async function seedRevenue(client) {
  const inserted = await Promise.all(
    revenue.map((rev) =>
      client.sql`
        INSERT INTO revenue (month, revenue, user_id)
        VALUES (${rev.month}, ${rev.revenue}, ${rev.user_id})
        ON CONFLICT (month) DO NOTHING;
      `
    )
  );

  console.log(`Seeded ${inserted.length} revenue`);
}

async function main() {
  const client = await db.connect();
  try {
    // Reset and create tables only once
    await resetTables(client);
    await createTables(client);

    // Seed all tables
    await seedUsers(client);
    await seedCustomers(client);
    await seedInvoices(client);
    await seedRevenue(client);

  } finally {
    // Always release the client connection
    await client.release();
  }
}

main().catch((err) => {
  console.error('Error seeding database:', err);
});
