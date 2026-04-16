import { PrismaClient } from '@prisma/client';
import { CHALLENGE_SEED_DATA } from './challengeSeedData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('🧹 Clearing existing data...');
  await prisma.flag.deleteMany();
  await prisma.challengeCompletion.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Creating users...');
  const user1 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
      auraPoints: 150,
      streak: 5,
      lastCompletedAt: new Date('2024-01-20'),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'Jane Smith',
      auraPoints: 200,
      streak: 10,
      lastCompletedAt: new Date('2024-01-21'),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      name: 'Alex Johnson',
      auraPoints: 75,
      streak: 3,
      lastCompletedAt: new Date('2024-01-19'),
    },
  });

  console.log(`✅ Created ${3} users`);

  console.log('🎯 Creating challenges...');
  const createdChallenges = [];
  for (const c of CHALLENGE_SEED_DATA) {
    const row = await prisma.challenge.create({
      data: {
        title: c.title,
        description: c.description,
        photoGuidelines: c.photoGuidelines.map((s) => s.trim()).join('\n'),
        latitude: c.latitude,
        longitude: c.longitude,
        difficulty: c.difficulty,
        pointsReward: c.pointsReward,
      },
    });
    createdChallenges.push(row);
  }
  console.log(`✅ Created ${createdChallenges.length} challenges`);

  const [ch0, ch1, ch2, ch3, ch4] = createdChallenges;

  console.log('✅ Creating challenge completions...');

  const completion1 = await prisma.challengeCompletion.create({
    data: {
      userId: user1.id,
      challengeId: ch0.id,
      latitude: ch0.latitude,
      longitude: ch0.longitude,
      completedAt: new Date('2024-01-20'),
      imageUri: 'https://picsum.photos/401',
    },
  });

  const completion2 = await prisma.challengeCompletion.create({
    data: {
      userId: user1.id,
      challengeId: ch2.id,
      latitude: ch2.latitude,
      longitude: ch2.longitude,
      completedAt: new Date('2024-01-19'),
      imageUri: 'https://picsum.photos/402',
    },
  });

  const completion3 = await prisma.challengeCompletion.create({
    data: {
      userId: user2.id,
      challengeId: ch0.id,
      latitude: ch0.latitude,
      longitude: ch0.longitude,
      completedAt: new Date('2024-01-21'),
      imageUri: 'https://picsum.photos/403',
    },
  });

  const completion4 = await prisma.challengeCompletion.create({
    data: {
      userId: user2.id,
      challengeId: ch1.id,
      latitude: ch1.latitude,
      longitude: ch1.longitude,
      completedAt: new Date('2024-01-20'),
      imageUri: 'https://picsum.photos/404',
    },
  });

  const completion5 = await prisma.challengeCompletion.create({
    data: {
      userId: user2.id,
      challengeId: ch3.id,
      latitude: ch3.latitude,
      longitude: ch3.longitude,
      completedAt: new Date('2024-01-18'),
      imageUri: 'https://picsum.photos/405',
    },
  });

  const completion6 = await prisma.challengeCompletion.create({
    data: {
      userId: user3.id,
      challengeId: ch0.id,
      latitude: ch0.latitude,
      longitude: ch0.longitude,
      completedAt: new Date('2024-01-19'),
      imageUri: 'https://picsum.photos/406',
    },
  });

  const completion7 = await prisma.challengeCompletion.create({
    data: {
      userId: user3.id,
      challengeId: ch4.id,
      latitude: ch4.latitude,
      longitude: ch4.longitude,
      completedAt: new Date('2024-01-17'),
      imageUri: 'https://picsum.photos/407',
    },
  });

  console.log(`✅ Created ${7} challenge completions`);

  console.log('🚩 Creating flags...');
  await prisma.flag.create({
    data: {
      completionId: completion1.id,
      flaggedById: user2.id,
      reason: 'Suspicious location - seems too far from challenge',
    },
  });

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: 3`);
  console.log(`   Challenges: ${createdChallenges.length}`);
  console.log(`   Completions: 7`);
  console.log(`   Flags: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
