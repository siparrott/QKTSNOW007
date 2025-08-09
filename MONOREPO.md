# QuoteKit.ai Monorepo Architecture

## Overview
This repository has been transformed into a monorepo containing 12 theme variants of the Portrait Photography Calculator, each with unique visual styling while sharing the same backend and core functionality.

## Structure

```
.
├── packages/
│   ├── theme-registry/         # Theme registry and metadata
│   └── core-calculator/        # Shared business logic
├── apps/
│   ├── calculator-classic/     # Classic theme (Port 4101)
│   ├── calculator-minimal/     # Minimal theme (Port 4102)
│   ├── calculator-modern/      # Modern theme (Port 4103)
│   ├── calculator-elegant/     # Elegant theme (Port 4104)
│   ├── calculator-bold/        # Bold theme (Port 4105)
│   ├── calculator-serif/       # Serif theme (Port 4106)
│   ├── calculator-rounded/     # Rounded theme (Port 4107)
│   ├── calculator-mono/        # Monospace theme (Port 4108)
│   ├── calculator-contrast/    # High contrast theme (Port 4109)
│   ├── calculator-pastel/      # Pastel theme (Port 4110)
│   ├── calculator-neon/        # Neon theme (Port 4111)
│   └── calculator-dark/        # Dark theme (Port 4112)
├── scripts/
│   ├── smoke.ci.mjs           # Automated testing for all themes
│   └── serve-previews.mjs     # Serve all themes simultaneously
├── beta/
│   └── index.html             # Theme gallery showcase
└── server/                     # Shared backend (Port 5000)
```

## Theme Variants

Each theme has unique visual styling controlled by its `src/theme.css` file:

1. **Classic** - Clean and professional blue styling
2. **Minimal** - Clean whitespace with subtle monochrome elements
3. **Modern** - Contemporary gradients and sleek design
4. **Elegant** - Sophisticated design with warm accent colors
5. **Bold** - Vibrant colors and strong contrast
6. **Serif** - Traditional typography with warm tones
7. **Rounded** - Soft curves and friendly green design
8. **Mono** - Technical appearance with monospace fonts
9. **High Contrast** - Accessibility-focused with high contrast
10. **Pastel** - Soft and gentle pink/purple colors
11. **Neon** - Bright cyan with glow effects on dark background
12. **Dark** - Modern dark mode with amber accents

## Development Commands

### Individual Theme Development
```bash
# Start a specific theme
cd apps/calculator-classic && npm run dev    # Port 4101
cd apps/calculator-minimal && npm run dev   # Port 4102
cd apps/calculator-modern && npm run dev    # Port 4103
# ... etc for other themes
```

### Testing & Quality Assurance
```bash
# Run smoke tests on all themes
node scripts/smoke.ci.mjs

# Serve all themes for preview
node scripts/serve-previews.mjs
```

### Backend Development
```bash
# Start shared backend (required for all themes)
npm run dev  # Port 5000
```

## Theme Gallery
Open `beta/index.html` in a browser to see all 12 themes with direct links to each variant.

## Shared Components

### Core Calculator Package (`packages/core-calculator/`)
- **Pricing Logic**: `calculatePortraitPricing()` function with customizable configuration
- **Validation**: `validateCalculatorField()` for form validation
- **Utilities**: Currency formatting, embed code generation
- **Types**: TypeScript interfaces for form data and pricing

### Theme Registry (`packages/theme-registry/`)
- **themes.json**: Metadata for all theme variants
- **Centralized Configuration**: Theme descriptions, ports, and categories

## Backend Integration
All themes share the same backend endpoints:
- **Quote Generation**: `POST /api/embed/{embedId}/lead`
- **Email Notifications**: Dual email system with SendGrid integration
- **Lead Tracking**: PostgreSQL database for quote storage
- **Admin Dashboard**: Shared analytics and management interface

## Architecture Benefits

1. **Scalability**: Easy to add new themes by duplicating an existing app
2. **Maintainability**: Core business logic centralized in packages
3. **Testing**: Automated smoke testing across all variants
4. **Customization**: Each theme can be independently styled and configured
5. **Shared Backend**: Single source of truth for data and business logic
6. **Independent Development**: Themes can be developed and deployed separately

## Deployment Strategy
Each theme can be deployed independently while sharing the same backend infrastructure. The beta gallery provides a showcase for client selection and A/B testing.