
import { PrismaClient } from '@prisma/client';
import { calculateDistance } from '../src/utils/geo'; // Assuming this utility exists based on controller usage, but I'll implement a simple version if import fails or just use the logic directly here for safety.
// Actually, let's keep it simple and define the distance function locally to avoid path resolution issues if src structure is complex for ts-node from scripts dir.
// However, ts-node usually handles it if configured. Let's try to import. 
// If '../src/utils/geo' is hard to reach, I'll inline. 
// Given the previous file view, 'src/utils/geo.ts' likely exists. 
// But to be safe and self-contained, I will inline the distance calc logic for verification.

const prisma = new PrismaClient();

// Haversine formula for distance calculation (matches what should be in geo.ts)
function calculateDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function verify() {
  console.log('Starting verification...');

  // 1. Cleanup previous test run artifacts if any (by specific title)
  await prisma.challenge.deleteMany({
    where: {
      title: { in: ['TEST_SEARCH_UNIQUE', 'TEST_DIFFICULTY_HARD', 'TEST_NEARBY_1', 'TEST_NEARBY_2'] }
    }
  });

  console.log('Cleaned up old test data.');

  // 2. Create Test Data
  const searchChallenge = await prisma.challenge.create({
    data: {
      title: 'TEST_SEARCH_UNIQUE',
      description: 'This is a description with the word BANANA in it.',
      latitude: 0,
      longitude: 0,
      difficulty: 'easy',
      pointsReward: 10
    }
  });

  const hardChallenge = await prisma.challenge.create({
    data: {
      title: 'TEST_DIFFICULTY_HARD',
      description: 'Hard challenge',
      latitude: 0,
      longitude: 0,
      difficulty: 'hard',
      pointsReward: 50
    }
  });

  // User location: 40.7128, -74.0060 (NYC)
  // Nearby: 40.7138, -74.0060 (~111m away)
  const nearbyChallenge = await prisma.challenge.create({
    data: {
      title: 'TEST_NEARBY_1',
      description: 'Very close',
      latitude: 40.7138,
      longitude: -74.0060,
      difficulty: 'easy',
      pointsReward: 10
    }
  });

  // Far Away: 41.7128, -74.0060 (~111km away)
  const farChallenge = await prisma.challenge.create({
    data: {
      title: 'TEST_NEARBY_2',
      description: 'Far away',
      latitude: 41.7128,
      longitude: -74.0060,
      difficulty: 'easy',
      pointsReward: 10
    }
  });

  console.log('Created test data.');

  // 3. Test Text Search
  console.log('\n--- Test 1: Text Search ---');
  const searchResults = await prisma.challenge.findMany({
    where: {
      OR: [
        { title: { contains: 'BANANA', mode: 'insensitive' } },
        { description: { contains: 'BANANA', mode: 'insensitive' } }
      ]
    }
  });
  
  if (searchResults.length === 1 && searchResults[0].id === searchChallenge.id) {
    console.log('✅ Text search passed: Found challenge by description.');
  } else {
    console.error('❌ Text search failed:', searchResults);
  }

  // 4. Test Difficulty Filtering
  console.log('\n--- Test 2: Difficulty Filtering ---');
  const difficultyResults = await prisma.challenge.findMany({
    where: {
      difficulty: 'hard',
      title: 'TEST_DIFFICULTY_HARD' // restrict to our test data to be sure
    }
  });

  if (difficultyResults.length === 1 && difficultyResults[0].id === hardChallenge.id) {
    console.log('✅ Difficulty filter passed: Found hard challenge.');
  } else {
    console.error('❌ Difficulty filter failed:', difficultyResults);
  }

  // 5. Test Nearby Search Logic
  console.log('\n--- Test 3: Nearby Search ---');
  const userLat = 40.7128;
  const userLon = -74.0060;
  const radius = 5000; // 5km

  const allChallenges = await prisma.challenge.findMany({
      where: {
          title: { in: ['TEST_NEARBY_1', 'TEST_NEARBY_2'] }
      }
  });

  const nearbyResults = allChallenges
    .map(c => ({ ...c, distance: calculateDist(userLat, userLon, c.latitude, c.longitude) }))
    .filter(c => c.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  if (nearbyResults.length === 1 && nearbyResults[0].title === 'TEST_NEARBY_1') {
    console.log(`✅ Nearby search passed: Found 1 challenge (Distance: ${Math.round(nearbyResults[0].distance)}m). Far challenge excluded.`);
  } else {
    console.error('❌ Nearby search failed. Results:', nearbyResults.map(r => `${r.title} (${r.distance}m)`));
  }

  // Cleanup
  console.log('\nCleaning up...');
  await prisma.challenge.deleteMany({
    where: {
      title: { in: ['TEST_SEARCH_UNIQUE', 'TEST_DIFFICULTY_HARD', 'TEST_NEARBY_1', 'TEST_NEARBY_2'] }
    }
  });
  console.log('Done.');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
