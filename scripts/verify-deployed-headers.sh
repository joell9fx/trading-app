#!/usr/bin/env bash
# Verify deployed /signin and /site.webmanifest response headers.
# Usage: BASE_URL=https://your-app.vercel.app ./scripts/verify-deployed-headers.sh
#    or: ./scripts/verify-deployed-headers.sh https://your-app.vercel.app

set -e
BASE_URL="${BASE_URL:-$1}"
if [ -z "$BASE_URL" ]; then
  echo "Usage: BASE_URL=https://your-app.vercel.app ./scripts/verify-deployed-headers.sh"
  echo "   or: ./scripts/verify-deployed-headers.sh https://your-app.vercel.app"
  exit 1
fi
BASE_URL="${BASE_URL%/}"

echo "=== Deployed base URL: $BASE_URL ==="
echo ""

echo "--- 1. /signin document response headers ---"
curl -sI -D - -o /dev/null "$BASE_URL/signin" | sed -n '1,/^\r$/p' || true
echo ""

echo "--- 2. Content-Security-Policy header count on /signin ---"
COUNT=$(curl -sI "$BASE_URL/signin" | grep -i content-security-policy | wc -l | tr -d ' ')
echo "Count: $COUNT"
if [ "$COUNT" -gt 1 ]; then
  echo ">>> DUPLICATE CSP HEADERS DETECTED - likely one from Vercel/host <<<"
fi
echo ""

echo "--- 3. All CSP header value(s) on /signin ---"
curl -sI "$BASE_URL/signin" | grep -i content-security-policy || echo "(none)"
echo ""

echo "--- 4. /site.webmanifest response (expect 301/308 redirect to /manifest.webmanifest) ---"
curl -sI -D - -o /dev/null "$BASE_URL/site.webmanifest" | sed -n '1,/^\r$/p' || true
echo ""

echo "--- 5. /manifest.webmanifest (expect 200 and application/manifest+json) ---"
curl -sI "$BASE_URL/manifest.webmanifest" | head -20
echo ""

echo "=== Summary (run after redeploy; replace YOUR_DEPLOYED_URL with your Vercel URL) ==="
if [ "$COUNT" -eq 1 ]; then echo "  CSP count 1?           PASS"; else echo "  CSP count 1?           FAIL (count=$COUNT)"; fi
if curl -sI "$BASE_URL/signin" | grep -qi "script-src"; then echo "  CSP has script-src?    PASS"; else echo "  CSP has script-src?    FAIL"; fi
if curl -sI "$BASE_URL/signin" | grep -qi "style-src"; then echo "  CSP has style-src?     PASS"; else echo "  CSP has style-src?     FAIL"; fi
MANIFEST_STATUS=$(curl -sI -o /dev/null -w "%{http_code}" "$BASE_URL/site.webmanifest")
if [ "$MANIFEST_STATUS" = "301" ] || [ "$MANIFEST_STATUS" = "308" ] || [ "$MANIFEST_STATUS" = "200" ]; then echo "  /site.webmanifest:     PASS ($MANIFEST_STATUS)"; else echo "  /site.webmanifest:     FAIL ($MANIFEST_STATUS)"; fi
