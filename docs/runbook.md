# VisionEdge FX – Post-Launch Monitoring & Alert-Response Runbook

## Daily health checks (AM)
- Uptime (UptimeRobot/Cron): API < 300 ms avg, > 99.5% availability.
- Error tracking (Sentry/LogRocket): no new criticals (500s, unhandled rejections).
- Supabase logs → API Requests: no 403/401 spikes; no realtime disconnects.
- Stripe webhooks: 0 failed deliveries in last 24h.
- AI Operator (admin test prompt): returns 200 JSON, latency < 6s.
- Community realtime: post & receive test message; appears instantly in client console.
- Backups (Supabase → Backups): latest snapshot < 24h.

## Weekly system integrity
- Run `./scripts/launch_validation.sh` → all checks ✅.
- Inspect `admin_logs` for abnormal actions (e.g., repeated `verification_rejected`).
- Review Stripe billing for refund/charge error rates.
- Check OpenAI usage dashboard for rate-limit warnings.
- Audit CORS/HTTPS still locked to your domain.

## Alert triggers and response owners
- HTTP 500 / invalid payload: check Sentry trace → reproduce in staging → hot-fix deploy ≤ 30m (Dev Lead).
- Supabase Realtime disconnects > 5m: check status → restart Realtime or switch to fallback polling (Infra Ops).
- Stripe webhook failures: re-send in Stripe → verify webhook secret/domain (Finance Ops).
- AI Operator timeouts > 6s sustained: check OpenAI status → rotate key or add retry (Dev Ops).
- Spike in 403/401: inspect Supabase JWT expiry → extend session TTL or refresh flow (Backend Dev).
- Downtime > 10m: `vercel rollback --to v1.0-launch` (Infra Lead).

## Alert delivery setup
- Slack webhook example (append to `scripts/launch_validation.sh`):
  - `curl -X POST -H "Content-Type: application/json" -d "{\"text\":\"🚨 Launch Validation Failed on $(hostname): check logs/launch-validation.txt\"}" $SLACK_WEBHOOK_URL`
- Discord webhook example:
  - `curl -H "Content-Type: application/json" -X POST -d "{\"content\":\"⚠️ VisionEdge FX validation issue – check logs.\"}" $DISCORD_WEBHOOK_URL`
- Cron schedule (09:00 UTC daily):
  - `0 9 * * * /path/to/scripts/launch_validation.sh > /dev/null`

## Incident log template
- Incident Report – YYYY-MM-DD HH:MM UTC
  - Detected By: (Slack/Sentry/Stripe)
  - Root Cause:
  - Systems Affected:
  - Temporary Fix Applied:
  - Permanent Resolution:
  - Lessons Learned:

## Quarterly maintenance
- Rotate API keys (OpenAI, Supabase, Stripe).
- Re-audit database RLS policies.
- Confirm SSL cert expiry > 60 days.
- Benchmark: page load < 3s; API latency < 1s.

## Stability gate
- If all daily/weekly checks stay green for 30 days, declare VisionEdge FX v1.0 Stable Channel and begin v1.1 planning.

