# Aura Farm

A lighthearted mobile game that rewards students for doing good things or exploring campus such as attending events, hiking, volunteering. You complete challenges, submit proof, and climb leaderboards.

### Team

- [Rohit Kota](https://www.linkedin.com/in/rohit-kota4/) - Tech Lead
- [Rishi Thakkar](https://www.linkedin.com/in/rishi-thakkar1/) - Tech Lead
- [Shishir Bonthala](https://www.linkedin.com/in/shishir-bonthala-912256363/) - Product Manager
- [Hannah Moshtaghi](https://www.linkedin.com/in/hannah-moshtaghi/) - Designer
- [Vishal Murali Kannan](https://www.linkedin.com/in/vishal-mk/) - Developer
- [Trace Macias](https://www.linkedin.com/in/trace-macias/) - Developer
- [Atharv Allepally](https://www.linkedin.com/in/atharv-allepally-613204301/) - Developer
- [Jake Orchanian](https://www.linkedin.com/in/jakeo-dev/) - Developer
- [Jacky Liu](https://www.linkedin.com/in/jacky-liu-724706214/) - Developer
- [Srinithi Doddapaneni](https://www.linkedin.com/in/srinithi-doddapaneni-5592b0309/) - Developer
- Drew Tompkins - Developer

## Local Development

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project (shared team project or your own)
- A PostgreSQL database (the Supabase project's DB works fine)

### 1. Clone and install

```bash
git clone https://github.com/codebox-calpoly/AuraFarm.git
cd AuraFarm

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your values:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (URI) |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API → `service_role` secret key |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` public key |

Then run the database migrations:

```bash
cd backend && npx prisma migrate deploy && cd ..
```

### 3. Configure the frontend (optional)

The frontend auto-detects the backend URL from Expo's Metro server, so **no `.env` file is required** unless you want to override something.

If you need to override (e.g. point to a remote API), copy the example:

```bash
cp .env.example .env   # inside the frontend/ folder
```

### 4. Start the backend

```bash
cd backend && npm run dev
```

The API will be available at `http://localhost:3000`.

### 5. Start the frontend

```bash
cd frontend && npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS Simulator / `a` for Android Emulator.

> **Physical device?** The app automatically connects to your machine's local IP — no manual configuration needed as long as your phone and laptop are on the same WiFi network.

## Contributing

Visit [contributing.md](docs/contributing.md) on info for how to contribute to this repo.
