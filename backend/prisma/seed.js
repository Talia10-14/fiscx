import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  // VIBE Step 3 exact seed values
  const adminPin = bcrypt.hashSync('000000', 12);
  const merchantPin = bcrypt.hashSync('5678', 12);
  const bankerPin = bcrypt.hashSync('1234', 12);

  const adminUser = await prisma.user.upsert({
    where: { phone: '+22901000001' },
    update: {
      pin: adminPin,
      pinHash: adminPin,
      role: 'ADMIN',
      kycStatus: 'PENDING',
    },
    create: {
      phone: '+22901000001',
      pin: adminPin,
      pinHash: adminPin,
      role: 'ADMIN',
      kycStatus: 'PENDING',
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
    update: {
      pin: merchantPin,
      pinHash: merchantPin,
      role: 'MERCHANT',
      kycStatus: 'VERIFIED',
    },
    create: {
      phone: '+22993001234',
      pin: merchantPin,
      pinHash: merchantPin,
      role: 'MERCHANT',
      kycStatus: 'VERIFIED',
      firstName: 'Afi',
      lastName: 'Koudossou',
      businessName: 'Textiles Koudossou',
      email: 'afi@example.com',
      merchant: {
        create: {
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
    where: { phone: '+22901000002' },
    update: {
      pin: bankerPin,
      pinHash: bankerPin,
      role: 'BANKER',
      kycStatus: 'VERIFIED',
    },
    create: {
      phone: '+22901000002',
      pin: bankerPin,
      pinHash: bankerPin,
      role: 'BANKER',
      kycStatus: 'VERIFIED',
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

  // VIBE Step 3 - TaxRule exact values for 2026 (BJ)
  const year = 2026;
  await prisma.taxRule.deleteMany({ where: { countryCode: 'BJ', year } });
  await prisma.taxRule.createMany({
    data: [
      {
        countryCode: 'BJ',
        country: 'BJ',
        year,
        regime: 'TS',
        regimeName: 'Taxe Synthétique',
        label: 'Taxe Synthétique',
        minAnnualCA: 0,
        maxAnnualCA: 20_000_000,
        caMin: 0,
        caMax: 20_000_000,
        fixedAmount: 50_000,
        notes: 'Seed VIBE Step 3',
      },
      {
        countryCode: 'BJ',
        country: 'BJ',
        year,
        regime: 'RRS',
        regimeName: 'Réel Simplifié',
        label: 'Réel Simplifié',
        minAnnualCA: 20_000_001,
        maxAnnualCA: 100_000_000,
        caMin: 20_000_001,
        caMax: 100_000_000,
        rate: 0.05,
        rrsRatePercent: 5,
        notes: 'Seed VIBE Step 3',
      },
      {
        countryCode: 'BJ',
        country: 'BJ',
        year,
        regime: 'NORMAL',
        regimeName: 'Réel Normal',
        label: 'Réel Normal',
        minAnnualCA: 100_000_001,
        maxAnnualCA: 999_999_999,
        caMin: 100_000_001,
        caMax: 999_999_999,
        rate: 0.25,
        notes: 'Seed VIBE Step 3',
      },
    ],
  });
  console.log('✅ Tax rules (BJ) seeded for', year);

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
