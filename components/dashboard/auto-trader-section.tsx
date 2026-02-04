'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { CpuChipIcon, ShieldCheckIcon, ChartBarIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface AutoTraderSectionProps {
  hasAccess?: boolean;
}

export default function AutoTraderSection({ hasAccess = false }: AutoTraderSectionProps) {
  const router = useRouter();

  const stats = [
    { label: 'Daily change', value: '+1.8%', tone: 'text-emerald-300', bg: 'bg-emerald-500/10' },
    { label: 'This week', value: '+4.2%', tone: 'text-emerald-200', bg: 'bg-emerald-500/5' },
    { label: 'This month', value: '+11.6%', tone: 'text-emerald-200', bg: 'bg-emerald-500/5' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Automation</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white flex items-center gap-2">
            <CpuChipIcon className="h-7 w-7 text-gold-300" />
            Auto Trader
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
            A disciplined automation layer that executes pre-vetted strategies with defined risk controls. Review performance, then unlock setup when you’re ready.
          </p>
        </div>
        <Badge variant="outline" className={`border ${hasAccess ? 'border-emerald-400 text-emerald-200' : 'border-white/20 text-gray-200'} hidden sm:inline-flex`}>
          {hasAccess ? 'Active' : 'Locked'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-6 bg-white/5 border border-white/10 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">How it works</p>
              <h2 className="text-xl font-semibold text-white">Risk-aware automation</h2>
            </div>
            <Badge className="bg-white/10 text-gray-100 border border-white/15">Read-only overview</Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <div className="flex gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-gold-300 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Predefined entry & exits</p>
                <p className="text-gray-400">Strategies submit orders with pre-set entry, stop, and take-profit logic—no discretionary overrides.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-gold-300 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Risk controls per position</p>
                <p className="text-gray-400">Max position sizing, daily loss guardrails, and pause conditions keep automation aligned with risk policy.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-gold-300 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Audit trail & transparency</p>
                <p className="text-gray-400">Every run is logged with timestamps, inputs, and outputs so you can review decisions before enabling live trading.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Performance</p>
              <h3 className="text-lg font-semibold text-white">Current snapshot</h3>
            </div>
            <ChartBarIcon className="h-5 w-5 text-gold-300" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className={`rounded-xl border border-white/10 ${stat.bg} px-3 py-3`}>
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className={`text-xl font-semibold ${stat.tone}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Values are indicative and for reference. No execution occurs unless you explicitly enable Auto Trader in Setup.
          </p>
        </Card>
      </div>

      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Performance tracking</p>
            <h3 className="text-lg font-semibold text-white">Daily / Weekly / Monthly</h3>
            <p className="text-sm text-gray-300 mt-1">Read-only view to keep trust high and expectations realistic.</p>
          </div>
          <Badge className="bg-white/10 text-gray-100 border border-white/15">Read only</Badge>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
              <p className="text-[11px] text-gray-500 mt-2">Transparent, non-marketing figures.</p>
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 flex flex-col justify-center">
            <p className="text-sm text-white font-semibold">Equity curve placeholder</p>
            <p className="text-xs text-gray-400 mt-1">Plug in chart component here when data is ready.</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white/5 border border-white/10 relative overflow-hidden">
        {!hasAccess && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="text-center space-y-3 px-6">
              <LockClosedIcon className="h-10 w-10 text-gold-300 mx-auto" />
              <p className="text-white font-semibold">Auto Trader setup is locked</p>
              <p className="text-sm text-gray-300">Upgrade to unlock connections, risk controls, and live automation.</p>
              <Button
                className="bg-gold-500 hover:bg-gold-400 text-black w-full sm:w-auto"
                onClick={() => router.push('/dashboard/upgrade')}
              >
                Unlock Auto Trader
              </Button>
            </div>
          </div>
        )}

        <div className={`space-y-4 ${!hasAccess ? 'opacity-50 pointer-events-none select-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Setup</p>
              <h3 className="text-lg font-semibold text-white">Enable Auto Trader</h3>
            </div>
            <Badge className={hasAccess ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' : 'bg-white/10 text-gray-200 border-white/15'}>
              {hasAccess ? 'Active' : 'Locked'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StepCard title="1. Connect broker" detail="Link your trading account securely (read + trade permission only)." />
            <StepCard title="2. Set risk guardrails" detail="Daily loss cap, max position size, and pair whitelist." />
            <StepCard title="3. Review & enable" detail="Dry-run simulation before flipping live trading on." />
          </div>

          {hasAccess ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-100">Connected</span>
                <span className="px-2 py-1 rounded-full bg-white/10 border border-white/15 text-gray-100">Automation off (manual start)</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="bg-gold-500 hover:bg-gold-400 text-black">
                  Open connection settings
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  View recent runs
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Upgrade your plan to access setup and live automation controls.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function StepCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-sm text-gray-400 mt-1">{detail}</p>
    </div>
  );
}
