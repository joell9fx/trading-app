// Funding Service Configuration
// Update these values as needed for your production environment

export const FUNDING_SERVICE_CONFIG = {
  // Payment URLs - Update these with your actual Stripe checkout links
  PAYMENT_URL_DEFAULT: 'https://checkout.stripe.com/pay/cs_test_...',
  PAYMENT_URL: 'https://checkout.stripe.com/pay/cs_test_...',
  
  // Post-payment redirect URL
  POST_PAYMENT_URL: '/dashboard/funding-status',
  
  // Support and contact information
  SUPPORT_EMAIL: 'support@tradingacademy.com',
  CALL_URL: 'https://calendly.com/tradingacademy/consultation',
  
  // Pricing - Update these with your actual prices
  PRICING: {
    starter: {
      name: 'Starter',
      description: 'Phase 1 Only',
      price: '£497',
      features: [
        'Evaluation strategy setup',
        'Phase 1 execution',
        'Weekly updates',
        'Pass submission'
      ]
    },
    pro: {
      name: 'Pro',
      description: 'Phase 1 + Phase 2',
      price: '£897',
      features: [
        'All Starter features',
        'Phase 2 execution',
        'Priority support',
        'Extended evaluation window'
      ],
      popular: true
    },
    elite: {
      name: 'Elite',
      description: 'Full Concierge',
      price: '£1,497',
      features: [
        'All Pro features',
        'Expedited onboarding',
        'Mid-week progress calls',
        'Post-pass handover call'
      ]
    }
  },
  
  // Trust indicators
  TRUST_INDICATORS: {
    tradersCount: '500+',
    rating: '4.9',
    ratingCount: '150+'
  },
  
  // Company information
  COMPANY: {
    name: 'Trading Academy',
    website: 'https://tradingacademy.com'
  }
}

// Helper function to get payment URL with plan parameter
export const getPaymentUrl = (plan?: string): string => {
  if (!plan) return FUNDING_SERVICE_CONFIG.PAYMENT_URL_DEFAULT
  return `${FUNDING_SERVICE_CONFIG.PAYMENT_URL}?plan=${plan}`
}

// Helper function to get post-payment URL with parameters
export const getPostPaymentUrl = (plan: string, status: string = 'success'): string => {
  return `${FUNDING_SERVICE_CONFIG.POST_PAYMENT_URL}?plan=${plan}&status=${status}`
}
