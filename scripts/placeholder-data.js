const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'Naje',
    email: 'naje@nextmail.com',
    password: '123456',
    image_url: '',
  },
  {
    id: '320444b2-3111-4871-9433-abc4b6a6442a',
    name: 'Alex',
    email: 'alex@nextmail.com',
    password: '123456',
    image_url: '',
  },
  {
    id: '520544b2-1222-4471-7855-fec4b6a1111a',
    name: 'Sam',
    email: 'sam@nextmail.com',
    password: '123456',
    image_url: '',
  },
  {
    id: '210544b2-1333-4171-9655-def4b6a6442a',
    name: 'Jordan',
    email: 'jordan@nextmail.com',
    password: '123456',
    image_url: '',
  },
  {
    id: 'e4e7f2b9-4f1c-4f7a-bc88-fbef892fe8c1',
    name: 'Riley',
    email: 'riley@nextmail.com',
    password: '123456',
    image_url: '',
  },
];

const customers = [
  {
    id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    name: 'Delba de Oliveira',
    email: 'delba@oliveira.com',
    image_url: '/customers/delba-de-oliveira.png',
    user_id: users[0].id,
  },
  {
    id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    name: 'Lee Robinson',
    email: 'lee@robinson.com',
    image_url: '/customers/lee-robinson.png',
    user_id: users[1].id,
  },
  {
    id: '3958dc9e-737f-4377-85e9-fec4b6a6442a',
    name: 'Hector Simpson',
    email: 'hector@simpson.com',
    image_url: '/customers/hector-simpson.png',
    user_id: users[2].id,
  },
  {
    id: '50ca3e18-62cd-11ee-8c99-0242ac120002',
    name: 'Steven Tey',
    email: 'steven@tey.com',
    image_url: '/customers/steven-tey.png',
    user_id: users[3].id,
  },
  {
    id: '3958dc9e-787f-4377-85e9-fec4b6a6442a',
    name: 'Steph Dietz',
    email: 'steph@dietz.com',
    image_url: '/customers/steph-dietz.png',
    user_id: users[4].id,
  },
];

const invoices = [
  {
    customer_id: customers[0].id,
    user_id: users[0].id,
    amount: 15795,
    status: 'pending',
    date: '2022-12-06',
  },
  {
    customer_id: customers[1].id,
    user_id: users[1].id,
    amount: 20348,
    status: 'pending',
    date: '2022-11-14',
  },
  {
    customer_id: customers[4].id,
    user_id: users[4].id,
    amount: 3040,
    status: 'paid',
    date: '2022-10-29',
  },
  {
    customer_id: customers[3].id,
    user_id: users[3].id,
    amount: 44800,
    status: 'paid',
    date: '2023-09-10',
  },
  {
    customer_id: customers[2].id,
    user_id: users[2].id,
    amount: 34577,
    status: 'pending',
    date: '2023-08-05',
  },
];

const revenue = [];

const baseMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

users.forEach((user, userIndex) => {
  baseMonths.forEach((month, monthIndex) => {
    // Vary revenue using user and month index
    const base = 2000 + monthIndex * 100; // Increases with month
    const variance = (userIndex + 1) * 150; // Increases with user
    const generatedRevenue = base + variance;

    revenue.push({
      month,
      revenue: generatedRevenue,
      user_id: user.id,
    });
  });
});


module.exports = {
  users,
  customers,
  invoices,
  revenue,
};
