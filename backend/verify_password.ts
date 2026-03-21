import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!admin) {
    console.log('Admin user not found.');
    return;
  }
  
  const isMatch = await bcrypt.compare('admin123', admin.password);
  console.log('Password "admin123" matches:', isMatch);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
