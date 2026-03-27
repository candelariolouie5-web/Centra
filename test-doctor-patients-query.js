import { prisma } from '@/lib/prisma';

async function testQueries() {
  try {
    console.log('1. Simple appointments findMany()');
    await prisma.appointment.findMany({ take: 1 });
    console.log('1. OK');
  } catch (e) {
    console.log('1. FAIL:', e.message);
    return;
  }

  try {
    console.log('2. Query with assignedToUserId');
    await prisma.appointment.findMany({ where: { assignedToUserId: 'test' } });
    console.log('2. OK');
  } catch (e) {
    console.log('2. FAIL:', e.message);
    return;
  }

  try {
    console.log('3. Query with patientId');
    await prisma.appointment.findMany({ where: { patientId: null } });
    console.log('3. OK');
  } catch (e) {
    console.log('3. FAIL:', e.message);
    return;
  }

  try {
    console.log('4. Include patient relation');
    await prisma.appointment.findMany({ include: { patient: true } });
    console.log('4. OK');
  } catch (e) {
    console.log('4. FAIL:', e.message);
    return;
  }

  console.log('All tests passed - schema/DB in sync');
}

testQueries().finally(() => prisma.$disconnect());
