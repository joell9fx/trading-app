import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, Mail, Phone } from 'lucide-react'
import { FUNDING_SERVICE_CONFIG } from '@/lib/funding-service-config'

interface FundingStatusPageProps {
  searchParams: {
    plan?: string
    status?: string
  }
}

export default function FundingStatusPage({ searchParams }: FundingStatusPageProps) {
  const { plan, status } = searchParams
  
  // Redirect if no plan or status provided
  if (!plan || !status) {
    redirect('/funding-service')
  }

  const isSuccess = status === 'success'
  const planDetails = FUNDING_SERVICE_CONFIG.PRICING[plan as keyof typeof FUNDING_SERVICE_CONFIG.PRICING]

  if (!isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Payment Processing</CardTitle>
            <CardDescription>
              Your payment is still being processed. Please wait a few minutes and refresh this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Funding Journey!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for choosing our {planDetails?.name} plan. We're excited to help you pass your funding evaluation.
          </p>
        </div>

        {/* Plan Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Your Plan: {planDetails?.name}</CardTitle>
            <CardDescription>{planDetails?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What's Included:</h4>
                <ul className="space-y-2">
                  {planDetails?.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
                <ol className="space-y-2 text-gray-700">
                  <li>1. Check your email for onboarding instructions</li>
                  <li>2. Complete the intake form within 24 hours</li>
                  <li>3. Connect your evaluation account</li>
                  <li>4. We'll begin strategy setup within 48 hours</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Need Help?</CardTitle>
            <CardDescription>
              Our team is here to support you throughout your funding journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Email Support</p>
                  <a 
                    href={`mailto:${FUNDING_SERVICE_CONFIG.SUPPORT_EMAIL}`}
                    className="text-blue-600 hover:underline"
                  >
                    {FUNDING_SERVICE_CONFIG.SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Book a Call</p>
                  <a 
                    href={FUNDING_SERVICE_CONFIG.CALL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Schedule Consultation
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Button 
            size="lg"
            onClick={() => window.open(FUNDING_SERVICE_CONFIG.CALL_URL, '_blank')}
          >
            Book Your Onboarding Call
          </Button>
          <div>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• Please check your email (including spam folder) for detailed onboarding instructions</li>
            <li>• Complete the intake form within 24 hours to avoid delays</li>
            <li>• Have your evaluation account credentials ready</li>
            <li>• Our team will contact you within 48 hours to begin setup</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
