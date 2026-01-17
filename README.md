# TroopTreasury

Secure, simple finance management for your scout troop.

## Features

- **Financial Management**: Track IBA balances, campout costs, and troop transactions.
- **Campout Management**: Register scouts and adults for events, track participation, and log expenses.
- **Role-Based Access Control**: Different views and permissions for Admins, Financiers, Leaders, Parents, and Scouts.
- **Database Backup/Restore**: Easily export and import your troop data.
- **Responsive Design**: Modern UI built with Next.js, Tailwind CSS, and Radix UI.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Copy `.env.example` to `.env` and configure your `DATABASE_URL` and `AUTH_SECRET`.
4. Initialize the database:
   ```bash
   npx prisma db push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Framework**: Next.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Components**: Radix UI / shadcn/ui
- **Icons**: Lucide React
