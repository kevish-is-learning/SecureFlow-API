/**
 * Seeds the database with a default admin and a demo user.
 * Run with: `npm run db:seed`
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const userPassword = await bcrypt.hash('User@12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@secureflow.dev' },
    update: {},
    create: {
      email: 'admin@secureflow.dev',
      password: adminPassword,
      name: 'SecureFlow Admin',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@secureflow.dev' },
    update: {},
    create: {
      email: 'user@secureflow.dev',
      password: userPassword,
      name: 'Demo User',
      role: 'USER',
      tasks: {
        create: [
          { title: 'Welcome to SecureFlow', description: 'Explore the API.' },
          { title: 'Try creating a task', description: 'Use the dashboard.' },
        ],
      },
    },
  });

  console.log('Seed complete:');
  console.log(' - Admin:', admin.email, '/ Admin@12345');
  console.log(' - User :', user.email, '/ User@12345');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
