'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  BarChart3,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Copy,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AIBotMessage } from '@/types';
import toast from 'react-hot-toast';

const quickPrompts = [
  {
    title: 'Strategy Analysis',
    description: 'Analyze a trading strategy',
    prompt: 'Can you analyze this trading strategy and provide feedback on risk management?',
    icon: TrendingUp,
  },
  {
    title: 'Chart Patterns',
    description: 'Identify chart patterns',
    prompt: 'What chart patterns do you see in this market and what do they indicate?',
    icon: BarChart3,
  },
  {
    title: 'Risk Management',
    description: 'Get risk management advice',
    prompt: 'What are the best risk management practices for this trade setup?',
    icon: HelpCircle,
  },
  {
    title: 'Market Analysis',
    description: 'Analyze current market conditions',
    prompt: 'What\'s your analysis of the current market conditions and potential opportunities?',
    icon: Lightbulb,
  },
];

export default function AIBotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIBotMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message: string, context: 'strategy' | 'chart' | 'faq' | 'general' = 'general') => {
    if (!message.trim() || !user) return;

    const userMessage: AIBotMessage = {
      id: Date.now().toString(),
      userId: user.id,
      message: message.trim(),
      response: '',
      createdAt: new Date(),
      context,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual OpenAI API call)
      const aiResponse = await generateAIResponse(message, context);
      
      const updatedMessage: AIBotMessage = {
        ...userMessage,
        response: aiResponse,
      };

      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? updatedMessage : msg
      ));

      // Save to database
      await addDoc(collection(db, 'aiBotMessages'), {
        userId: user.id,
        message: message.trim(),
        response: aiResponse,
        createdAt: serverTimestamp(),
        context,
      });

    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to get AI response');
      
      // Remove the message if it failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (message: string, context: string): Promise<string> => {
    // This is a mock response - replace with actual OpenAI API integration
    const responses = {
      strategy: `Based on your strategy question, here are some key considerations:

1. **Risk Management**: Always use proper position sizing and stop losses
2. **Entry/Exit Points**: Define clear entry and exit criteria
3. **Market Conditions**: Consider current market volatility and trends
4. **Backtesting**: Test your strategy on historical data first

Would you like me to analyze a specific strategy in detail?`,
      
      chart: `Chart pattern analysis for your query:

**Common Patterns to Look For:**
- Head and Shoulders (reversal pattern)
- Double Tops/Bottoms
- Triangles (continuation patterns)
- Flags and Pennants
- Cup and Handle

**Key Indicators:**
- Volume confirmation
- Support/resistance levels
- Trend lines and channels

Remember: Patterns are not 100% reliable - always use additional confirmation.`,
      
      faq: `Here are some frequently asked trading questions and answers:

**Q: What's the best time to trade?**
A: It depends on your strategy and the markets you trade. Major sessions overlap during London/NY hours.

**Q: How much should I risk per trade?**
A: Generally 1-2% of your account per trade is recommended.

**Q: Should I use leverage?**
A: Use leverage carefully and understand the risks involved.

**Q: How do I manage emotions?**
A: Stick to your trading plan, use proper risk management, and take breaks when needed.`,
      
      general: `I'm here to help with your trading questions! I can assist with:

• Strategy analysis and development
• Chart pattern identification
• Risk management advice
• Market analysis
• Trading psychology
• Technical analysis
• Fundamental analysis

What specific aspect of trading would you like to discuss?`
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return responses[context as keyof typeof responses] || responses.general;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Trading Assistant
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Powered by GPT-4
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Get instant trading guidance, strategy analysis, and market insights from our AI assistant.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Quick Prompts
            </h3>
            {quickPrompts.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <motion.button
                  key={prompt.title}
                  onClick={() => sendMessage(prompt.prompt, 'general')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {prompt.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {prompt.description}
                  </p>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Pro Tips
              </span>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Be specific with your questions</li>
              <li>• Include relevant market context</li>
              <li>• Ask for risk management advice</li>
              <li>• Request multiple time frame analysis</li>
            </ul>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-900">
          {/* Header */}
          <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Trading Assistant
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ask me anything about trading, strategies, or market analysis
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Welcome to AI Trading Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  I'm here to help you with trading strategies, market analysis, risk management, and more. 
                  Start by asking a question or try one of the quick prompts.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Zap className="h-4 w-4" />
                  <span>Powered by GPT-4</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-4">
                    {/* User Message */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-3xl">
                        <div className="bg-primary-600 text-white rounded-lg p-4 shadow-sm">
                          <p>{message.message}</p>
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* AI Response */}
                    {message.response && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex"
                      >
                        <div className="max-w-3xl">
                          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-dark-700">
                            <div className="flex items-start space-x-3 mb-3">
                              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="h-4 w-4 text-primary-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    AI Assistant
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTime(message.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => copyToClipboard(message.response)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="prose prose-sm max-w-none text-gray-900 dark:text-white">
                              <div className="whitespace-pre-wrap">{message.response}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex"
                  >
                    <div className="max-w-3xl">
                      <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-dark-700">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                AI Assistant
                              </span>
                              <RefreshCw className="h-3 w-3 text-primary-600 animate-spin" />
                            </div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 p-4">
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me about trading strategies, market analysis, risk management..."
                  className="w-full resize-none border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
