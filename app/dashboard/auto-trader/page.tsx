import { redirect } from 'next/navigation';

/**
 * Auto Trader is not available in-dashboard at launch; send members to overview with a notice.
 */
export default function AutoTraderPage() {
  redirect('/dashboard?section=overview&notice=auto_trader_soon');
}
