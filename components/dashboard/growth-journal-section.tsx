'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import Link from 'next/link';
import {
  BookOpenIcon,
  PlusIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const JOURNAL_SCREENSHOTS_BUCKET = 'journal-screenshots';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SCREENSHOT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function sanitizeStorageFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 80);
  return base || 'screenshot';
}

/** UI shape for journal entries (camelCase). */
export interface GrowthJournalEntry {
  id: string;
  title: string;
  date: string;
  tradeId: string;
  pair: string;
  session: string;
  strategyUsed: string;
  resultR: string | number;
  mood: string;
  screenshotUrl: string;
  whatWentWell: string;
  mistakesMade: string;
  lessonLearned: string;
  planForNextSession: string;
  setupType: string;
  timeframe: string;
  bias: string;
  confidenceScore: number | null;
  ruleFollowed: boolean | null;
  executionQuality: number | null;
  createdAt: string;
}

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

function rowToEntry(row: JournalEntryRow): GrowthJournalEntry {
  return {
    id: row.id,
    title: row.title,
    date: row.entry_date,
    tradeId: row.trade_id ?? '',
    pair: row.pair ?? '',
    session: row.session ?? '',
    strategyUsed: row.strategy_used ?? '',
    resultR: row.result_r ?? '',
    mood: row.mood ?? '',
    screenshotUrl: row.screenshot_url ?? '',
    whatWentWell: row.what_went_well ?? '',
    mistakesMade: row.mistakes_made ?? '',
    lessonLearned: row.lesson_learned ?? '',
    planForNextSession: row.plan_for_next_session ?? '',
    setupType: row.setup_type ?? '',
    timeframe: row.timeframe ?? '',
    bias: row.bias ?? '',
    confidenceScore: row.confidence_score ?? null,
    ruleFollowed: row.rule_followed ?? null,
    executionQuality: row.execution_quality ?? null,
    createdAt: row.created_at,
  };
}

const MOOD_OPTIONS = [
  'Focused',
  'Calm',
  'Anxious',
  'Confident',
  'Frustrated',
  'Neutral',
  'Excited',
  'Tired',
];

const SETUP_TYPE_OPTIONS = [
  'Breakout',
  'Pullback',
  'SMC',
  'Supply/Demand',
  'Trend follow',
  'Reversal',
  'Other',
];

const TIMEFRAME_OPTIONS = ['1m', '5m', '15m', '1H', '4H', 'D1', 'W1', 'Other'];

const BIAS_OPTIONS = ['Bullish', 'Bearish', 'Neutral'];

function parseR(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = value.trim().replace(/,/g, '').replace(/[Rr]/g, '');
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseConfidence(value: string | number): number | null {
  if (value === '' || value == null) return null;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isFinite(n) && n >= 1 && n <= 10 ? n : null;
}

function parseRuleFollowed(value: string | boolean): boolean | null {
  if (value === '' || value == null) return null;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase();
  if (s === 'yes' || s === 'true') return true;
  if (s === 'no' || s === 'false') return false;
  return null;
}

function parseExecutionQuality(value: string | number): number | null {
  if (value === '' || value == null) return null;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isFinite(n) && n >= 1 && n <= 10 ? n : null;
}

/** Parse form Result (R) to a number; strips "R"/"r" and uses parseFloat. Returns null if empty, number if valid, NaN if invalid. */
function parseResultRInput(value: string): number | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  const stripped = trimmed.replace(/[Rr]/g, '').replace(/,/g, '').trim();
  const n = parseFloat(stripped);
  return Number.isFinite(n) ? n : NaN;
}

