# Support Ticketing System

A simple support ticketing system built with Next.js and Upstash Redis. This project demonstrates test-driven development (TDD) and CI/CD integration.

## Features

- Create support tickets with title and description
- View all tickets in a list
- Add responses to tickets
- Update ticket status (open, in-progress, closed)
- Delete tickets
- No user authentication required
- Real-time updates
- Fully tested with Jest and React Testing Library

## Tech Stack

- Next.js 15.3
- TypeScript
- Upstash Redis for data storage
- Tailwind CSS for styling
- Jest and React Testing Library for testing
- Zod for validation

## Prerequisites

- Node.js 18 or later
- npm or yarn
- Upstash Redis account

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd support-ticketing-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Upstash Redis credentials:
   ```
   UPSTASH_REDIS_REST_URL=your-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

The project includes comprehensive tests for all components and functionality. To run the tests:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
├── app/                              # Next.js App Router Directory
│   ├── api/                          # API Routes Directory
│   │   └── tickets/                  # Ticket-related Endpoints
│   │       ├── [id]/                 # Dynamic Route for Individual Tickets
│   │       │   ├── route.test.ts     # Tests for Single Ticket Operations
│   │       │   └── route.ts          # Single Ticket API Implementation
│   │       ├── route.test.ts         # Tests for Tickets Collection Operations
│   │       └── route.ts              # Tickets Collection API Implementation
│   ├── layout.tsx                    # Root Layout with Common UI Elements
│   ├── page.tsx                      # Homepage Component
│   └── globals.css                   # Global Styles and Tailwind Directives
│
├── components/                       # Reusable React Components
│   ├── CreateTicketForm.test.tsx    # Unit Tests for Ticket Creation Form
│   ├── CreateTicketForm.tsx         # Form Component for Creating New Tickets
│   ├── TicketCard.test.tsx          # Unit Tests for Ticket Display Card
│   ├── TicketCard.tsx               # Component for Displaying Single Ticket
│   └── TicketList.tsx               # Component for Rendering List of Tickets
│
├── lib/                             # Shared Utilities and Services
│   ├── redis.test.ts                # Tests for Redis Database Operations
│   └── redis.ts                     # Redis Client Configuration and Methods
│
├── public/                          # Static Assets Directory                 
│
├── .eslintrc.json                   # ESLint Rules and Configuration
├── .gitignore                       # Git Ignore Patterns
├── jest.config.js                   # Jest Testing Framework Configuration
├── jest.setup.js                    # Jest Global Setup File
├── next.config.mjs                  # Next.js Framework Configuration
├── package.json                     # Project Dependencies and Scripts
├── postcss.config.js                # PostCSS Configuration for Tailwind
├── README.md                        # Project Documentation and Setup Guide
├── tailwind.config.js               # Tailwind CSS Configuration
└── tsconfig.json                    # TypeScript Compiler Configuration
```