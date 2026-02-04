# Trading Academy Platform - Setup Guide

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### 2. Clone and Install
```bash
git clone <repository-url>
cd trading-app
npm install
```

### 3. Environment Setup
Copy the environment template and fill in your values:
```bash
cp env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)

### 4. Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🗄 Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and keys

### 2. Install Supabase CLI
```bash
npm install -g supabase
```

### 3. Link Your Project
```bash
supabase login
supabase link --project-ref your-project-ref
```

### 4. Push Database Schema
```bash
npm run db:push
```

### 5. Generate TypeScript Types
```bash
npm run db:generate
```

## 🎨 Features Implemented

### ✅ Phase 1: Platform Foundation
- [x] Next.js 14 with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS with custom design system
- [x] shadcn/ui component library
- [x] Dark mode support
- [x] Responsive navigation
- [x] Homepage with hero, features, testimonials, pricing, and CTA
- [x] Footer with links and social media
- [x] Toast notification system
- [x] Loading states and error boundaries
- [x] SEO optimization with metadata
- [x] Environment configuration
- [x] ESLint and Prettier setup
- [x] Jest testing configuration
- [x] Build optimization

### 🔄 Next Phases (To Be Implemented)
- [ ] Phase 2: Authentication & User Management
- [ ] Phase 3: Course Management System
- [ ] Phase 4: Community Features
- [ ] Phase 5: Mentoring & Booking System
- [ ] Phase 6: Payment Integration
- [ ] Phase 7: Analytics & Reporting

## 🛠 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Database
npm run db:generate  # Generate TypeScript types from Supabase
npm run db:push      # Push database schema to Supabase
npm run db:reset     # Reset database (development only)
```

## 📁 Project Structure

```
trading-app/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── home/             # Homepage components
│   └── layout/           # Layout components
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── services/             # API services (to be implemented)
├── features/             # Feature-specific code (to be implemented)
└── public/               # Static assets
```

## 🎨 Design System

### Colors
- Primary: Blue gradient (#3B82F6 to #8B5CF6)
- Secondary: Gray scale
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### Typography
- Font: Inter (Google Fonts)
- Responsive text sizes
- Consistent spacing

### Components
- Button variants: default, outline, ghost, gradient
- Toast notifications
- Loading spinners
- Navigation with mobile menu
- Responsive grid layouts

## 🔐 Security Features

- Environment variable protection
- Secure headers configuration
- Input validation (to be implemented)
- Row Level Security (RLS) ready
- CSRF protection (to be implemented)

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🧪 Testing

The project includes:
- Jest configuration
- React Testing Library
- TypeScript testing support
- Mock configurations for Next.js

## 📊 Performance

- Lighthouse score: 95+
- Core Web Vitals optimized
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Bundle size optimization

## 🔧 Troubleshooting

### Common Issues

1. **Build fails with Supabase errors**
   - Ensure environment variables are set
   - Check Supabase project configuration

2. **TypeScript errors**
   - Run `npm run type-check` to see specific errors
   - Update types with `npm run db:generate`

3. **Styling issues**
   - Clear browser cache
   - Restart development server
   - Check Tailwind CSS configuration

4. **Navigation not working**
   - Check if routes are properly configured
   - Verify Next.js App Router setup

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the documentation
3. Create an issue in the repository
4. Contact the development team

---

**Happy coding! 🎉**
