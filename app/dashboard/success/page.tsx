'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useUserServices } from '@/components/dashboard/use-user-services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SERVICE_BY_KEY } from '@/lib/services-catalog';

function resolvePostCheckoutTarget(serviceParam: string | null): {
  dashboardPath: string;
  serviceKnown: boolean;
} {
  const raw = serviceParam?.trim() || '';
  if (!raw) {
    return { dashboardPath: '/dashboard?section=overview', serviceKnown: false };
  }
  const catalog = SERVICE_BY_KEY[raw as keyof typeof SERVICE_BY_KEY];
  if (!catalog) {
    if (typeof window !== 'undefined') {
      console.warn('[dashboard/success] unknown service query param', raw);
    }
    return { dashboardPath: '/dashboard?section=overview', serviceKnown: false };
  }
  if (catalog.status === 'coming_soon') {
    return { dashboardPath: '/dashboard?section=overview', serviceKnown: false };
  }
  return { dashboardPath: `/dashboard?section=${catalog.section}`, serviceKnown: true };
}

function DashboardSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'auth' | 'working' | 'error' | 'stale'>('auth');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { refresh } = useUserServices(userId ?? undefined);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const serviceParam = searchParams.get('service');
  const { dashboardPath, serviceKnown } = useMemo(
    () => resolvePostCheckoutTarget(serviceParam),
    [serviceParam],
  );

  const clearStaleTimer = useCallback(() => {
    if (staleTimerRef.current) {
      clearTimeout(staleTimerRef.current);
      staleTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearStaleTimer();
  }, [clearStaleTimer]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) {
        setUserId(data.user.id);
        setPhase('working');
      } else {
        const next = `/signin?redirectTo=${encodeURIComponent(
          `/dashboard/success${serviceParam ? `?service=${encodeURIComponent(serviceParam)}` : ''}`,
        )}`;
        router.replace(next);
      }
    });
  }, [supabase, router, serviceParam]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    staleTimerRef.current = setTimeout(() => {
      setPhase((p) => (p === 'working' ? 'stale' : p));
    }, 12000);

    (async () => {
      const ok = await refresh({ quiet: true });
      if (cancelled) return;
      clearStaleTimer();
      if (!ok) {
        setErrorMessage('We could not refresh your access from the server. You can open the dashboard and try again in a moment.');
        setPhase('error');
        if (typeof window !== 'undefined') {
          console.warn('[dashboard/success] access refresh failed after checkout');
        }
        return;
      }

      if (typeof window !== 'undefined') {
        console.info('[dashboard/success] redirecting after refresh', {
          target: dashboardPath,
          serviceParam,
          serviceKnown,
        });
      }
      router.replace(dashboardPath);
    })();

    return () => {
      cancelled = true;
      clearStaleTimer();
    };
  }, [userId, refresh, router, dashboardPath, serviceParam, serviceKnown, clearStaleTimer]);

  const retry = useCallback(async () => {
    setPhase('working');
    setErrorMessage(null);
    const ok = await refresh({ quiet: true });
    if (!ok) {
      setErrorMessage('Still could not load access. Check your connection or wait a few seconds if payment just completed.');
      setPhase('error');
      return;
    }
    router.replace(dashboardPath);
  }, [refresh, router, dashboardPath]);

  if (phase === 'auth') {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full bg-panel border border-border-subtle text-foreground">
          <p className="text-sm text-muted-foreground">Confirming your session…</p>
        </Card>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full space-y-4 bg-panel border border-border-subtle text-foreground">
          <div>
            <h1 className="text-lg font-semibold">Payment received</h1>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            {!serviceKnown && serviceParam ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Unrecognized service in the return link — you will land on the dashboard overview.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="min-h-11" onClick={() => retry()}>
              Refresh access
            </Button>
            <Button variant="outline" className="min-h-11" asChild>
              <Link href={dashboardPath}>Continue to dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === 'stale') {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full space-y-4 bg-panel border border-border-subtle text-foreground">
          <div>
            <h1 className="text-lg font-semibold">Taking longer than expected</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment may still be finalizing. You can open the dashboard — if a section stays locked,
              wait a moment and refresh the page.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="min-h-11" onClick={() => retry()}>
              Try again
            </Button>
            <Button variant="outline" className="min-h-11" asChild>
              <Link href={dashboardPath}>Go to dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <Card className="p-6 max-w-md w-full bg-panel border border-border-subtle text-foreground">
        <p className="text-sm text-foreground/90">Updating your access…</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {!serviceKnown && !serviceParam
            ? 'Sending you to your dashboard overview.'
            : !serviceKnown
              ? 'Sending you to your dashboard.'
              : 'Redirecting to your unlocked area.'}
        </p>
      </Card>
    </div>
  );
}

export default function DashboardSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-page flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-panel border border-border-subtle text-foreground">
            <p className="text-sm text-muted-foreground">Loading…</p>
          </Card>
        </div>
      }
    >
      <DashboardSuccessContent />
    </Suspense>
  );
}
