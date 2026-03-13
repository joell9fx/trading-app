'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useUserServices } from '@/components/dashboard/use-user-services';
import { Card } from '@/components/ui/card';

function sectionForService(service: string | null): string {
  switch (service) {
    case 'signals':
      return 'signals';
    case 'gold_to_glory':
      return 'gold-to-glory';
    case 'elite_membership':
      return 'elite-membership';
    case 'vip_membership':
      return 'vip-membership';
    default:
      return 'overview';
  }
}

function DashboardSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const { refresh } = useUserServices(userId ?? undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) {
        setUserId(data.user.id);
      } else {
        router.replace('/signin');
      }
    });
  }, [supabase, router]);

  useEffect(() => {
    if (!userId) return;
    const service = searchParams.get('service');
    const targetSection = sectionForService(service);
    (async () => {
      await refresh();
      router.replace(`/dashboard?section=${targetSection}`);
    })();
  }, [refresh, router, searchParams, userId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Card className="p-6 bg-white/5 border border-white/10 text-white">
        Updating your access... please wait.
      </Card>
    </div>
  );
}

export default function DashboardSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="p-6 bg-white/5 border border-white/10 text-white">
          Loading...
        </Card>
      </div>
    }>
      <DashboardSuccessContent />
    </Suspense>
  );
}
