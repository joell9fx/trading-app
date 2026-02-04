'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AiInsights = {
  summary: string;
  insights: string[];
  recommendation: string;
  anomalies?: string[];
  generated_at?: string;
};

export default function AiInsightsPanel() {
  const { toast } = useToast();
  const [data, setData] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-insights');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load insights');
      setData(json);
    } catch (error: any) {
      toast({ title: 'AI insights error', description: error?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const hasAnomalies = (data?.anomalies?.length || 0) > 0;

  return (
    <Card className="bg-gray-950 border border-gray-800 p-4 space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-gray-100">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">AI Insights</p>
            <h3 className="text-lg font-semibold">Automated moderation & activity summary</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-gray-700 text-gray-200" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button size="sm" variant="outline" className="border-gray-700 text-gray-200" disabled>
            ⚙️ Configure
          </Button>
        </div>
      </div>

      {hasAnomalies ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-100">
          <AlertTriangle className="h-4 w-4" />
          <span>Anomaly detected – review moderation activity</span>
        </div>
      ) : null}

      <div className="space-y-2 text-gray-200">
        <p className="font-semibold text-white">{data?.summary || 'AI is analyzing your data...'}</p>
        <div className="space-y-1">
          {(data?.insights || []).map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
        {data?.recommendation ? (
          <div className="flex items-start gap-2 text-sm text-gray-200">
            <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5" />
            <span>{data.recommendation}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Last analyzed: {data?.generated_at ? new Date(data.generated_at).toLocaleString() : '—'}</span>
        {hasAnomalies ? <Badge className="bg-amber-500 text-black">Anomaly</Badge> : <Badge className="bg-gray-900 border-gray-800">Stable</Badge>}
      </div>
    </Card>
  );
}

