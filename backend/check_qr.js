const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qrToSearch = "Tgxs9meGG";
  console.log(`Searching for: ${qrToSearch}`);
  const user = await prisma.user.findFirst({
    where: { qrCode: qrToSearch }
  });
  console.log('User found:', user);
  
  const allInspectors = await prisma.user.findMany({
    where: { role: 'INSPECTOR' },
    select: { id: true, email: true, qrCode: true, isActive: true }
  });
  console.log('All Inspectors:', allInspectors);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
