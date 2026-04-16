/**
 * Cal Poly / SLO–area challenges. Coordinates are approximate for map/geo features.
 * Each challenge has photoGuidelines as string[]; seed joins with newlines for the DB.
 */
export type SeedChallenge = {
  title: string;
  description: string;
  photoGuidelines: string[];
  latitude: number;
  longitude: number;
  difficulty: 'easy' | 'medium' | 'hard';
  pointsReward: number;
};

/** ~Campus center */
const C = { lat: 35.305, lng: -120.6625 };

export const CHALLENGE_SEED_DATA: SeedChallenge[] = [
  {
    title: 'Campus scavenger hunt',
    description:
      'Complete a five-stop scavenger hunt on campus. Photograph each checkpoint in order, then a final photo at your last clue location.',
    photoGuidelines: [
      'Include all five checkpoint photos in one post (collage is OK) or submit your clearest final-clue photo with a short note listing the five stops.',
      'Each checkpoint should be clearly identifiable (landmark, sign, or map pin).',
      'Stay on public paths and respect building access rules.',
    ],
    latitude: C.lat + 0.001,
    longitude: C.lng - 0.001,
    difficulty: 'hard',
    pointsReward: 85,
  },
  {
    title: "Where's Waldo",
    description:
      'Find the Waldo standee or Waldo-themed display on campus (events vary) and take a selfie with it.',
    photoGuidelines: [
      'You and Waldo must both be visible.',
      'Face the camera; no blurry shots.',
    ],
    latitude: C.lat + 0.002,
    longitude: C.lng + 0.001,
    difficulty: 'medium',
    pointsReward: 32,
  },
  {
    title: 'Hike the P',
    description:
      'Hike to the Cal Poly “P” on the hillside and take a photo at the top with the landmark visible.',
    photoGuidelines: [
      'The letter P must be clearly visible in the background.',
      'Include yourself (and friends if you like) in the frame.',
      'Stay on designated trails.',
    ],
    latitude: 35.302,
    longitude: -120.668,
    difficulty: 'hard',
    pointsReward: 78,
  },
  {
    title: 'Professor thumbs up',
    description:
      'Take a photo with a faculty or instructional staff member giving a thumbs up. At least two people in frame.',
    photoGuidelines: [
      'Thumbs-up gesture must be visible.',
      'Two or more people in the photo.',
      'Ask permission before posting; blur faces if they prefer.',
    ],
    latitude: C.lat + 0.0008,
    longitude: C.lng - 0.0005,
    difficulty: 'medium',
    pointsReward: 38,
  },
  {
    title: 'AuraFarm logo on a whiteboard',
    description:
      'Draw the AuraFarm logo on a classroom or study-space whiteboard using a red marker.',
    photoGuidelines: [
      'Red marker must be visible in the shot.',
      'Use an actual whiteboard in an allowed space (empty classroom or reserved room).',
      'Logo should be recognizable.',
    ],
    latitude: C.lat,
    longitude: C.lng + 0.0012,
    difficulty: 'medium',
    pointsReward: 36,
  },
  {
    title: 'Beach sandcastle',
    description:
      'Build a sandcastle at a public beach. The ocean must be visible in the background.',
    photoGuidelines: [
      'Ocean horizon or surf visible behind the sandcastle.',
      'Include yourself or your group near the build.',
      'Follow beach rules and leave no trash.',
    ],
    latitude: 35.19,
    longitude: -120.86,
    difficulty: 'medium',
    pointsReward: 42,
  },
  {
    title: 'Ice bucket (with consent)',
    description:
      'Record the moment ice water is poured with full consent. Ice should be visibly falling in the photo.',
    photoGuidelines: [
      'Everyone pictured must have agreed to the photo.',
      'Ice/water must be visibly in motion.',
      'Safety first—warm water nearby if needed.',
    ],
    latitude: C.lat - 0.001,
    longitude: C.lng,
    difficulty: 'medium',
    pointsReward: 44,
  },
  {
    title: 'Grubhub order name: Aura Farm',
    description:
      'Place a Grubhub order using the name “Aura Farm” and photograph the physical receipt showing that name.',
    photoGuidelines: [
      'Receipt must show “Aura Farm” (or close spelling) as the order name.',
      'Your hand or student ID corner can verify it is yours—no full ID numbers.',
    ],
    latitude: C.lat + 0.0015,
    longitude: C.lng,
    difficulty: 'easy',
    pointsReward: 22,
  },
  {
    title: 'Find the Carrot Guy',
    description:
      'Take a selfie with the campus “Carrot Guy” statue or approved stand-in location when the statue is unavailable.',
    photoGuidelines: [
      'Selfie with the carrot-themed figure clearly in frame.',
      'Face visible.',
    ],
    latitude: C.lat + 0.0005,
    longitude: C.lng + 0.002,
    difficulty: 'easy',
    pointsReward: 20,
  },
  {
    title: 'Hot sauce shot',
    description:
      'Photo of you tasting hot sauce with the bottle in frame. Only participate if you can do so safely.',
    photoGuidelines: [
      'Bottle label visible.',
      'You actively tasting (not a stock image).',
      'Use a reasonable amount; skip if you have dietary or health concerns.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'hard',
    pointsReward: 52,
  },
  {
    title: 'Submit a challenge idea',
    description:
      'Submit an idea through the official AuraFarm Google Form using your AuraFarm username. Screenshot your confirmation or thank-you page.',
    photoGuidelines: [
      'Screenshot must show the form confirmation or submission timestamp.',
      'Ideas must be legal, safe, and respectful.',
      'Credit may be awarded if the team approves your idea.',
    ],
    latitude: C.lat,
    longitude: C.lng - 0.001,
    difficulty: 'medium',
    pointsReward: 28,
  },
  {
    title: 'Make your bed',
    description: 'Tidy your bed and photograph the made bed from a clear angle.',
    photoGuidelines: [
      'Bed should look intentionally made (sheets/blanket neat).',
      'Wide enough shot to show the whole bed.',
    ],
    latitude: C.lat + 0.003,
    longitude: C.lng + 0.003,
    difficulty: 'easy',
    pointsReward: 14,
  },
  {
    title: 'Climb a tree',
    description:
      'Take a third-person or selfie photo with you clearly off the ground in a tree. Only use trees you are allowed to climb.',
    photoGuidelines: [
      'You must be visibly in the tree.',
      'Feet off the ground.',
      'Campus trees: follow university policies; prefer public parks if unsure.',
    ],
    latitude: C.lat + 0.002,
    longitude: C.lng - 0.002,
    difficulty: 'medium',
    pointsReward: 34,
  },
  {
    title: 'Selfie with the Aglish cow',
    description:
      'Take a selfie with the cow statue (or designated “Aglish” art installation on campus).',
    photoGuidelines: [
      'Selfie with the cow clearly visible.',
      'Your face in frame.',
    ],
    latitude: 35.3065,
    longitude: -120.664,
    difficulty: 'easy',
    pointsReward: 18,
  },
  {
    title: 'Intramural win',
    description:
      'Win an intramural game and photograph the official scorecard or results screen with your name visible.',
    photoGuidelines: [
      'Your name legible on the scorecard or roster.',
      'Official IM or Rec Center documentation preferred.',
    ],
    latitude: 35.299,
    longitude: -120.66,
    difficulty: 'medium',
    pointsReward: 42,
  },
  {
    title: 'StairMaster session',
    description:
      'Complete 20 minutes on a stair climber; machine display should show time and a reasonable level.',
    photoGuidelines: [
      'Photo of the display showing ≥20 minutes elapsed.',
      'Level visible (team may specify minimum level later).',
    ],
    latitude: 35.2995,
    longitude: -120.659,
    difficulty: 'medium',
    pointsReward: 36,
  },
  {
    title: 'Pet a dog',
    description: 'Selfie with you and a dog. Get the owner’s permission first.',
    photoGuidelines: [
      'Both you and the dog visible.',
      'Owner consent for photo.',
    ],
    latitude: C.lat + 0.001,
    longitude: C.lng + 0.001,
    difficulty: 'easy',
    pointsReward: 16,
  },
  {
    title: 'Wordle in four or fewer',
    description:
      'Solve the New York Times Wordle in four guesses or fewer. Submit a screenshot.',
    photoGuidelines: [
      'Screenshot must show guess count ≤4 and a solved puzzle.',
      'Same-day puzzle preferred.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'easy',
    pointsReward: 18,
  },
  {
    title: 'AuraFarm logo in Minecraft',
    description:
      'Build the AuraFarm logo in Minecraft and submit a photo of your screen or an in-game screenshot.',
    photoGuidelines: [
      'Logo recognizable from blocks.',
      'Screen photo or export—no stolen images.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'hard',
    pointsReward: 58,
  },
  {
    title: 'Dexter Lawn (face down)',
    description:
      'Lie face down on Dexter Lawn for a playful photo. Use a third-person shot showing you on the grass.',
    photoGuidelines: [
      'Third-person angle (friend takes the photo).',
      'Clearly on grass; Dexter Lawn context visible if possible.',
    ],
    latitude: 35.3008,
    longitude: -120.662,
    difficulty: 'medium',
    pointsReward: 28,
  },
  {
    title: 'Eat a vegetable',
    description: 'Selfie while eating a real vegetable (not just a prop).',
    photoGuidelines: [
      'Vegetable identifiable.',
      'You in frame.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'easy',
    pointsReward: 12,
  },
  {
    title: 'Pick up trash',
    description:
      'Pick up litter and selfie with your bag or collected trash (outdoors).',
    photoGuidelines: [
      'Trash or bag visible.',
      'You in frame.',
      'Dispose of waste properly after the photo.',
    ],
    latitude: C.lat + 0.001,
    longitude: C.lng,
    difficulty: 'easy',
    pointsReward: 18,
  },
  {
    title: 'Temporary AuraFarm “tattoo”',
    description:
      'Write “AuraFarm” or draw the logo on your arm or hand with washable marker.',
    photoGuidelines: [
      'Marker art legible.',
      'Skin in frame—no inappropriate placement.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'medium',
    pointsReward: 26,
  },
  {
    title: 'Paint a nail red',
    description: 'Selfie showing at least one fingernail painted red.',
    photoGuidelines: [
      'Red polish visible.',
      'Face optional but selfie style OK.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'easy',
    pointsReward: 14,
  },
  {
    title: 'Headstand',
    description:
      'Perform a headstand or tripod; third-person photo preferred for safety.',
    photoGuidelines: [
      'Full headstand visible.',
      'Third-person shot recommended.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'medium',
    pointsReward: 30,
  },
  {
    title: 'Backwards shirt in class',
    description:
      'Wear a shirt backwards during class and take a selfie from your seat.',
    photoGuidelines: [
      'Classroom setting visible (desks, board, etc.).',
      'Shirt clearly on backwards.',
    ],
    latitude: C.lat + 0.0005,
    longitude: C.lng - 0.0005,
    difficulty: 'medium',
    pointsReward: 34,
  },
  {
    title: 'Five pairs of sunglasses',
    description: 'Selfie wearing five pairs of sunglasses at once.',
    photoGuidelines: [
      'Five pairs visibly stacked or worn.',
      'Face visible.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'easy',
    pointsReward: 22,
  },
  {
    title: '100 upvotes on Cal Poly Yik Yak',
    description:
      'Screenshot a Yak post showing at least 100 upvotes (or equivalent metric).',
    photoGuidelines: [
      'Upvote count clearly visible.',
      'Must be your post or you have permission to share.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'hard',
    pointsReward: 48,
  },
  {
    title: 'Under three hours screen time',
    description:
      'Screenshot your phone’s daily screen time showing under three hours total.',
    photoGuidelines: [
      'Date visible on the screenshot.',
      'Total under 3:00 hours.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'medium',
    pointsReward: 38,
  },
  {
    title: 'Jump in the ocean',
    description:
      'Photo of you in the ocean (waist-deep or more). Safety and swimming ability first.',
    photoGuidelines: [
      'You in the water.',
      'Ocean visible.',
    ],
    latitude: 35.17,
    longitude: -120.75,
    difficulty: 'medium',
    pointsReward: 36,
  },
  {
    title: 'Parallel park',
    description:
      'Parallel park your vehicle and photograph it with the driver door open to show it is your car.',
    photoGuidelines: [
      'Car between lines; door open.',
      'License plate may be blurred.',
    ],
    latitude: 35.304,
    longitude: -120.665,
    difficulty: 'easy',
    pointsReward: 20,
  },
  {
    title: 'Donate five dollars to charity',
    description:
      'Donate at least $5 to a registered charity and screenshot the receipt or confirmation.',
    photoGuidelines: [
      'Amount and charity name visible.',
      'Redact full payment details if needed.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'medium',
    pointsReward: 28,
  },
  {
    title: 'Eight-minute mile',
    description:
      'Run a mile in eight minutes or faster. Screenshot from a tracked run (app or watch).',
    photoGuidelines: [
      'Pace or split showing ≤8:00/mile for one mile.',
      'Date visible.',
    ],
    latitude: 35.299,
    longitude: -120.66,
    difficulty: 'hard',
    pointsReward: 68,
  },
  {
    title: 'Selfie with a campus turkey',
    description:
      'Take a selfie with one of Cal Poly’s wild turkeys—keep a safe distance and do not chase wildlife.',
    photoGuidelines: [
      'Turkey and you in frame.',
      'Safe distance; no harassment of animals.',
    ],
    latitude: 35.307,
    longitude: -120.663,
    difficulty: 'medium',
    pointsReward: 24,
  },
  {
    title: 'Basketball dunk',
    description:
      'Photo of you jumping toward the hoop with the ball going through (or closest safe attempt at a dunk or lay-up slam).',
    photoGuidelines: [
      'Action shot at the hoop.',
      'Outdoor court or gym where allowed.',
    ],
    latitude: 35.298,
    longitude: -120.661,
    difficulty: 'hard',
    pointsReward: 72,
  },
  {
    title: 'Cal Poly sports event',
    description:
      'Attend a Cal Poly home game or sanctioned sports event; selfie in the venue.',
    photoGuidelines: [
      'Venue or field visible.',
      'Ticket stub or app ticket optional.',
    ],
    latitude: 35.301,
    longitude: -120.664,
    difficulty: 'medium',
    pointsReward: 34,
  },
  {
    title: '25,000 steps in one day',
    description: 'Screenshot your step count for a single day showing at least 25,000 steps.',
    photoGuidelines: [
      'Date and step total visible.',
      'Single-day total ≥25,000.',
    ],
    latitude: C.lat,
    longitude: C.lng,
    difficulty: 'hard',
    pointsReward: 52,
  },
  {
    title: '“Weird Al” bathroom plaque',
    description:
      'Visit the restroom with the Weird Al plaque and photograph yourself next to the plaque or a tasteful shot of the plaque with you nearby.',
    photoGuidelines: [
      'Plaque readable.',
      'Respect privacy of others—no photos of strangers.',
    ],
    latitude: 35.306,
    longitude: -120.6615,
    difficulty: 'easy',
    pointsReward: 18,
  },
  {
    title: 'Einstein bench',
    description:
      'Sit on the bench next to the Einstein statue and photograph yourself beside the statue.',
    photoGuidelines: [
      'You seated; statue visible.',
    ],
    latitude: 35.3055,
    longitude: -120.663,
    difficulty: 'easy',
    pointsReward: 18,
  },
  {
    title: 'Cal Poly Creamery ice cream',
    description: 'Get ice cream from the Cal Poly Creamery; photo of you with your treat at the Creamery.',
    photoGuidelines: [
      'Creamery context (sign or counter) if possible.',
      'You and product visible.',
    ],
    latitude: 35.253,
    longitude: -120.685,
    difficulty: 'easy',
    pointsReward: 20,
  },
  {
    title: 'San Luis Obispo sign',
    description: 'Photo of you next to the San Luis Obispo welcome or landmark sign (use the official public sign location).',
    photoGuidelines: [
      'Sign readable.',
      'You in frame.',
    ],
    latitude: 35.282,
    longitude: -120.66,
    difficulty: 'easy',
    pointsReward: 18,
  },
  {
    title: 'SLO DoCo donut',
    description: 'Photo of you with a donut at SloDoCo (inside or in front of the shop).',
    photoGuidelines: [
      'Donut visible.',
      'Shop recognizable.',
    ],
    latitude: 35.293,
    longitude: -120.66,
    difficulty: 'easy',
    pointsReward: 20,
  },
  {
    title: 'ASI trivia night',
    description: 'Attend an ASI-hosted trivia night; photo of you at the event.',
    photoGuidelines: [
      'Event setting visible (stage, screen, or ASI branding).',
      'You in frame.',
    ],
    latitude: C.lat + 0.0005,
    longitude: C.lng + 0.0005,
    difficulty: 'medium',
    pointsReward: 34,
  },
];
