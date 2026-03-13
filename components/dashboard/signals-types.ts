export type HistoryItem = {
  id: string
  date: string
  asset: string
  timeframe: string
  direction: 'long' | 'short'
  entry: string
  stop: string
  takeProfit: string
  rr: number
  status: 'win' | 'loss' | 'breakeven' | 'open'
}

