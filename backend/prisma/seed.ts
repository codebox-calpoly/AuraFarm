import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Clearing existing data...');
  await prisma.flag.deleteMany();
  await prisma.challengeCompletion.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
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

  // Create Challenges
  console.log('🎯 Creating challenges...');
  const challenge1 = await prisma.challenge.create({
    data: {
      title: 'Visit the Library',
      description: 'Explore the main campus library and find a quiet study spot',
      latitude: 37.7749,
      longitude: -122.4194,
      difficulty: 'easy',
      pointsReward: 10,
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      title: 'Hike to the Viewpoint',
      description: 'Complete the trail hike to the scenic viewpoint',
      latitude: 37.7849,
      longitude: -122.4094,
      difficulty: 'medium',
      pointsReward: 25,
    },
  });

  const challenge3 = await prisma.challenge.create({
    data: {
      title: 'Attend Campus Event',
      description: 'Join a campus event or workshop and learn something new',
      latitude: 37.7750,
      longitude: -122.4195,
      difficulty: 'easy',
      pointsReward: 15,
    },
  });

  const challenge4 = await prisma.challenge.create({
    data: {
      title: 'Volunteer at Food Bank',
      description: 'Spend 2 hours volunteering at the local food bank',
      latitude: 37.7850,
      longitude: -122.4095,
      difficulty: 'hard',
      pointsReward: 50,
    },
  });

  const challenge5 = await prisma.challenge.create({
    data: {
      title: 'Explore Botanical Garden',
      description: 'Take a peaceful walk through the campus botanical garden',
      latitude: 37.7751,
      longitude: -122.4196,
      difficulty: 'easy',
      pointsReward: 12,
    },
  });

  console.log(`✅ Created ${5} challenges`);

  // Create Challenge Completions
  console.log('✅ Creating challenge completions...');
  
  // User 1 (John) completes challenges
  const completion1 = await prisma.challengeCompletion.create({
    data: {
      userId: user1.id,
      challengeId: challenge1.id,
      latitude: 37.7749,
      longitude: -122.4194,
      completedAt: new Date('2024-01-20'),
    },
  });

  const completion2 = await prisma.challengeCompletion.create({
    data: {
      userId: user1.id,
      challengeId: challenge3.id,
      latitude: 37.7750,
      longitude: -122.4195,
      completedAt: new Date('2024-01-19'),
    },
  });

  // User 2 (Jane) completes challenges
  const completion3 = await prisma.challengeCompletion.create({
    data: {
      userId: user2.id,
      challengeId: challenge1.id,
      latitude: 37.7749,
      longitude: -122.4194,
      completedAt: new Date('2024-01-21'),
    },
  });

  const completion4 = await prisma.challengeCompletion.create({
    data: {
      userId: user2.id,
      challengeId: challenge2.id,
      latitude: 37.7849,
      longitude: -122.4094,
      completedAt: new Date('2024-01-20'),
    },
  });

  const completion5 = await prisma.challengeCompletion.create({
    data: {
      userId: user2.id,
      challengeId: challenge4.id,
      latitude: 37.7850,
      longitude: -122.4095,
      completedAt: new Date('2024-01-18'),
    },
  });

  // User 3 (Alex) completes challenges
  const completion6 = await prisma.challengeCompletion.create({
    data: {
      userId: user3.id,
      challengeId: challenge1.id,
      latitude: 37.7749,
      longitude: -122.4194,
      completedAt: new Date('2024-01-19'),
    },
  });

  const completion7 = await prisma.challengeCompletion.create({
    data: {
      userId: user3.id,
      challengeId: challenge5.id,
      latitude: 37.7751,
      longitude: -122.4196,
      completedAt: new Date('2024-01-17'),
    },
  });

  console.log(`✅ Created ${7} challenge completions`);

  // Create a Flag (optional - for testing flagging feature)
  console.log('🚩 Creating flags...');
  const flag1 = await prisma.flag.create({
    data: {
      completionId: completion1.id,
      flaggedById: user2.id,
      reason: 'Suspicious location - seems too far from challenge',
    },
  });

  console.log(`✅ Created ${1} flag`);

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${3}`);
  console.log(`   Challenges: ${5}`);
  console.log(`   Completions: ${7}`);
  console.log(`   Flags: ${1}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

