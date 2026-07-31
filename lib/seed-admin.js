const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const globalForPrisma = globalThis;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      // update fields if user exists
      name: 'Admin User',
      password: hashedPassword,
      isActive: true,
      role: 'ADMIN',
      updatedAt: new Date(),
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      isActive: true,
      role: 'ADMIN',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Admin user created/updated:', admin.email);

  // Optional: seed sample announcement (kung may Announcement model ka na)
  await seedAnnouncement();
}

async function seedAnnouncement() {
  try {
    const count = await prisma.announcement.count();
    if (count === 0) {
      await prisma.announcement.create({
        data: {
          title: '🎉 Welcome to CENTRA Clinic CMS',
          description: 'You can now manage announcements from the admin panel.',
          status: 'Published',
        },
      });
      console.log('✅ Sample announcement created.');
    } else {
      console.log('ℹ️ Announcements already exist, skipping sample.');
    }
  } catch (error) {
    console.log('ℹ️ Announcement table not yet created, skipping sample seed.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });