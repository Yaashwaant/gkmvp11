# GreenKarma Wallet - Mobile Carbon Credit Platform

## Overview

GreenKarma Wallet is a mobile-first carbon credit reward platform for EV drivers. The application allows users to upload odometer readings using camera capture, get rewarded based on CO₂ saved, view wallet balance and history, and have readings validated. The app supports both English and Hindi languages and is built as a Progressive Web App (PWA).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
The application follows a monorepo structure with a clear separation between client and server code:

- **Frontend**: React.js with TypeScript, mobile-first PWA design
- **Backend**: Node.js with Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Optimized for Replit hosting environment

### Project Structure
```
/client         - React frontend application
/server         - Express.js backend API
/shared         - Shared TypeScript schemas and types
/migrations     - Database migration files
```

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **Tailwind CSS** with custom design system for styling
- **shadcn/ui** components library for consistent UI elements
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **React Hook Form** for form handling and validation

### Mobile-First Design
- PWA capabilities with mobile optimization
- Camera integration using `getUserMedia()` API
- Touch-friendly interface with bottom navigation
- Responsive design using Tailwind CSS breakpoints

### Backend Architecture
- **Express.js** REST API with TypeScript
- **Drizzle ORM** for type-safe database operations
- **Zod** for runtime validation and schema definition
- **Neon Database** (PostgreSQL) for cloud-hosted database
- Memory storage fallback for development/demo purposes

### Database Schema
Two main entities:
- **Users**: User registration with vehicle information
- **Rewards**: Odometer readings and calculated rewards

## Data Flow

### User Registration Flow
1. User enters personal details and vehicle number
2. Optional RC (Registration Certificate) photo capture
3. Vehicle number uniqueness validation
4. User record creation in database

### Odometer Upload Flow
1. Camera capture of odometer reading
2. Optional OCR processing using Tesseract.js
3. Manual reading entry as fallback
4. CO₂ savings calculation based on distance
5. Reward calculation and database storage
6. Real-time wallet balance updates

### Wallet Display Flow
1. Query user wallet data and recent rewards
2. Display current balance and CO₂ savings
3. Show monthly statistics and total distance
4. Recent activity and eco-warrior badge progress

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database client
- **drizzle-orm & drizzle-kit**: Database ORM and migrations
- **@tanstack/react-query**: Server state management
- **tesseract.js**: OCR processing for odometer readings
- **@radix-ui**: Accessible UI components foundation

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Backend bundling for production
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Development Environment
- **Replit-optimized**: Special handling for Replit development environment
- **Hot Module Replacement**: Vite HMR for fast development iteration
- **Development middleware**: Custom logging and error handling

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations for schema management
- **Environment Variables**: `DATABASE_URL` required for PostgreSQL connection

### Architecture Decisions

**Database Choice**: PostgreSQL with Drizzle ORM chosen for:
- Type safety with TypeScript integration
- Scalable relational data model
- Cloud hosting compatibility with Neon

**State Management**: TanStack Query selected for:
- Automatic caching and synchronization
- Optimistic updates for better UX
- Background refetching capabilities

**Camera Integration**: Native Web APIs used for:
- Direct browser camera access
- No additional native app requirements
- Cross-platform compatibility

**Internationalization**: Simple JSON-based approach for:
- English and Hindi language support
- Easy translation management
- Minimal bundle size impact

The application is designed to be easily deployable on Replit while maintaining production-ready architecture patterns and scalability considerations.

## Recent Changes (January 19, 2025)

✓ **Database Integration**: Connected external Neon PostgreSQL database
✓ **Registration System**: Created complete user registration with camera-based RC scanning  
✓ **UPI-Style Interface**: Redesigned camera capture to match UPI payment app experience
✓ **Database Storage**: Replaced memory storage with proper PostgreSQL operations
✓ **Demo Data**: Seeded database with demo user and reward history

## Advanced Features Implementation

Moving forward with advanced features including:
- **Blockchain Integration**: Smart contract integration for reward tokens
- **Enhanced OCR**: Improved text recognition with validation
- **Geolocation Tracking**: Location-based verification
- **Push Notifications**: Real-time reward notifications
- **Analytics Dashboard**: Advanced user statistics and insights