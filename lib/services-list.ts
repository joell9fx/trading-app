export const ALL_SERVICES = [
  { key: 'community', name: 'Community Hub', description: 'Join live discussions and trade ideas.', credit_cost: 5 },
  { key: 'signals', name: 'Trading Signals', description: 'Get daily setups and trade calls.', credit_cost: 8 },
  { key: 'mentorship', name: 'Mentorship', description: '1-on-1 sessions with professional traders.', credit_cost: 10 },
  { key: 'funding', name: 'Funding Account Support', description: 'Track prop firm evaluations and funding status.', credit_cost: 6 },
  { key: 'courses', name: 'Trading Courses', description: 'Step-by-step video education library.', credit_cost: 4 },
] as const

export type ServiceKey = (typeof ALL_SERVICES)[number]['key']

