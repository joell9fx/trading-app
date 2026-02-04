'use client';

import { ReactNode } from 'react';

export default function ActionButtons({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

