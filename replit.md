# QuoteKit.ai - Replit Development Guide

## Overview
QuoteKit.ai is an AI-powered platform providing embeddable quote calculators for over 50 service niches, including photography, home services, healthcare, automotive, and consulting. It aims to streamline quoting processes for businesses, offering a comprehensive solution for generating, tracking, and managing service quotes with AI assistance.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technologies
- **Frontend**: React 18, TypeScript, Wouter (routing), shadcn/ui (components), Tailwind CSS (styling), Framer Motion (animations), Tanstack Query (server state), Vite (build).
- **Backend**: Node.js, Express.js, TypeScript, Drizzle ORM (PostgreSQL), OpenAI GPT-4o (NLP), Stripe (payments), JWT (authentication), Nodemailer (email).
- **Database**: PostgreSQL (Neon serverless), Supabase (additional ops), Drizzle Kit (migrations).

### Key Features & Design Patterns
- **AI Processing Engine**: Specialized AI processors (e.g., for car wash, dental, childcare) extract pricing parameters from natural language input using structured prompts.
- **Calculator System**: Supports `Template Calculators` (master templates) and `User Calculators` (user-owned instances). Calculators are configured via `layout_json` (UI), `logic_json` (pricing), `style_json` (branding), and `prompt_md` (AI instructions).
- **Dynamic Pricing Architecture**: Standardized system using `getXXXPricing()` functions with `customConfig` fallback to defaults. Supports dynamic currency symbols (€, $, £, CHF, C$, A$) and real-time preview updates. Components include base price, durations, locations, add-ons, and delivery options.
- **Authentication & Authorization**: JWT-based authentication with secure session management, two-factor authentication, and role-based access control integrated with Stripe for subscription tiers.
- **Subscription System**: Three-tier model (Free, Pro, Business, Enterprise) offering varying features and quotas.
- **Data Flow**:
    - **Quote Generation**: User input -> AI processing -> structured data extraction -> pricing calculation -> quote generation -> lead capture -> email notifications.
    - **Calculator Embedding**: User creates calculator -> unique embed URL -> embed code for website integration -> responsive iframe rendering -> quote tracking.
    - **User Onboarding**: Account registration -> email verification -> calculator selection -> configuration -> embed code generation -> analytics activation.
- **UI/UX Decisions**: Utilizes shadcn/ui and Tailwind CSS for a modern, responsive design. Framer Motion for animations. Customizable color schemes and templates via `style_json`. Inline editing functionality (EditableText) for calculator content.
- **SEO Optimization**: Implemented dynamic meta tag management via SEO Head component, server-side SEO routes (sitemap.xml, robots.txt), structured data (JSON-LD), Open Graph, and Twitter Card optimization.

## Recent Changes & Project Status

### Portrait Calculator Customization Success (January 2025)
- **Comprehensive Customization System**: Successfully implemented full customization capabilities for portrait photography calculator
- **Dual-Panel Interface**: Left panel for pricing/services controls, right panel for real-time preview
- **Inline Text Editing**: Every text element (titles, descriptions, buttons, labels) can be clicked and edited directly
- **Granular Pricing Control**: Individual control over session durations, group sizes, locations, and add-ons
- **Visual Enhancement**: Colorful icons for all service options (👤 individual, 💕 couple, 👨‍👩‍👧‍👦 family, etc.)
- **Real-time Updates**: All changes appear instantly in live preview
- **Professional UX**: Clean, organized interface with visual feedback for selections

### Admin Dashboard Completed
- **Full Admin Interface**: 6 functional tabs with real-time statistics
- **Chart.js Integration**: Revenue trends, user distribution, and analytics charts
- **User Management**: Complete user overview with subscription status and quota tracking
- **Support System**: Ticket management and CSV export functionality
- **Demo Access**: Footer link with admin credentials (admin@quotekit.ai / admin123)

### MAJOR ARCHITECTURAL STREAMLINING COMPLETED (January 2025)
- **Strategic Pivot**: System simplified from 67+ calculators to single Portrait Photography calculator
- **Architecture Benefits**: Eliminates batch update failures, improves performance, reduces complexity
- **Functionality Preserved**: Portrait Photography calculator retains full customization through inline editing and dashboard controls
- **Clean Import Structure**: All broken calculator references removed from routing, components, and mappings
- **Streamlined Dashboard**: Template array reduced from 60+ entries to single Portrait Photography option
- **System Stability**: Application successfully running with clean architecture and zero LSP errors

## External Dependencies

- **AI Services**: OpenAI API (GPT-4o model).
- **Payment Processing**: Stripe (full payment infrastructure, subscription management, webhooks).
- **Email Services**: Nodemailer (SMTP configuration for notifications and marketing).
- **Database Services**: Neon PostgreSQL (serverless database hosting), Supabase (additional database operations and real-time features).