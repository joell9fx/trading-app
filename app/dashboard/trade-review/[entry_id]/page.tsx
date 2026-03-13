'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { TradeAnnotationEditor } from '@/components/dashboard/trade-annotation-editor';
import type { AnnotationData } from '@/lib/dashboard/trade-annotation-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];
type TradeAnnotationRow = Database['public']['Tables']['trade_annotations']['Row'];

export default function TradeReviewPage() {
  const params = useParams();
  const router = useRouter();
  const entryId = typeof params.entry_id === 'string' ? params.entry_id : null;
  const [entry, setEntry] = useState<JournalEntryRow | null>(null);
  const [annotationRow, setAnnotationRow] = useState<TradeAnnotationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createSupabaseClient(), []);
  const { toast } = useToast();

  useEffect(() => {
    if (!entryId) {
      setLoading(false);
      setError('Missing entry ID');
      return;
    }
    let mounted = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !mounted) {
        if (mounted) {
          setError('Sign in required');
          setLoading(false);
        }
        return;
      }
      const { data: entryData, error: entryErr } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!mounted) return;
      if (entryErr) {
        setError(entryErr.message);
        setLoading(false);
        return;
      }
      if (!entryData) {
        setError('Entry not found');
        setLoading(false);
        return;
      }
      setEntry(entryData as JournalEntryRow);

      const { data: annData } = await supabase
        .from('trade_annotations')
        .select('*')
        .eq('journal_entry_id', entryId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (mounted) setAnnotationRow((annData as TradeAnnotationRow | null) ?? null);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [entryId, supabase]);

  const handleSave = useCallback(
    async (data: AnnotationData) => {
      if (!entryId || !entry) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Sign in required', variant: 'destructive' });
        return;
      }
      const payload = {
        journal_entry_id: entryId,
        user_id: user.id,
        annotation_data: data,
        updated_at: new Date().toISOString(),
      };
      if (annotationRow) {
        const { error: updateErr } = await supabase
          .from('trade_annotations')
          .update({ annotation_data: payload.annotation_data, updated_at: payload.updated_at })
          .eq('id', annotationRow.id)
          .eq('user_id', user.id);
        if (updateErr) {
          toast({ title: 'Failed to save annotations', description: updateErr.message, variant: 'destructive' });
          return;
        }
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('trade_annotations')
          .insert(payload)
          .select('*')
          .single();
        if (insertErr) {
          toast({ title: 'Failed to save annotations', description: insertErr.message, variant: 'destructive' });
          return;
        }
        if (inserted) setAnnotationRow(inserted as TradeAnnotationRow);
      }
      toast({ title: 'Annotations saved' });
    },
    [entryId, entry, annotationRow, supabase, toast]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-gray-400">
            Loading…
          </div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            href="/dashboard?section=journal"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Growth Journal
          </Link>
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-6">
              <p className="text-red-200">{error ?? 'Entry not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const screenshotUrl = entry.screenshot_url?.trim();
  if (!screenshotUrl) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            href="/dashboard?section=journal"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Growth Journal
          </Link>
          <Card className="border-white/10 bg-white/5">
            <CardContent className="p-8 text-center">
              <p className="text-gray-300">This entry has no screenshot. Add a screenshot in the journal to annotate it.</p>
              <Button
                variant="outline"
                className="mt-4 border-gold-500/40 text-gold-300 hover:bg-gold-500/10"
                onClick={() => router.push('/dashboard?section=journal')}
              >
                Edit entry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/dashboard?section=journal"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Growth Journal
          </Link>
          <h1 className="text-xl font-semibold text-white truncate">
            {entry.title || 'Trade review'}
          </h1>
        </div>
        <TradeAnnotationEditor
          screenshotUrl={screenshotUrl}
          initialData={annotationRow?.annotation_data ?? []}
          journalEntryId={entry.id}
          onSave={handleSave}
          saveLabel="Save annotations"
        />
      </div>
    </div>
  );
}