function normalizeMistakePhrase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.!?,;:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function extractMistakePhrases(entries: GrowthJournalEntry[]): { phrase: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const text = (e.mistakesMade || '').trim();
    if (!text) continue;
    const sentences = text.split(/[.!?]+/).map((s) => normalizeMistakePhrase(s)).filter(Boolean);
    const seen = new Set<string>();
    for (const s of sentences) {
      if (s.length < 4) continue;
      if (!seen.has(s)) {
        seen.add(s);
        counts[s] = (counts[s] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getEmptyForm() {
  return {
    title: '',
    date: new Date().toISOString().slice(0, 10),
    tradeId: '',
    pair: '',
    session: '',
    strategyUsed: '',
    resultR: '',
    mood: '',
    screenshotUrl: '',
    whatWentWell: '',
    mistakesMade: '',
    lessonLearned: '',
    planForNextSession: '',
    setupType: '',
    timeframe: '',
    bias: '',
    confidenceScore: '',
    ruleFollowed: '',
    executionQuality: '',
  };
}

type FormState = ReturnType<typeof getEmptyForm>;

function entryToForm(entry: GrowthJournalEntry): FormState {
  return {
    title: entry.title,
    date: entry.date,
    tradeId: entry.tradeId,
    pair: entry.pair,
    session: entry.session,
    strategyUsed: entry.strategyUsed,
    resultR: entry.resultR == null ? '' : String(entry.resultR),
    mood: entry.mood,
    screenshotUrl: entry.screenshotUrl ?? '',
    whatWentWell: entry.whatWentWell,
    mistakesMade: entry.mistakesMade,
    lessonLearned: entry.lessonLearned,
    planForNextSession: entry.planForNextSession,
    setupType: entry.setupType ?? '',
    timeframe: entry.timeframe ?? '',
    bias: entry.bias ?? '',
    confidenceScore: entry.confidenceScore != null ? String(entry.confidenceScore) : '',
    ruleFollowed: entry.ruleFollowed === null ? '' : entry.ruleFollowed ? 'yes' : 'no',
    executionQuality: entry.executionQuality != null ? String(entry.executionQuality) : '',
  };
}

export function GrowthJournalSection() {
  const [entries, setEntries] = useState<GrowthJournalEntry[]>([]);
  const [form, setForm] = useState(getEmptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const fetchEntries = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoadError(null);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setLoadError(error.message);
      setEntries([]);
      toast({ title: 'Could not load journal', description: error.message, variant: 'destructive' });
    } else {
      setEntries(((data as JournalEntryRow[] | null) ?? []).map(rowToEntry));
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const analytics = useMemo(() => {
    const totalEntries = entries.length;
    const totalR = entries.reduce((sum, e) => sum + parseR(e.resultR), 0);
    const avgR = totalEntries > 0 ? totalR / totalEntries : 0;

    const byStrategy: Record<string, { count: number; totalR: number }> = {};
    for (const e of entries) {
      const key = (e.strategyUsed || 'Unset').trim() || 'Unset';
      if (!byStrategy[key]) byStrategy[key] = { count: 0, totalR: 0 };
      byStrategy[key].count += 1;
      byStrategy[key].totalR += parseR(e.resultR);
    }
    const bestStrategy = Object.entries(byStrategy)
      .map(([name, d]) => ({ name, ...d, avgR: d.count ? d.totalR / d.count : 0 }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.avgR - a.avgR)[0];

    const bySession: Record<string, { count: number; totalR: number }> = {};
    for (const e of entries) {
      const key = (e.session || 'Unset').trim() || 'Unset';
      if (!bySession[key]) bySession[key] = { count: 0, totalR: 0 };
      bySession[key].count += 1;
      bySession[key].totalR += parseR(e.resultR);
    }
    const bestSession = Object.entries(bySession)
      .map(([name, d]) => ({ name, ...d, avgR: d.count ? d.totalR / d.count : 0 }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.avgR - a.avgR)[0];

    const topMistakes = extractMistakePhrases(entries);

    return {
      totalEntries,
      totalR,
      avgR,
      bestStrategy: bestStrategy?.name ?? '—',
      bestSession: bestSession?.name ?? '—',
      topMistakes,
    };
  }, [entries]);

  const handleEdit = useCallback((entry: GrowthJournalEntry) => {
    setForm(entryToForm(entry));
    setEditingEntryId(entry.id);
    setScreenshotFile(null);
    setScreenshotError(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingEntryId(null);
    setForm(getEmptyForm());
    setScreenshotFile(null);
    setScreenshotError(null);
  }, []);

  const handleDelete = useCallback(
    async (entry: GrowthJournalEntry) => {
      if (!window.confirm('Delete this journal entry? This cannot be undone.')) return;
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user ?? null;
      if (!user) {
        toast({ title: 'Sign in required', description: 'Please sign in to delete entries.', variant: 'destructive' });
        return;
      }
      setDeletingEntryId(entry.id);
      try {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', entry.id)
          .eq('user_id', user.id);
        if (error) throw error;
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        if (editingEntryId === entry.id) {
          setEditingEntryId(null);
          setForm(getEmptyForm());
          setScreenshotFile(null);
          setScreenshotError(null);
        }
        toast({ title: 'Entry deleted', description: 'The journal entry was removed.' });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Could not delete entry.';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setDeletingEntryId(null);
      }
    },
    [supabase, toast, editingEntryId]
  );

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title required', description: 'Add a title for this entry.', variant: 'destructive' });
      return;
    }
    const parsedR = parseResultRInput(form.resultR);
    if (form.resultR.trim() !== '' && (parsedR === null || Number.isNaN(parsedR))) {
      toast({ title: 'Invalid Result (R)', description: 'Enter a number, e.g. 3, 2.5, or -0.5.', variant: 'destructive' });
      return;
    }
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to save journal entries.', variant: 'destructive' });
      return;
    }
    if (screenshotFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(screenshotFile.type)) {
        setScreenshotError('Please choose a JPEG, PNG, WebP, or GIF image.');
        toast({ title: 'Invalid image', description: 'Use JPEG, PNG, WebP, or GIF.', variant: 'destructive' });
        return;
      }
      if (screenshotFile.size > MAX_SCREENSHOT_SIZE_BYTES) {
        setScreenshotError('Image must be 5MB or smaller.');
        toast({ title: 'Image too large', description: 'Maximum size is 5MB.', variant: 'destructive' });
        return;
      }
      setScreenshotError(null);
    }
    setSaving(true);
    try {
      let screenshotUrl: string | null = form.screenshotUrl.trim() || null;
      if (screenshotFile && user) {
        const base = screenshotFile.name.replace(/\.[^.]+$/, '') || 'screenshot';
        const ext = (screenshotFile.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
        const safeName = `${sanitizeStorageFileName(base)}.${ext}`;
        const storagePath = `${user.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from(JOURNAL_SCREENSHOTS_BUCKET)
          .upload(storagePath, screenshotFile, { cacheControl: '3600', upsert: false });
        if (uploadError) {
          console.error('[GrowthJournal] Screenshot upload failed:', uploadError);
          throw new Error(uploadError.message || 'Screenshot upload failed.');
        }
        const { data: urlData } = supabase.storage.from(JOURNAL_SCREENSHOTS_BUCKET).getPublicUrl(storagePath);
        screenshotUrl = urlData.publicUrl;
      }
      const payload = {
        title: form.title.trim(),
        entry_date: form.date,
        trade_id: form.tradeId.trim() || null,
        pair: form.pair.trim() || null,
        session: form.session.trim() || null,
        strategy_used: form.strategyUsed.trim() || null,
        result_r: parsedR !== null ? String(parsedR) : null,
        mood: form.mood.trim() || null,
        screenshot_url: screenshotUrl,
        what_went_well: form.whatWentWell.trim() || null,
        mistakes_made: form.mistakesMade.trim() || null,
        lesson_learned: form.lessonLearned.trim() || null,
        plan_for_next_session: form.planForNextSession.trim() || null,
        setup_type: form.setupType.trim() || null,
        timeframe: form.timeframe.trim() || null,
        bias: form.bias.trim() || null,
        confidence_score: parseConfidence(form.confidenceScore),
        rule_followed: parseRuleFollowed(form.ruleFollowed),
        execution_quality: parseExecutionQuality(form.executionQuality),
      };

      if (editingEntryId) {
        const { data, error } = await supabase
          .from('journal_entries')
          .update(payload)
          .eq('id', editingEntryId)
          .eq('user_id', user.id)
          .select('*')
          .single();
        if (error) throw error;
        const updated = rowToEntry(data as JournalEntryRow);
        setEntries((prev) => prev.map((e) => (e.id === editingEntryId ? updated : e)));
        setForm(getEmptyForm());
        setScreenshotFile(null);
        setScreenshotError(null);
        setEditingEntryId(null);
        toast({ title: 'Entry updated', description: 'Your journal entry was updated.' });
      } else {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            ...payload,
          })
          .select('*')
          .single();
        if (error) throw error;
        const newEntry = rowToEntry(data as JournalEntryRow);
        setEntries((prev) => [newEntry, ...prev]);
        setForm(getEmptyForm());
        setScreenshotFile(null);
        setScreenshotError(null);
        toast({ title: 'Entry saved', description: 'Your journal entry was saved.' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not save entry.';
      console.error('[GrowthJournal] Save/update failed:', err);
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Growth Journal</h1>
        <p className="mt-1 text-gray-400 text-sm sm:text-base">
          Log trades, tag strategies and sessions, and track performance with R-multiples and lessons learned.
        </p>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-gray-400 text-sm">
          Loading journal entries…
        </div>
      )}

      {/* Analytics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Entries</p>
            <p className="text-xl font-bold text-white mt-0.5">{analytics.totalEntries}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ChartBarIcon className="h-3.5 w-3.5" /> Total R
            </p>
            <p className="text-xl font-bold text-white mt-0.5">{analytics.totalR.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Avg R</p>
            <p className="text-xl font-bold text-white mt-0.5">{analytics.avgR.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <TrophyIcon className="h-3.5 w-3.5" /> Best strategy
            </p>
            <p className="text-sm font-semibold text-gold-400 mt-0.5 truncate" title={analytics.bestStrategy}>
              {analytics.bestStrategy}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" /> Best session
            </p>
            <p className="text-sm font-semibold text-gold-400 mt-0.5 truncate" title={analytics.bestSession}>
              {analytics.bestSession}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ExclamationTriangleIcon className="h-3.5 w-3.5" /> Top mistake
            </p>
            <p className="text-sm text-gray-300 mt-0.5 line-clamp-2" title={analytics.topMistakes[0]?.phrase}>
              {analytics.topMistakes[0]?.phrase ?? '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New entry / Edit form */}
      <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              {editingEntryId ? (
                <>
                  <PencilSquareIcon className="h-5 w-5 text-gold-400" />
                  Edit entry
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 text-gold-400" />
                  New entry
                </>
              )}
            </h2>
            {editingEntryId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. London session EUR/USD"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Trade ID</label>
              <input
                type="text"
                value={form.tradeId}
                onChange={(e) => setForm((f) => ({ ...f, tradeId: e.target.value }))}
                placeholder="Optional reference ID"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Pair / Market</label>
              <input
                type="text"
                value={form.pair}
                onChange={(e) => setForm((f) => ({ ...f, pair: e.target.value }))}
                placeholder="e.g. EUR/USD, NAS100"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Session</label>
              <input
                type="text"
                value={form.session}
                onChange={(e) => setForm((f) => ({ ...f, session: e.target.value }))}
                placeholder="e.g. London open, NY afternoon"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Strategy used</label>
              <input
                type="text"
                value={form.strategyUsed}
                onChange={(e) => setForm((f) => ({ ...f, strategyUsed: e.target.value }))}
                placeholder="e.g. Breakout, SMC"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Result (R)</label>
              <input
                type="text"
                value={form.resultR}
                onChange={(e) => setForm((f) => ({ ...f, resultR: e.target.value }))}
                placeholder="e.g. 1.5, -0.5"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Mood</label>
              <select
                value={form.mood}
                onChange={(e) => setForm((f) => ({ ...f, mood: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select mood</option>
                {MOOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Setup type</label>
              <select
                value={form.setupType}
                onChange={(e) => setForm((f) => ({ ...f, setupType: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select setup</option>
                {SETUP_TYPE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Timeframe</label>
              <select
                value={form.timeframe}
                onChange={(e) => setForm((f) => ({ ...f, timeframe: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select timeframe</option>
                {TIMEFRAME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Bias</label>
              <select
                value={form.bias}
                onChange={(e) => setForm((f) => ({ ...f, bias: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select bias</option>
                {BIAS_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Confidence (1–10)</label>
              <select
                value={form.confidenceScore}
                onChange={(e) => setForm((f) => ({ ...f, confidenceScore: e.target.value }))}
                className={inputClass}
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={String(n)}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Rule followed</label>
              <select
                value={form.ruleFollowed}
                onChange={(e) => setForm((f) => ({ ...f, ruleFollowed: e.target.value }))}
                className={inputClass}
              >
                <option value="">—</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Execution quality (1–10)</label>
              <select
                value={form.executionQuality}
                onChange={(e) => setForm((f) => ({ ...f, executionQuality: e.target.value }))}
                className={inputClass}
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={String(n)}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="journal-screenshot-upload">
              <span className="flex items-center gap-2">
                <PhotoIcon className="h-4 w-4 text-gold-400" />
                Screenshot (optional)
              </span>
            </label>
            <input
              id="journal-screenshot-upload"
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setScreenshotError(null);
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                  setScreenshotError('Use JPEG, PNG, WebP, or GIF.');
                  return;
                }
                if (file.size > MAX_SCREENSHOT_SIZE_BYTES) {
                  setScreenshotError('Image must be 5MB or smaller.');
                  return;
                }
                setScreenshotFile(file);
                e.target.value = '';
              }}
            />
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/20 text-gray-200 hover:bg-white/10"
                onClick={() => document.getElementById('journal-screenshot-upload')?.click()}
              >
                Choose image
              </Button>
              {screenshotFile && (
                <span className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="truncate max-w-[180px]" title={screenshotFile.name}>{screenshotFile.name}</span>
                  <button
                    type="button"
                    onClick={() => { setScreenshotFile(null); setScreenshotError(null); }}
                    className="p-0.5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                    aria-label="Remove selected file"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
            {form.screenshotUrl.trim() && !screenshotFile && (
              <div className="mt-2 flex items-start gap-2">
                <img
                  src={form.screenshotUrl.trim()}
                  alt="Current screenshot"
                  className="h-20 w-32 object-cover rounded-lg border border-white/10 bg-white/5 shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-xs text-gray-500 self-center" aria-hidden>
                  Image could not be loaded
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                  onClick={() => setForm((f) => ({ ...f, screenshotUrl: '' }))}
                >
                  Remove screenshot
                </Button>
              </div>
            )}
            {screenshotError && (
              <p className="text-sm text-red-400 mt-1">{screenshotError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP or GIF, max 5MB. Or paste a URL below.</p>
            <input
              type="url"
              value={form.screenshotUrl}
              onChange={(e) => setForm((f) => ({ ...f, screenshotUrl: e.target.value }))}
              placeholder="Or paste image URL"
              className={`${inputClass} mt-2`}
            />
          </div>
          <div>
            <label className={labelClass}>What went well</label>
            <textarea
              value={form.whatWentWell}
              onChange={(e) => setForm((f) => ({ ...f, whatWentWell: e.target.value }))}
              placeholder="Wins and good decisions..."
              rows={2}
              className={`${inputClass} resize-y min-h-[80px]`}
            />
          </div>
          <div>
            <label className={labelClass}>Mistakes made</label>
            <textarea
              value={form.mistakesMade}
              onChange={(e) => setForm((f) => ({ ...f, mistakesMade: e.target.value }))}
              placeholder="What would you do differently?"
              rows={2}
              className={`${inputClass} resize-y min-h-[80px]`}
            />
          </div>
          <div>
            <label className={labelClass}>Lesson learned</label>
            <textarea
              value={form.lessonLearned}
              onChange={(e) => setForm((f) => ({ ...f, lessonLearned: e.target.value }))}
              placeholder="Key takeaway from this session..."
              rows={2}
              className={`${inputClass} resize-y min-h-[80px]`}
            />
          </div>
          <div>
            <label className={labelClass}>Plan for next session</label>
            <textarea
              value={form.planForNextSession}
              onChange={(e) => setForm((f) => ({ ...f, planForNextSession: e.target.value }))}
              placeholder="What will you focus on next time?"
              rows={2}
              className={`${inputClass} resize-y min-h-[80px]`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-xl px-6"
            >
              {saving ? (editingEntryId ? 'Updating…' : 'Saving…') : editingEntryId ? 'Update entry' : 'Save entry'}
            </Button>
            {editingEntryId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/20 text-gray-300"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent entries */}
      <Card className="border-white/10 bg-white/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-gold-400" />
            Recent entries
          </h2>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Loading entries…</div>
          ) : entries.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm">No entries yet.</p>
              <p className="text-gray-500 text-xs mt-1">Add one above to start your trading journal and see analytics here.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {entries.slice(0, 15).map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-white">{entry.title}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {new Date(entry.date).toLocaleDateString()}
                        {entry.pair && ` · ${entry.pair}`}
                        {entry.session && ` · ${entry.session}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {entry.resultR && (
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded ${parseR(entry.resultR) >= 0 ? 'text-emerald-400 bg-emerald-500/20' : 'text-red-400 bg-red-500/20'}`}>
                          {entry.resultR} R
                        </span>
                      )}
                      {entry.mood && (
                        <span className="text-xs text-gray-400">{entry.mood}</span>
                      )}
                      <div className="flex items-center gap-1 ml-1">
                        <Link
                          href={`/dashboard/trade-review/${entry.id}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:text-gold-400 hover:bg-white/10 transition"
                          title="Review trade"
                          aria-label="Review trade"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gold-400 hover:bg-white/10"
                          onClick={() => handleEdit(entry)}
                          disabled={deletingEntryId === entry.id}
                          aria-label="Edit entry"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-w-[2rem] h-8 px-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(entry)}
                          disabled={deletingEntryId !== null}
                          aria-label="Delete entry"
                        >
                          {deletingEntryId === entry.id ? (
                            <span className="text-xs">Deleting…</span>
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {(entry.strategyUsed || entry.tradeId) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {entry.strategyUsed && (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300">{entry.strategyUsed}</span>
                      )}
                      {entry.tradeId && (
                        <span className="text-gray-500">ID: {entry.tradeId}</span>
                      )}
                    </div>
                  )}
                  {(entry.setupType || entry.timeframe || entry.bias || entry.confidenceScore != null || entry.ruleFollowed !== null || entry.executionQuality != null) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {entry.setupType && (
                        <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-300">{entry.setupType}</span>
                      )}
                      {entry.timeframe && (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300">{entry.timeframe}</span>
                      )}
                      {entry.bias && (
                        <span className={`px-2 py-0.5 rounded ${entry.bias.toLowerCase() === 'bullish' ? 'bg-emerald-500/20 text-emerald-300' : entry.bias.toLowerCase() === 'bearish' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-gray-300'}`}>
                          {entry.bias}
                        </span>
                      )}
                      {entry.confidenceScore != null && (
                        <span className="text-gray-500">Conf: {entry.confidenceScore}</span>
                      )}
                      {entry.ruleFollowed === true && (
                        <span className="text-emerald-400">Rule ✓</span>
                      )}
                      {entry.ruleFollowed === false && (
                        <span className="text-amber-400">Rule ✗</span>
                      )}
                      {entry.executionQuality != null && (
                        <span className="text-gray-500">Exec: {entry.executionQuality}</span>
                      )}
                    </div>
                  )}
                  {entry.lessonLearned && (
                    <p className="text-gray-300 text-sm line-clamp-2">{entry.lessonLearned}</p>
                  )}
                  {entry.mistakesMade && (
                    <p className="text-gray-400 text-xs line-clamp-1">
                      <span className="text-gray-500">Mistakes:</span> {entry.mistakesMade}
                    </p>
                  )}
                  {entry.screenshotUrl && (
                    <div className="mt-2">
                      <img
                        src={entry.screenshotUrl}
                        alt="Trade screenshot"
                        className="h-20 w-32 object-cover rounded-lg border border-white/10 bg-white/5"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
