import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const studentPasswordHash = await bcrypt.hash('password123', 10);

  await prisma.user.update({
    where: { email: 'admin@aicounsellor.in' },
    data: { passwordHash: adminPasswordHash }
  });
  console.log('Admin password updated to: admin123');

  await prisma.user.update({
    where: { email: 'student@aicounsellor.in' },
    data: { passwordHash: studentPasswordHash }
  });
  console.log('Student password updated to: password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
