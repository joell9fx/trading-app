import { createSupabaseClient } from '@/lib/supabase/client';
import { HubChannel, HubUser } from '@/components/community-hub/types';

/**
 * Developer/admin only diagnostics to verify chat send + realtime delivery.
 * Call runChatDiagnostics(user, channel) from console or via the DiagnosticsButton.
 */
export async function runChatDiagnostics(currentUser?: HubUser | null, currentChannel?: HubChannel | null) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Chat diagnostics are disabled in production.');
    return { ok: false, reason: 'Diagnostics disabled in production' };
  }

  const supabase = createSupabaseClient();

  const testPayload = {
    content: '✅ Diagnostic test message — verifying send pipeline.',
    author_id: currentUser?.id || 'diagnostic-test-user',
    channel_id: currentChannel?.id || currentChannel?.slug || 'general',
    created_at: new Date().toISOString(),
    test: true,
  };

  console.log('🔍 Running Chat Diagnostics...');
  console.log('🧾 Test payload:', testPayload);

  try {
    const channel = supabase
      .channel('messages_diagnostic')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as any;
          if (msg?.content?.includes('Diagnostic test message')) {
            console.log('📡 Realtime received:', msg);
            alert('✅ Realtime event confirmed!');
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();

    const { data, error } = await supabase.from('messages').insert([testPayload]).select();
    if (error) {
      console.error('❌ Insert error:', error.message);
      return { ok: false, reason: 'Insert failed', details: error.message };
    }

    console.log('✅ Insert success:', data);
    console.log('🚀 Diagnostic test initiated. Waiting for realtime confirmation...');
    return { ok: true, message: 'Diagnostic insert succeeded; waiting for realtime event.' };
  } catch (err: any) {
    console.error('💥 Unexpected error:', err?.message || err);
    return { ok: false, reason: 'Unexpected error', details: err?.message || String(err) };
  }
}

export default runChatDiagnostics;

