# Trading Academy Platform

A comprehensive trading education platform built with Next.js, Supabase, and modern web technologies. This platform provides courses, mentoring, community features, and certification programs for aspiring traders.

## 🚀 Features

- **Comprehensive Course Library**: 50+ courses from beginner to advanced
- **Expert Mentoring**: 1-on-1 sessions with professional traders
- **Active Community**: Real-time discussions and market insights
- **Certification Program**: Earn certificates upon course completion
- **Risk Management Tools**: Built-in trading journal and risk calculators
- **Mobile Responsive**: Optimized for all devices
- **Dark Mode Support**: Beautiful dark and light themes
- **Real-time Updates**: Live community features and notifications

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Payments**: Stripe integration
- **Email**: Resend for transactional emails
- **Analytics**: Google Analytics 4, Mixpanel
- **Error Tracking**: Sentry
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)
- Resend account (for emails)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

   # Email Configuration
   RESEND_API_KEY=re_your_resend_api_key
   NEXT_PUBLIC_FROM_EMAIL=noreply@yourdomain.com

   # Analytics
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=Trading Academy
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations (see Database Setup section)
   - Configure authentication providers
   - Set up storage buckets and policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄 Database Setup

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Push the database schema**
   ```bash
   npm run db:push
   ```

5. **Generate TypeScript types**
   ```bash
   npm run db:generate
   ```

## 📁 Project Structure

```
trading-app/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── home/             # Homepage components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── providers.tsx     # Context providers
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── services/             # API services
├── types/                # TypeScript type definitions
├── utils/                # Helper functions
└── features/             # Feature-specific code
```

## 🎨 Component Library

This project uses shadcn/ui components with custom styling. Key components include:

- **Button**: Multiple variants (default, outline, ghost, etc.)
- **Toast**: Notification system
- **Loading Spinner**: Loading states
- **Form Components**: Input, Select, Checkbox, etc.

## 🔐 Authentication

The platform uses Supabase Auth with the following features:

- Email/password authentication
- Magic link authentication
- Social providers (Google, GitHub)
- Role-based access control
- Protected routes

## 💳 Payments

Stripe integration for:

- Subscription management
- One-time payments
- Webhook handling
- Customer portal
- Invoice generation

## 📧 Email System

Resend integration for:

- Welcome emails
- Course notifications
- Booking confirmations
- Password resets
- Marketing emails

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application
   ```bash
   npm run build
   ```

2. Start the production server
   ```bash
   npm start
   ```

## 📊 Analytics & Monitoring

- **Google Analytics 4**: Page views and user behavior
- **Mixpanel**: Product analytics and user journeys
- **Sentry**: Error tracking and performance monitoring

## 🔒 Security

- Row Level Security (RLS) on all database tables
- Input validation with Zod
- CSRF protection
- Rate limiting
- Secure headers
- Environment variable protection

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interactions
- Progressive Web App (PWA) ready
- Offline capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@tradingacademy.com or join our Discord community.

## 🗺 Roadmap

- [ ] Advanced charting tools
- [ ] Paper trading simulator
- [ ] Mobile app (React Native)
- [ ] AI-powered trading insights
- [ ] Advanced backtesting tools
- [ ] Multi-language support
- [ ] Institutional features

## 📈 Performance

- Lighthouse score: 95+
- Core Web Vitals: Green
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

---

Built with ❤️ by the Trading Academy team
