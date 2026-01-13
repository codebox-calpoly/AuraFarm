
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000/api';

async function verifySearch() {
  console.log('🧪 Starting Search Verification...');

  // 1. Seed Test Data
  console.log('🌱 Seeding test data...');
  const challenges = [
    {
      title: 'TEST_SEARCH_Morning Run',
      description: 'An easy jog around the park',
      difficulty: 'easy',
      latitude: 0,
      longitude: 0,
      pointsReward: 10,
    },
    {
      title: 'TEST_SEARCH_Marathon Training',
      description: 'Long distance run',
      difficulty: 'hard',
      latitude: 0,
      longitude: 0,
      pointsReward: 50,
    },
    {
      title: 'TEST_SEARCH_Yoga Session',
      description: 'Relaxing flow for recovery',
      difficulty: 'easy',
      latitude: 0,
      longitude: 0,
      pointsReward: 20,
    },
  ];

  try {
    // Clean up any potential stale data first
    await prisma.challenge.deleteMany({
      where: { title: { startsWith: 'TEST_SEARCH_' } },
    });

    await prisma.challenge.createMany({
      data: challenges,
    });

    // Wait a bit for server to handle it if needed (though DB is immediate)
    
    // 2. Run Tests
    
    // Test 1: Search for "Run" (Should match "Morning Run" and "Marathon Training")
    console.log('\n🔎 Test 1: Search for "Run"...');
    const res1 = await fetch(`${BASE_URL}/challenges?search=run`);
    const data1 = await res1.json();
    const count1 = data1.data.filter((c: any) => c.title.includes('TEST_SEARCH_')).length;
    
    if (count1 === 2) {
      console.log('✅ PASS: Found 2 challenges with "run"');
    } else {
      console.log(`❌ FAIL: Expected 2, found ${count1}`);
      console.log(data1.data.map((c:any) => c.title));
    }

    // Test 2: Search for "Relaxing" (Description match)
    console.log('\n🔎 Test 2: Search for "Relaxing" (description match)...');
    const res2 = await fetch(`${BASE_URL}/challenges?search=relaxing`);
    const data2 = await res2.json();
    const count2 = data2.data.filter((c: any) => c.title.includes('TEST_SEARCH_')).length;

    if (count2 === 1 && data2.data[0].title === 'TEST_SEARCH_Yoga Session') {
      console.log('✅ PASS: Found 1 challenge with "relaxing"');
    } else {
      console.log(`❌ FAIL: Expected 1 ("Yoga Session"), found ${count2}`);
    }

    // Test 3: Search + Filter (Run + Hard)
    console.log('\n🔎 Test 3: Search "Run" + Difficulty "hard"...');
    const res3 = await fetch(`${BASE_URL}/challenges?search=run&difficulty=hard`);
    const data3 = await res3.json();
    const count3 = data3.data.filter((c: any) => c.title.includes('TEST_SEARCH_')).length;

    if (count3 === 1 && data3.data[0].title === 'TEST_SEARCH_Marathon Training') {
      console.log('✅ PASS: Found 1 challenge matching criteria');
    } else {
      console.log(`❌ FAIL: Expected 1 ("Marathon Training"), found ${count3}`);
    }
    
    // Test 4: No Results
    console.log('\n🔎 Test 4: Search "XyZ_NonExistent"...');
    const res4 = await fetch(`${BASE_URL}/challenges?search=XyZ_NonExistent`);
    const data4 = await res4.json();
    if (data4.data.length === 0) {
      console.log('✅ PASS: Found 0 results as expected');
    } else {
      console.log(`❌ FAIL: Expected 0, found ${data4.data.length}`);
    }

  } catch (error) {
    console.error('❌ Error running verification:', error);
  } finally {
    // 3. Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.challenge.deleteMany({
      where: { title: { startsWith: 'TEST_SEARCH_' } },
    });
    await prisma.$disconnect();
    console.log('✨ Verification Complete');
  }
}

verifySearch();
