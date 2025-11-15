# AuraFarm - Product Overview

## What is AuraFarm?

AuraFarm is a mobile gamification app for Cal Poly students that rewards exploration, community engagement, and completing challenges around campus. Users earn "Aura Points" by completing location-based challenges, competing on leaderboards, and engaging with friends.

## Core Features

### 1. **Challenge System**
- Users complete challenges scattered across Cal Poly campus
- Challenges require geolocation verification (user must be within ~50m of challenge location)
- Users submit proof of completion (honor system + geolocation)
- Each challenge has a difficulty level and point reward
- Examples: "Climb the P," "Visit the library," "Attend a club event"

### 2. **Aura Points & Leaderboards**
- Complete challenges → earn Aura Points
- Points accumulate and display on global leaderboards
- Leaderboards ranked by total Aura Points earned
- Real-time updates as users complete challenges

### 3. **Streak System**
- Users maintain a daily streak by completing at least one challenge per day
- Streak resets to 0 if user misses a day
- Encourages daily app engagement
- Streaks are tracked and displayed in user profile

### 4. **Verification & Trust System**
- **Cal Poly email verification**: only @calpoly.edu emails can sign up
- **Geolocation proof**: app requires GPS location within 50m of challenge
- **Honor system**: users can submit completions; flagged submissions are reviewed
- **Community flagging**: users get 5 flags per week to report suspicious/fake completions

## User Base

**Primary Users:** Cal Poly students aged 18-24

**Why they use it:**
- Explore campus in a fun, gamified way
- Make new friends through shared challenges
- Friendly competition and social engagement
- Earn recognition through leaderboards and streaks
- Low-stakes gambling/betting with friends

**User Actions:**
- Sign up with Cal Poly email
- Browse nearby challenges
- Complete challenges by going to locations
- View leaderboard rankings
- Maintain daily streaks
- Flag suspicious completions

## Technical Stack

**Frontend:**
- React Native + Expo (iOS & Android from one codebase)
- React Navigation (routing)
- Zustand (state management)
- React Query (API calls & caching)
- Axios (HTTP client)
- TypeScript

**Backend:**
- Node.js + Express
- PostgreSQL (database)
- Prisma (ORM)
- PostGIS (geolocation queries)
- Firebase Auth (authentication)
- TypeScript

**Deployment:**
- Backend: Render, Railway, or Fly.io
- Mobile: TestFlight (iOS), Play Store (Android) via Expo

## Key Unknowns & Solutions

1. **Challenge Verification**
   - Problem: How do we know users actually completed challenges?
   - Solution: Geolocation (GPS) + honor system + community flagging

2. **Challenge Creation**
   - Problem: Who creates challenges initially?
   - Solution: Dev team creates 10-15 hand-crafted challenges to start

## Success Metrics

- **Retention**: % of users active 7 days, 30 days, 90 days after signup
- **Daily Active Users (DAU)**: streak maintenance
- **Engagement**: challenges completed per user per week
- **Network growth**: referrals converting to signups
- **Trust**: false completion reports per 1000 challenges submitted

## MVP (Minimum Viable Product) Scope

1. User signup/login with Cal Poly email (Firebase Auth)
2. Geolocation + nearby challenge fetching (PostGIS)
3. Challenge completion flow (GPS verification + honor system)
4. Leaderboard (top 100 users by points)
5. User profile + streak tracking
6. 10-15 hand-crafted challenges to start

## Assumptions

- Cal Poly email domain is reliable gating mechanism
- GPS accuracy ±50m is sufficient for campus challenges
- Most users will submit legit completions (honor system works initially)
- Word-of-mouth is primary user acquisition channel
- Daily streaks are strong retention driver

## Architecture Decisions

1. **Geolocation as primary verification**: GPS is harder to spoof than photos; combined with honor system, it's sufficient for MVP
2. **Separate frontend & backend repos**: easier CI/CD, scaling, and team division
3. **Postgres + Prisma**: mature, scalable, type-safe ORM for future growth
4. **Expo for mobile**: faster development iteration, no need to manage Xcode/Android Studio complexity early
5. **Firebase Auth**: removes need to build auth from scratch, reliable for student verification

## Team Roles

- **Tech Leads**: Rohit Kota, Rishi Thakkar
- **Project Manager**: Shishir Bonthala
- **Designer**: Hannah Moshtaghi
- **Developers**: Vishal, Trace, Atharv, Jake, Jacky, Drew, Srinithi

## Next Steps

1. Validate geolocation + backend API is working
2. Build frontend challenge list screen + geolocation integration
3. Deploy backend to staging (Render/Railway)
4. Test with team (internal dogfooding)
5. Iterate on UX based on early feedback
