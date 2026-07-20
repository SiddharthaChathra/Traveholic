import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const testUser1 = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash,
      fullName: 'Test User',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'traveller',
      bio: 'Just a test user exploring the world.',
      website: 'https://example.com'
    }
  });

  const testUser2 = await prisma.user.upsert({
    where: { username: 'jane_doe' },
    update: {},
    create: {
      username: 'jane_doe',
      email: 'jane@example.com',
      passwordHash,
      fullName: 'Jane Doe',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      role: 'traveller',
      bio: 'Wanderlust and city dust.',
      isVerified: true
    }
  });

  console.log('Seeding stories...');
  await prisma.story.createMany({
    data: [
      {
        userId: testUser2.id,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        caption: 'Morning beach vibes 🌊',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ]
  });

  console.log('Seeding follows...');
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: testUser1.id, followingId: testUser2.id } },
    update: {},
    create: {
      followerId: testUser1.id,
      followingId: testUser2.id,
      status: 'accepted'
    }
  });

  console.log('Seeding destinations...');
  // Keeping just one destination for brevity in this script
  const dest = {
    id: 'bali',
    fullName: 'Ubud, Bali',
    visaStatus: 'Visa on Arrival Required',
    visaDetails: 'Citizens of over 80 countries require a Visa on Arrival (VoA).',
    visaUrl: 'https://molina.imigrasi.go.id/',
    visaTime: 'Immediate (VoA)',
    visaDocuments: JSON.stringify(['Passport valid for 6 months']),
    exchangeRate: '1 USD = 16,245 IDR',
    exchangeAdvice: 'Avoid airport currency booths.',
    cardAcceptance: 70,
    flights: JSON.stringify([]),
    itinerary: JSON.stringify([]),
    attractions: JSON.stringify([]),
    food: JSON.stringify([]),
    souvenirs: JSON.stringify([]),
    weatherBackup: JSON.stringify([]),
    emergencyContacts: JSON.stringify([])
  };

  await prisma.destination.upsert({
    where: { id: dest.id },
    update: dest,
    create: dest,
  });

  console.log('Seeding complete! 🎉');
}

async function run() {
  try {
    await main();
  } catch (e) {
    console.error('Error during seeding:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
