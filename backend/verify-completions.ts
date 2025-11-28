import { prisma } from './src/prisma';

async function testCompletions() {
    console.log('🧪 Starting manual verification...');

    try {
        // 1. Setup: Ensure we have a user and a challenge
        console.log('\n1️⃣  Setting up test data...');
        // The controller is hardcoded to use userId=1, so we need to ensure User 1 exists
        let user = await prisma.user.findUnique({ where: { id: 1 } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: 1,
                    email: 'user1@example.com',
                    name: 'Test User 1',
                    auraPoints: 0,
                    streak: 0,
                },
            });
        } else {
            // Reset the user's points and streak for testing
            user = await prisma.user.update({
                where: { id: 1 },
                data: {
                    auraPoints: 0,
                    streak: 0,
                },
            });
        }
        console.log('   User ID:', user.id);

        const challenge = await prisma.challenge.create({
            data: {
                title: 'Test Challenge',
                description: 'A challenge for testing',
                latitude: 37.7749,
                longitude: -122.4194,
                difficulty: 'easy',
                pointsReward: 100,
            },
        });
        console.log('   Challenge ID:', challenge.id);

        // 2. Test: Submit valid completion
        console.log('\n2️⃣  Testing valid completion submission...');
        // We can't easily test the API via script without running the server, 
        // but we can test the logic if we extracted it, or we can just use fetch if the server is running.
        // Since the user asked "how do i test this", I'll assume they want to run this against the running server.

        const response = await fetch('http://localhost:3000/api/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                challengeId: challenge.id,
                latitude: 37.7749, // Exact location
                longitude: -122.4194,
            }),
        });

        const data = await response.json() as any;
        console.log('   Status:', response.status);
        console.log('   Response:', JSON.stringify(data, null, 2));

        if (response.status === 201 && data.success) {
            console.log('   ✅ Valid completion successful');
        } else {
            console.error('   ❌ Valid completion failed');
        }

        // 3. Test: Duplicate completion
        console.log('\n3️⃣  Testing duplicate completion...');
        const dupResponse = await fetch('http://localhost:3000/api/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                challengeId: challenge.id,
                latitude: 37.7749,
                longitude: -122.4194,
            }),
        });

        if (dupResponse.status === 400) {
            console.log('   ✅ Duplicate check passed (got 400)');
        } else {
            console.error('   ❌ Duplicate check failed (expected 400, got ' + dupResponse.status + ')');
        }

        // 4. Test: Location verification
        console.log('\n4️⃣  Testing location verification...');
        const farChallenge = await prisma.challenge.create({
            data: {
                title: 'Far Challenge',
                description: 'Too far away',
                latitude: 0,
                longitude: 0,
                difficulty: 'hard',
                pointsReward: 50,
            },
        });

        const locResponse = await fetch('http://localhost:3000/api/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                challengeId: farChallenge.id,
                latitude: 10, // Far away
                longitude: 10,
            }),
        });

        if (locResponse.status === 400) {
            console.log('   ✅ Location check passed (got 400)');
        } else {
            console.error('   ❌ Location check failed (expected 400, got ' + locResponse.status + ')');
        }

        // 5. Verify User Stats
        console.log('\n5️⃣  Verifying user stats...');
        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
        console.log('   Points:', updatedUser?.auraPoints);
        console.log('   Streak:', updatedUser?.streak);

        if (updatedUser && updatedUser.auraPoints > user.auraPoints) {
            console.log('   ✅ User points updated');
        } else {
            console.error('   ❌ User points not updated');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        console.log('\n🧹 Cleaning up...');
        // Cleanup logic if needed, or leave data for manual inspection
    }
}

testCompletions();
