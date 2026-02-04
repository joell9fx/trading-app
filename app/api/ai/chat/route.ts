import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // No-op for server-side
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return a helpful response if API key is not configured
      return NextResponse.json({
        response: `I understand you're asking: "${message}". 

To enable full AI functionality, please configure the OPENAI_API_KEY environment variable. 

For now, here's a general response:

**Market Analysis**: Always consider multiple timeframes, support/resistance levels, and market structure when analyzing trades.

**ICT Concepts**: Inner Circle Trader concepts focus on understanding institutional order flow, liquidity, and market manipulation patterns.

**Smart Money**: Smart Money concepts involve identifying where large institutions are positioning themselves and following their lead.

**Trade Validation**: When validating a trade idea, consider: risk-reward ratio (aim for at least 1:2), market structure alignment, liquidity zones, and proper risk management.

Would you like me to elaborate on any of these topics?`,
      })
    }

    // Prepare messages for OpenAI
    const systemPrompt = `You are an expert AI Trading Assistant helping traders with:
- Market analysis and summaries
- Trade idea validation
- Explaining trading concepts (ICT, Smart Money, etc.)
- Answering trading FAQs
- Providing educational trading insights

Always:
- Be helpful and educational
- Emphasize risk management
- Remind users that trading involves risk
- Provide clear, actionable insights
- Use trading terminology appropriately

Never:
- Give specific financial advice
- Guarantee profits
- Recommend specific trades without disclaimers`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ]

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using cost-effective model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      
      return NextResponse.json({
        response: `I apologize, but I'm having trouble processing your request right now. Please try again in a moment. 

In the meantime, remember:
- Always use proper risk management (risk only 1-2% per trade)
- Consider multiple timeframes in your analysis
- Wait for confirmation before entering trades
- Keep a trading journal to track your performance`,
      })
    }

    const data = await openaiResponse.json()
    if (!data || !Array.isArray(data.choices)) {
      return NextResponse.json({
        response: 'I had trouble reading the AI response. Please try again.',
      })
    }
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.'

    return NextResponse.json({
      response: aiResponse,
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

