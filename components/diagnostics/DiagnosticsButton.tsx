'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { runChatDiagnostics } from '@/utils/chatDiagnostics';
import { HubChannel, HubUser } from '@/components/community-hub/types';

interface DiagnosticsButtonProps {
  user: HubUser;
  channel?: HubChannel | null;
}

export function DiagnosticsButton({ user, channel }: DiagnosticsButtonProps) {
  const [running, setRunning] = useState(false);
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <Button
      variant="secondary"
      disabled={running}
      onClick={async () => {
        setRunning(true);
        try {
          const result = await runChatDiagnostics(user, channel || null);
          if (!result.ok) {
            alert(`Diagnostics failed: ${result.reason || 'unknown'}`);
          } else {
            alert(result.message || 'Diagnostics started; check console logs.');
          }
        } finally {
          setRunning(false);
        }
      }}
    >
      {running ? 'Running…' : '🧪 Run Chat Diagnostics'}
    </Button>
  );
}

export default DiagnosticsButton;

