'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { NAV_GROUPS } from './dashboard-sidebar';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface CommandPaletteSection {
  id: string;
  name: string;
  group: string;
}

function flattenSections(): CommandPaletteSection[] {
  const out: CommandPaletteSection[] = [];
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (!item.external) {
        out.push({ id: item.id, name: item.name, group: group.label });
      }
    }
  }
  return out;
}

const ALL_SECTIONS = flattenSections();

interface DashboardCommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

export function DashboardCommandPalette({ open, onClose, onNavigate }: DashboardCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_SECTIONS;
    const q = query.trim().toLowerCase();
    return ALL_SECTIONS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.group.toLowerCase().includes(q)
    );
  }, [query]);

  const select = useCallback(
    (section: CommandPaletteSection) => {
      onNavigate(section.id);
      onClose();
      setQuery('');
      setSelectedIndex(0);
      router.replace(`/dashboard?section=${section.id}`, { scroll: false });
    },
    [onNavigate, onClose, router]
  );

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelectedIndex(0);
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(1, filtered.length));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % Math.max(1, filtered.length));
        return;
      }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        select(filtered[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex, onClose, select]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-page/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Navigate to section"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-elevated shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
          <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections…"
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground text-sm outline-none"
            autoFocus
            aria-label="Search"
          />
          <kbd className="hidden sm:inline text-[10px] text-muted-foreground px-1.5 py-0.5 rounded border border-border">Esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">No matching sections</p>
          ) : (
            <ul className="py-1">
              {filtered.map((section, i) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => select(section)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      i === selectedIndex ? 'bg-panel text-foreground' : 'text-foreground/80 hover:bg-panel'
                    }`}
                  >
                    <span className="font-medium truncate">{section.name}</span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider shrink-0">{section.group}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-4 py-2 border-t border-border-subtle flex items-center justify-between text-[10px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
        </div>
      </div>
    </div>
  );
}
