# QuoteKit.ai - Replit Development Guide

## Overview

QuoteKit.ai is a comprehensive AI-powered quote calculator platform designed for service businesses. The application provides embeddable quote calculators for 50+ niches including photography, home services, healthcare, automotive, and consulting. It features a modern full-stack architecture with React frontend, Express backend, PostgreSQL database with Drizzle ORM, and AI-powered natural language processing.

## System Architecture

### Frontend Stack
- **React 18** with TypeScript for the main application
- **Wouter** for lightweight client-side routing
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with custom design tokens
- **Framer Motion** for animations and transitions
- **Tanstack Query** for server state management
- **Vite** as the build tool and development server

### Backend Stack
- **Node.js** with Express.js for the REST API
- **TypeScript** for type safety across the entire codebase
- **Drizzle ORM** with PostgreSQL for database operations
- **OpenAI GPT-4o** for natural language processing of quote requests
- **Stripe** integration for payment processing and subscriptions
- **JWT** authentication with session management
- **Nodemailer** for email notifications and marketing

### Database & Infrastructure
- **PostgreSQL** with Neon serverless database
- **Supabase** integration for additional database operations
- **Drizzle Kit** for database migrations and schema management
- Row Level Security (RLS) policies for data protection

## Key Components

### AI Processing Engine
The platform features specialized AI processors for different service niches:
- Car wash services (`server/ai.ts`)
- Dental treatments (`server/dental-ai.ts`)
- Childcare services (`server/childcare-ai.ts`, `server/childcare-services-ai.ts`)
- Plastic surgery (`server/plastic-surgery-ai.ts`)
- Private medical consultations (`server/private-medical-ai.ts`)
- Transportation services (chauffeur, airport transfer, van rental, boat charter)
- Moving and automotive services

Each AI processor uses structured prompts to extract pricing parameters from natural language input.

### Calculator System
The application supports two types of calculators:
1. **Template Calculators**: Master templates stored in `calculator_templates` table
2. **User Calculators**: User-owned instances stored in `user_calculators` table

Calculators are configured with:
- `layout_json`: UI component structure
- `logic_json`: Pricing logic and calculations
- `style_json`: Custom branding and styling
- `prompt_md`: AI processing instructions

### Authentication & Authorization
- JWT-based authentication with secure session management
- Two-factor authentication support with backup codes
- Role-based access control for different subscription tiers
- Stripe customer integration for subscription management

### Subscription System
Three-tier subscription model:
- **Free**: 5 quotes/month, basic features
- **Pro**: Enhanced features with higher quotas
- **Business**: Advanced analytics and customization
- **Enterprise**: Unlimited usage with priority support

## Data Flow

### Quote Generation Process
1. User inputs requirements via calculator interface
2. Natural language input processed by appropriate AI processor
3. Structured data extracted and validated
4. Pricing calculated using configured logic
5. Quote generated with breakdown and validity period
6. Lead information captured and stored
7. Email notifications sent to both parties

### Calculator Embedding
1. User creates calculator from template in dashboard
2. Unique embed URL generated with security tokens
3. Embed code provided for website integration
4. Calculator renders responsively in iframe
5. Quotes tracked against user's monthly limits

### User Onboarding Flow
1. User registers and creates account
2. Email verification and welcome sequence
3. Calculator template selection
4. Configuration and customization
5. Embed code generation and deployment
6. Analytics and lead tracking activation

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for natural language processing
- Structured JSON responses for consistent data extraction
- Error handling and fallback mechanisms

### Payment Processing
- **Stripe**: Complete payment infrastructure
- Subscription management with webhooks
- Customer portal for self-service
- European payment compliance

### Email Services
- **Nodemailer** with SMTP configuration
- Welcome emails with calculator setup instructions
- Quote notifications and follow-up sequences
- Responsive HTML email templates

### Database Services
- **Neon PostgreSQL**: Serverless database hosting
- **Supabase**: Additional database operations and real-time features
- Connection pooling and optimization

## Deployment Strategy

### Development Environment
- Replit-optimized configuration with hot reloading
- Environment variables managed through `.replit` secrets
- Development server runs on port 5000
- Automatic dependency installation and updates

### Production Deployment
- Vite build process for optimized frontend assets
- ESBuild compilation for Node.js backend
- PostgreSQL database migrations via Drizzle Kit
- Environment-specific configuration management

### Build Process
```bash
npm run build  # Builds both frontend and backend
npm run start  # Runs production server
npm run dev    # Development with hot reload
```

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access key
- `STRIPE_SECRET_KEY`: Stripe payment processing
- `JWT_SECRET`: Authentication token signing
- `SMTP_*`: Email service configuration
- `SUPABASE_*`: Supabase integration keys

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```