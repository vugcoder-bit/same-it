import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:', users);
  
  const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (admin) {
    console.log('Admin user found.');
  } else {
    console.log('Admin user NOT found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
