'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Copy, Download } from 'lucide-react'

type AssetType = 'caption' | 'email' | 'ad' | 'image'

interface StatResponse {
  total: number
  byType: Record<string, number>
  recent: {
    id: string
    asset_type: string
    content: string | null
    image_url: string | null
    created_at: string
  }[]
}

export function MarketingToolkit() {
  const { toast } = useToast()
  const [assetType, setAssetType] = useState<AssetType>('caption')
  const [platform, setPlatform] = useState('Instagram')
  const [tone, setTone] = useState('Motivational')
  const [customPrompt, setCustomPrompt] = useState('')
  const [output, setOutput] = useState<{ content?: string; image_url?: string | null } | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<StatResponse | null>(null)

  const loadStats = async () => {
    const res = await fetch('/api/marketing/stats')
    if (res.ok) {
      setStats(await res.json())
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const generate = async () => {
    setLoading(true)
    setOutput(null)
    try {
      const res = await fetch('/api/marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_type: assetType,
          platform,
          tone,
          customPrompt,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate')
      }
      setOutput(data)
      toast({ title: 'Generated', description: 'Your marketing asset is ready.' })
      await loadStats()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Generation failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const copyText = async () => {
    if (!output?.content) return
    try {
      await navigator.clipboard.writeText(output.content)
      toast({ title: 'Copied', description: 'Content copied to clipboard.' })
    } catch {
      toast({ title: 'Copy failed', description: 'Unable to copy text', variant: 'destructive' })
    }
  }

  const bestPractices = useMemo(
    () => [
      'Lead with a hook about funding or consistency.',
      'Keep CTA simple: “Join the movement” + referral link.',
      'Use 1-2 emojis max to keep premium feel.',
      'Highlight community + mentorship + funding benefits.',
    ],
    []
  )

  return (
    <div className="space-y-6">
      <Card className="bg-black border border-gold-500/50 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gold-400 font-bold">🚀 AI Marketing Toolkit</h2>
            <p className="text-sm text-gray-400">Let AI help you scale your impact.</p>
          </div>
          <Badge className="bg-gold-500/20 text-gold-200 border border-gold-500/50">Affiliate Ready</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value as AssetType)}
            className="bg-neutral-900 border border-gray-700 p-2 rounded-lg text-white"
          >
            <option value="caption">Social Caption</option>
            <option value="email">Email Template</option>
            <option value="ad">Ad Copy</option>
            <option value="image">Promo Image</option>
          </select>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-neutral-900 border border-gray-700 p-2 rounded-lg text-white"
          >
            <option>Instagram</option>
            <option>TikTok</option>
            <option>Twitter</option>
            <option>Facebook</option>
          </select>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="bg-neutral-900 border border-gray-700 p-2 rounded-lg text-white"
          >
            <option>Motivational</option>
            <option>Professional</option>
            <option>Casual</option>
            <option>Educational</option>
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-400">Optional prompt tweak</p>
          <Input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add a twist (e.g., highlight funding challenges or risk control)"
            className="bg-neutral-900 border border-gray-700 text-white"
          />
        </div>

        <Button
          onClick={generate}
          disabled={loading}
          className="bg-gold-500 text-black font-semibold hover:bg-gold-600 w-fit"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...
            </>
          ) : (
            'Generate'
          )}
        </Button>

        {output && (
          <div className="mt-4 space-y-3">
            {output.image_url && (
              <img src={output.image_url} className="rounded-xl border border-gold-500/40" alt="Generated marketing" />
            )}
            {output.content && (
              <Textarea
                value={output.content}
                readOnly
                className="bg-neutral-900 border border-gray-700 text-sm text-gray-200 min-h-[160px]"
              />
            )}
            <div className="flex gap-2">
              {output.content && (
                <Button variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60" onClick={copyText}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              )}
              {output.image_url && (
                <a
                  href={output.image_url}
                  download
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-700 text-gold-300 hover:border-gold-500/60"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <h3 className="text-white font-semibold mb-2">Analytics</h3>
          <p className="text-gray-300 text-sm">Total generated: {stats?.total || 0}</p>
          <div className="text-xs text-gray-400 space-y-1 mt-2">
            <p>Captions: {stats?.byType?.caption || 0}</p>
            <p>Emails: {stats?.byType?.email || 0}</p>
            <p>Ads: {stats?.byType?.ad || 0}</p>
            <p>Images: {stats?.byType?.image || 0}</p>
          </div>
        </Card>

        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <h3 className="text-white font-semibold mb-2">Best Practices</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            {bestPractices.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </Card>

        <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
          <h3 className="text-white font-semibold mb-2">Recent Assets</h3>
          <div className="space-y-2 text-sm text-gray-300 max-h-48 overflow-auto">
            {(stats?.recent || []).length === 0 && <p className="text-gray-500">No assets yet.</p>}
            {(stats?.recent || []).map((r) => (
              <div key={r.id} className="border border-gray-800 rounded-lg p-2">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span className="capitalize">{r.asset_type}</span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.content && <p className="text-gray-200 text-xs line-clamp-3">{r.content}</p>}
                {r.image_url && <p className="text-xs text-gold-300">Image generated</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

