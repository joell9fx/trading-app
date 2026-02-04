# Funding Account Passing Service

A production-ready page for a "Funding Account Passing Service" that helps traders pass prop firm evaluations.

## Features

- **Complete Landing Page**: Professional design with all required sections
- **Configurable Pricing**: Easy-to-update pricing plans and features
- **Payment Integration**: Ready for Stripe or other payment processors
- **Post-Payment Flow**: Dedicated status page after successful payment
- **Mobile Responsive**: Optimized for all device sizes
- **SEO Optimized**: Proper meta tags and Open Graph support

## Pages

### 1. Main Service Page (`/funding-service`)
- Hero section with clear value proposition
- Step-by-step process explanation
- Eligibility requirements
- Three pricing tiers (Starter, Pro, Elite)
- FAQs and risk disclosure
- Contact information

### 2. Post-Payment Status Page (`/dashboard/funding-status`)
- Success confirmation
- Plan details and next steps
- Contact information
- Important notes for onboarding

## Configuration

### Update Payment URLs

Edit `lib/funding-service-config.ts` to configure:

```typescript
export const FUNDING_SERVICE_CONFIG = {
  // Update these with your actual Stripe checkout links
  PAYMENT_URL_DEFAULT: 'https://checkout.stripe.com/pay/YOUR_ACTUAL_LINK',
  PAYMENT_URL: 'https://checkout.stripe.com/pay/YOUR_ACTUAL_LINK',
  
  // Post-payment redirect URL
  POST_PAYMENT_URL: '/dashboard/funding-status',
  
  // Support and contact information
  SUPPORT_EMAIL: 'your-email@domain.com',
  CALL_URL: 'https://calendly.com/your-calendar',
  
  // Update pricing as needed
  PRICING: {
    starter: {
      name: 'Starter',
      description: 'Phase 1 Only',
      price: '£497',
      features: [...]
    },
    // ... other plans
  }
}
```

### Required Updates Before Production

1. **Payment URLs**: Replace placeholder Stripe checkout links
2. **Support Email**: Update to your actual support email
3. **Calendar URL**: Update Calendly or other booking link
4. **Pricing**: Adjust prices and features as needed
5. **Company Information**: Update company name and website

## Payment Flow

1. User clicks CTA button on pricing plan
2. Opens payment link in new tab with plan parameter
3. After successful payment, user lands on `/dashboard/funding-status?plan=starter&status=success`
4. Status page shows confirmation and next steps

## Customization

### Adding New Pricing Plans

1. Add new plan to `FUNDING_SERVICE_CONFIG.PRICING`
2. Update the pricing section in the main page
3. Add corresponding payment handling

### Modifying Content

- **Hero Section**: Update headline, subheadline, and benefits
- **Process Steps**: Modify the 4-step process in "How It Works"
- **FAQs**: Add/remove questions in the FAQ section
- **Risk Disclosure**: Update compliance text as needed

### Styling

The page uses Tailwind CSS with:
- Gradient backgrounds
- Responsive grid layouts
- Card-based design
- Consistent spacing and typography
- Hover effects and transitions

## File Structure

```
app/
├── funding-service/
│   └── page.tsx              # Main service page
└── dashboard/
    └── funding-status/
        └── page.tsx          # Post-payment status page

lib/
└── funding-service-config.ts # Configuration file

components/
└── ui/                      # Reusable UI components
    ├── button.tsx
    ├── card.tsx
    └── ...
```

## Dependencies

- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS
- Lucide React (icons)
- Class Variance Authority (button variants)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive enhancement

## SEO Features

- Proper meta title and description
- Open Graph tags for social sharing
- Twitter Card support
- Semantic HTML structure
- Accessible headings and landmarks

## Accessibility

- Semantic HTML elements
- Proper heading hierarchy
- Alt text for icons
- Keyboard navigation support
- High contrast design
- Screen reader friendly

## Performance

- Optimized images and icons
- Efficient CSS with Tailwind
- Minimal JavaScript
- Fast loading times

## Security

- No sensitive data in client-side code
- External payment links (Stripe)
- Secure redirects
- Input validation on status page

## Deployment

1. Update configuration file with production values
2. Build and deploy to your hosting platform
3. Test payment flow with test Stripe links
4. Update to production Stripe links
5. Verify all external links work correctly

## Support

For questions or customization needs:
- Check the configuration file for common settings
- Review the component structure for layout changes
- Test thoroughly on different devices and browsers

## Future Enhancements

- **Supabase Integration**: Add user authentication and progress tracking
- **Admin Panel**: Content management system for updating copy
- **Analytics**: Track conversions and user behavior
- **A/B Testing**: Test different pricing or messaging
- **Multi-language**: Internationalization support
- **Dark Mode**: Toggle between light and dark themes
