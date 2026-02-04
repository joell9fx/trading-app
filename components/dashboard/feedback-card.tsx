'use client'

import { motion } from 'framer-motion'

interface FeedbackCardProps {
  feedback?: string | null
  sentiment?: string | null
}

export function FeedbackCard({ feedback, sentiment }: FeedbackCardProps) {
  const classes =
    sentiment === 'positive'
      ? 'border-green-400 bg-green-900/20'
      : sentiment === 'negative'
      ? 'border-red-400 bg-red-900/20'
      : 'border-gray-700 bg-neutral-900'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 mt-3 rounded-xl border ${classes}`}
    >
      <h4 className="text-gold-400 font-semibold mb-2">🤖 AI Feedback</h4>
      {feedback ? (
        <p className="text-gray-300 whitespace-pre-line text-sm">{feedback}</p>
      ) : (
        <p className="text-gray-500 italic text-sm">Analyzing trade...</p>
      )}
    </motion.div>
  )
}

