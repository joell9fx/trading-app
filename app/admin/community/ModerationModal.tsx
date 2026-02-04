'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ModerationModalProps {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function ModerationModal({
  open,
  title,
  description,
  children,
  confirmText = 'Confirm',
  destructive,
  onClose,
  onConfirm,
}: ModerationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-gray-950 border border-gray-800 shadow-2xl">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description ? <p className="text-sm text-gray-400 mt-1">{description}</p> : null}
        </div>
        <div className="p-4 space-y-3 text-gray-200">{children}</div>
        <div className="p-4 flex justify-end gap-2 border-t border-gray-800">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-200">
            Cancel
          </Button>
          {onConfirm ? (
            <Button
              onClick={onConfirm}
              className={destructive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500'}
            >
              {confirmText}
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

