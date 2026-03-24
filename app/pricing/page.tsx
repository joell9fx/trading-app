'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useCheckout } from '@/components/dashboard/use-checkout';
import {
  SERVICES_CATALOG,
  INCLUDED_SERVICE_KEYS,
  type ServiceCatalogItem,
} from '@/lib/services-catalog';
import { deriveAccessFromProfile, type AccessModuleKey } from '@/lib/access-flags';

type AccessMap = Record<string, boolean>;

const PLAN_ORDER = ['signals', 'gold_to_glory', 'elite_membership', 'vip_membership'] as const;
const PLAN_FEATURES: Record<string, string[]> = {
  signals: [
    'Daily structured trade setups',
    'Risk-first entry, stop, and invalidation levels',
    'Member dashboard signal feed',
  ],
  gold_to_glory: [
    'Challenge-style progression framework',
    'Transparent setup and performance updates',
    'Process-first challenge journaling',
  ],
  elite_membership: [
    'Everything in Signals + Gold to Glory',
    'Priority dashboard updates and premium insights',
    'Best-value membership for serious traders',
  ],
  vip_membership: [
    'Top-tier ecosystem access',
    'Highest-priority support and concierge routing',
    'VIP-level private member positioning',
  ],
};

export default function PricingPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const { handleCheckout, loadingKey } = useCheckout();
  const [userId, setUserId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [access, setAccess] = useState<AccessMap>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  useEffect(() => {
    fetch('/api/products/availability', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => setAvailability(json?.availability || {}))
      .catch(() => setAvailability({}));
  }, []);

  useEffect(() => {
    if (!userId) {
      setAccess({});
      return;
    }
    Promise.all([
      supabase
        .from('profiles')
        .select('has_signals_access, has_funding_access, has_courses_access, has_mentorship_access')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('user_services')
        .select('service_key, is_unlocked')
        .eq('user_id', userId)
        .eq('is_unlocked', true),
    ]).then(([profileRes, servicesRes]) => {
      const base = deriveAccessFromProfile(profileRes.data ?? {});
      const next: AccessMap = {};
      PLAN_ORDER.forEach((key) => {
        next[key] = !!base[key as AccessModuleKey];
      });
      if (!servicesRes.error && servicesRes.data) {
        servicesRes.data.forEach((row) => {
          const k = row.service_key;
          if (k && typeof row.is_unlocked === 'boolean') {
            next[k] = !!next[k] || !!row.is_unlocked;
          }
        });
      }
      setAccess(next);
    });
  }, [supabase, userId]);

  const paidPlans = SERVICES_CATALOG.filter((s) =>
    PLAN_ORDER.includes(s.key as (typeof PLAN_ORDER)[number]),
  );
  const included = SERVICES_CATALOG.filter((s) =>
    INCLUDED_SERVICE_KEYS.includes(s.key as (typeof INCLUDED_SERVICE_KEYS)[number]),
  );

  const onUnlock = (serviceKey: string) => {
    if (!userId) {
      window.location.href = `/signin?redirectTo=${encodeURIComponent('/pricing')}`;
      return;
    }
    handleCheckout(serviceKey);
  };

  const ctaFor = (plan: ServiceCatalogItem) => {
    const isUnlocked = !!access[plan.key];
    const sellable = !!availability[plan.key];
    if (isUnlocked) {
      return (
        <Link href={`/dashboard?section=${plan.section}`} className="w-full">
          <Button className="w-full min-h-11">Enter Dashboard</Button>
        </Link>
      );
    }
    if (!sellable) {
      return (
        <Button className="w-full min-h-11" variant="outline" disabled>
          Coming Soon
        </Button>
      );
    }
    return (
      <Button
        className="w-full min-h-11"
        onClick={() => onUnlock(plan.key)}
        disabled={loadingKey === plan.key}
      >
        {loadingKey === plan.key ? 'Starting checkout...' : 'Unlock Access'}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-page">
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Private Premium Dashboard
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Premium trader infrastructure for disciplined growth
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Unlock the services you need: structured signals, challenge progression, and premium
              member access inside one private SaaS platform.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paidPlans.map((plan) => (
            <Card
              key={plan.key}
              className={`p-5 border-border bg-panel ${
                plan.key === 'elite_membership' ? 'ring-1 ring-primary/40' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                {plan.priceLabel ? (
                  <span className="text-[10px] uppercase tracking-wide rounded-full px-2 py-1 bg-elevated text-muted-foreground">
                    {plan.priceLabel}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.positioning}</p>
              <ul className="mt-4 space-y-2 text-sm text-foreground/90">
                {(PLAN_FEATURES[plan.key] || []).map((f) => (
                  <li key={f}>- {f}</li>
                ))}
              </ul>
              <div className="mt-5">{ctaFor(plan)}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-14 bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground">Included with every member account</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {included.map((item) => (
              <Card key={item.key} className="p-4 border-border bg-panel">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground">FAQ</h2>
          <div className="mt-5 space-y-4">
            <Card className="p-4 border-border bg-panel">
              <p className="font-medium text-foreground">How are payments handled?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Payments are securely processed through Stripe. Unlock happens automatically after
                successful checkout.
              </p>
            </Card>
            <Card className="p-4 border-border bg-panel">
              <p className="font-medium text-foreground">Is this a public signal group?</p>
              <p className="text-sm text-muted-foreground mt-1">
                No. This is a private, premium member dashboard focused on structure, risk, and
                process-driven execution.
              </p>
            </Card>
          </div>
          {!userId && (
            <div className="mt-8 flex gap-3">
              <Link href="/signup">
                <Button>Create account</Button>
              </Link>
              <Link href="/signin">
                <Button variant="outline">Sign in</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
