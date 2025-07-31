# Replit.md

## Overview

This is a full-stack hotel management application built with a modern web stack. The application provides a calendar-based booking system for hotel rooms with Turkish language support and dark theme capabilities. It's designed as a single-page application (SPA) with a React frontend and Express.js backend, using PostgreSQL for data persistence. The system tracks booking timestamps and supports theme switching for enhanced user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Build Process**: esbuild for server-side bundling

### Development Environment
- **Package Manager**: npm
- **Type Checking**: TypeScript with strict mode
- **Development Server**: tsx for TypeScript execution
- **Hot Reloading**: Vite HMR for frontend, nodemon-style reloading for backend

## Key Components

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Bookings Table**: Hotel reservations with customer details, room assignments, date ranges, check-in/check-out times, and creation timestamps
- **Schema Location**: `shared/schema.ts` using Drizzle ORM definitions
- **Timestamp Tracking**: All bookings now include `createdAt` timestamp for audit trail

### API Endpoints
- `GET /api/bookings` - Retrieve all bookings
- `GET /api/bookings/range` - Get bookings by date range
- `GET /api/bookings/date/:date` - Get bookings for specific date
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/:id` - Delete booking (partially implemented)

### Frontend Components
- **HotelCalendar**: Monthly calendar view showing room occupancy with dark theme support
- **BookingModal**: Form for creating new reservations with timestamp tracking
- **DeleteConfirmationModal**: Confirmation dialog showing creation timestamps and theme support
- **ThemeProvider**: Context provider for light/dark theme management with localStorage persistence
- **UI Components**: Complete shadcn/ui component library with dark theme variants

### Storage Layer
- **Production**: PostgreSQL with Drizzle ORM (DatabaseStorage)
- **Development**: PostgreSQL with Drizzle ORM (migrated from in-memory storage)
- **Interface**: `IStorage` interface for storage abstraction
- **Database**: Neon serverless PostgreSQL with environment variables

## Data Flow

### Booking Creation Flow
1. User clicks "Add Booking" button
2. BookingModal opens with form validation
3. Form data validated with Zod schema
4. POST request to `/api/bookings` endpoint
5. Server validates and stores in database
6. Frontend refetches booking data
7. Calendar updates with new booking

### Calendar Display Flow
1. Component mounts and queries bookings for current month
2. TanStack Query manages caching and background updates
3. Bookings filtered by room number (Room 1 vs Room 2)
4. Calendar renders with color-coded room availability
5. Click handlers allow booking management

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling with validation
- **date-fns**: Date manipulation and formatting
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Dynamic class name generation
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler
- **drizzle-kit**: Database migration tools

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment setting (development/production)
- **Port**: Defaults to process.env.PORT or 3000

### Production Setup
- Static files served from `dist/public`
- Express server handles API routes and SPA fallback
- PostgreSQL database with automatic connection pooling
- Session storage in PostgreSQL for scalability

### Development Setup
- Vite dev server with HMR for frontend
- tsx with file watching for backend
- Shared types between frontend/backend in `shared/` directory
- Path aliases configured for clean imports

The application is designed for easy deployment on platforms like Replit, Vercel, or traditional VPS hosting with minimal configuration required.