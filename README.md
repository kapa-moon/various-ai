# Minimalistic Next.js App with Neon Database

A clean, minimalistic Next.js React web application with Neon database integration, ready for Vercel deployment.

## Features

- ✨ Minimalistic landing page with "Hello you!" message
- 🔗 Neon database integration
- 🚀 Ready for Vercel deployment
- 📱 Responsive design with Tailwind CSS
- 🌙 Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Neon database account (sign up at [neon.tech](https://neon.tech))

### Installation

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd various-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Neon database URL:
   ```
   DATABASE_URL=your_neon_database_connection_string
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Getting Your Neon Database URL

1. Sign up for a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from your dashboard
4. Add it to your `.env.local` file as `DATABASE_URL`

### Database Schema

The app includes a basic users table. You can extend the schema in `src/lib/db.ts`.

Example usage:
```typescript
import { sql, createUsersTable, getUsers } from '@/lib/db';

// Create the users table
await createUsersTable();

// Get all users
const users = await getUsers();
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add your `DATABASE_URL` environment variable in Vercel's dashboard
4. Deploy!

### Environment Variables for Vercel

In your Vercel dashboard, add:
- `DATABASE_URL`: Your Neon database connection string

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main landing page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
└── lib/
    └── db.ts             # Database utilities
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Neon (PostgreSQL)
- **Deployment**: Vercel
- **Language**: TypeScript

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).