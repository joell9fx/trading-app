import { SupabaseClient } from '@supabase/supabase-js'
import { MembershipTier } from './tier-utils'

export async function assignBadges(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'membership_tier, xp, badges, affiliate_tier, affiliate_total_commission, has_signals_access, has_mentorship_access, has_ai_tools_access'
    )
    .eq('id', userId)
    .single()

  const { count: referralCount } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', userId)
    .eq('reward_status', 'completed')

  const { data: wallet } = await supabase
    .from('user_wallet_balance')
    .select('total_earned')
    .eq('user_id', userId)
    .single()

  const { count: unlockedCount } = await supabase
    .from('user_services')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_unlocked', true)

  const { count: msgCount } = await supabase
    .from('community_activity')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', 'message')

  const { count: tradePosts } = await supabase
    .from('community_activity')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', 'trade_post')

  const { count: replies } = await supabase
    .from('community_activity')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', 'reply')

  const { count: marketingCount } = await supabase
    .from('marketing_assets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: campaignsCount } = await supabase
    .from('ad_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { data: roiCampaign } = await supabase
    .from('ad_campaigns')
    .select('roi')
    .eq('user_id', userId)
    .gt('roi', 50)
    .limit(1)

  const { data: spendAgg } = await supabase
    .from('ad_campaigns')
    .select('spend')
    .eq('user_id', userId)

  const { count: optCount } = await supabase
    .from('optimization_logs')
    .select('*', { count: 'exact', head: true })
    .in(
      'campaign_id',
      supabase.from('ad_campaigns').select('id').eq('user_id', userId) as any
    )

  const { data: roiImproved } = await supabase
    .from('optimization_logs')
    .select('new_roi, old_roi')
    .order('created_at', { ascending: false })
    .limit(10)

  const badges: string[] = []
  if ((referralCount || 0) >= 1) badges.push('💸 Community Builder')
  if ((referralCount || 0) >= 5) badges.push('🔥 Growth Agent')
  if ((referralCount || 0) >= 10) badges.push('🚀 Influencer')
  if (profile?.affiliate_tier) badges.push('💼 Official Affiliate')
  if (profile?.affiliate_tier === 'Silver') badges.push('🥈 Growth Partner')
  if (profile?.affiliate_tier === 'Gold') badges.push('🏆 Top Influencer')
  if ((profile?.affiliate_total_commission || 0) >= 100) badges.push('💸 Power Promoter')
  if (profile?.affiliate_tier === 'Platinum' || profile?.affiliate_tier === 'Elite') badges.push('👑 VisionEdge Partner')
  const premiumUnlocks = [
    profile?.has_signals_access,
    profile?.has_mentorship_access,
    profile?.has_ai_tools_access,
  ].filter(Boolean).length
  if (premiumUnlocks >= 1) badges.push('💸 Investor')
  if (premiumUnlocks === 3) badges.push('🔑 Full Access Trader')
  if ((marketingCount || 0) >= 1) badges.push('🪄 Content Creator')
  if ((marketingCount || 0) >= 10) badges.push('📈 Active Promoter')
  if ((marketingCount || 0) >= 50) badges.push('🎯 Brand Advocate')
  if ((campaignsCount || 0) >= 1) badges.push('📣 Ad Strategist')
  if (roiCampaign && roiCampaign.length > 0) badges.push('💰 Profit Maker')
  if ((campaignsCount || 0) >= 5) badges.push('⚡ Media Buyer')
  const totalSpend = (spendAgg || []).reduce((sum, row: any) => sum + Number(row.spend || 0), 0)
  if (totalSpend >= 1000) badges.push('🏆 Growth Commander')
  if ((optCount || 0) >= 1) badges.push('🧩 Data-Driven Trader')
  const improved = (roiImproved || []).some((r: any) => (Number(r.new_roi) || 0) - (Number(r.old_roi) || 0) > 25)
  if (improved) badges.push('📈 Precision Optimizer')
  if ((optCount || 0) >= 5) badges.push('⚙️ AI Strategist')
  if ((profile?.membership_tier as MembershipTier) === 'Elite') badges.push('👑 Elite Member')
  if ((profile?.xp || 0) >= 500) badges.push('⚡ Big Earner')
  if ((wallet?.total_earned || 0) >= 500) badges.push('💰 Rewards Pro')
  if ((unlockedCount || 0) >= 5) badges.push('🏆 Completionist')
  if ((msgCount || 0) >= 10) badges.push('💬 Social Starter')
  if ((msgCount || 0) >= 100) badges.push('🔥 Active Voice')
  if ((tradePosts || 0) >= 20) badges.push('💹 Trade Master')
  if ((replies || 0) >= 10) badges.push('🧠 Mentor')

  const { data: perf } = await supabase
    .from('performance_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if ((perf?.total_trades || 0) >= 100) badges.push('🪙 100 Trades Logged')
  if ((perf?.win_rate || 0) >= 60 && (perf?.consistency_score || 0) >= 70) badges.push('🧠 Consistent Performer')
  if ((perf?.total_profit || 0) >= 1000) badges.push('💰 Profit Machine')
  if ((perf?.win_rate || 0) >= 70) badges.push('🔥 High Precision')
  if ((perf?.avg_rr || 0) >= 3) badges.push('🎯 Risk Reward Pro')
  if ((perf?.consistency_score || 0) >= 80) badges.push('🏆 Consistent Trader')

  const { count: completedPaths } = await supabase
    .from('learning_paths')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')

  if ((completedPaths || 0) >= 1) badges.push('📘 Committed Learner')
  if ((completedPaths || 0) >= 3) badges.push('🎯 Adaptive Trader')

  await supabase.from('profiles').update({ badges }).eq('id', userId)
}

