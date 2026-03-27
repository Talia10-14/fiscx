import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (be careful in production!)
  // await prisma.user.deleteMany({});

  // Create test admin
  const adminUser = await prisma.user.upsert({
    where: { phone: '+22994000000' },
    update: {},
    create: {
      phone: '+22994000000',
      pin: bcrypt.hashSync('1234', 10),
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'FiscX',
      email: 'admin@fiscx.bj',
      admin: {
        create: {
          permissions: ['all'],
        },
      },
    },
  });

  console.log('✅ Admin user created:', adminUser.phone);

  // Create test merchant
  const merchantUser = await prisma.user.upsert({
    where: { phone: '+22993001234' },
    update: {},
    create: {
      phone: '+22993001234',
      pin: bcrypt.hashSync('5678', 10),
      role: 'MERCHANT',
      firstName: 'Afi',
      lastName: 'Koudossou',
      email: 'afi@example.com',
      merchant: {
        create: {
          businessName: 'Textiles Koudossou',
          businessType: 'textiles',
          businessLocation: 'Marché Dantokpa, Cotonou',
          taxRegime: 'TS',
          monthlyCAAvg: 1500000,
        },
      },
    },
  });

  console.log('✅ Merchant user created:', merchantUser.phone);

  // Create test banker
  const bankerUser = await prisma.user.upsert({
    where: { phone: '+22991234567' },
    update: {},
    create: {
      phone: '+22991234567',
      pin: bcrypt.hashSync('banker123', 10),
      role: 'BANKER',
      firstName: 'Jean',
      lastName: 'Becker',
      email: 'jean@boa.bj',
      banker: {
        create: {
          bankName: 'BOA Bénin',
          position: 'Loan Officer',
        },
      },
    },
  });

  console.log('✅ Banker user created:', bankerUser.phone);

  // Create default config
  await prisma.config.upsert({
    where: { key: 'TS_RATE_2026' },
    update: { value: '0.05' },
    create: {
      key: 'TS_RATE_2026',
      value: '0.05',
      description: 'Taxe Synthétique rate for 2026 (5%)',
    },
  });

  console.log('✅ Configuration created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
