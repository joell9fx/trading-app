'use client';

import { useState, useEffect } from 'react';
import { VisionTimelineClient } from './timeline/vision-timeline-client';

type TimelineEvent = {
  date: string;
  type: string;
  title: string;
  description?: string;
  icon?: string;
};

export function VisionTimelineSection() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/timeline/view', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setTimeline(Array.isArray(data.timeline) ? data.timeline : []);
        } else {
          setTimeline([]);
        }
      } catch {
        setTimeline([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Vision Timeline</h1>
        <p className="mt-1 text-gray-400 text-sm sm:text-base">
          Your roadmap and milestones: badges, lessons, and journal highlights in one timeline.
        </p>
      </div>
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-gray-400 text-sm">
          Loading timeline…
        </div>
      ) : (
        <VisionTimelineClient timeline={timeline} />
      )}
    </div>
  );
}
