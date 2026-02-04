#!/bin/bash
# VisionEdge FX – Launch Validation Script (Enhanced)
# Verifies production environment integrity and outputs colored summary.
# Requirements:
#   - curl, jq
#   - PROD_URL=https://visionedgefx.com
#   - Either session cookies or JWTs:
#       ADMIN_COOKIE / OWNER_COOKIE / BANNED_COOKIE (preferred, e.g., "sb-access-token=...; sb-refresh-token=...")
#       or ADMIN_TOKEN / OWNER_TOKEN / BANNED_TOKEN (Bearer) if your backend honors Authorization (note: current Supabase server auth uses cookies).
# Logs results to: ./logs/launch-validation.txt

set -euo pipefail

LOGFILE="./logs/launch-validation.txt"
mkdir -p ./logs
echo "=== VisionEdge FX Launch Validation $(date) ===" | tee "$LOGFILE"

# --- COLORS ---
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
RESET="\033[0m"

# --- SUMMARY ARRAYS ---
declare -A RESULTS
declare -A LATENCIES

# --- ENV CHECK ---
if [[ -z "${PROD_URL:-}" ]]; then
  echo -e "${RED}PROD_URL is required (e.g., https://visionedgefx.com)${RESET}"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo -e "${RED}jq is required. Install jq and retry.${RESET}"
  exit 1
fi

# --- AUTH HELPERS ---
auth_headers() {
  local role="$1" # admin|owner|banned|none
  local headers=()
  local cookie_var token_var
  case "$role" in
    admin)  cookie_var="${ADMIN_COOKIE:-}"; token_var="${ADMIN_TOKEN:-}";;
    owner)  cookie_var="${OWNER_COOKIE:-}"; token_var="${OWNER_TOKEN:-}";;
    banned) cookie_var="${BANNED_COOKIE:-}"; token_var="${BANNED_TOKEN:-}";;
    *)      cookie_var=""; token_var="";;
  esac
  if [[ -n "$cookie_var" ]]; then
    headers+=("-H" "Cookie: $cookie_var")
  fi
  if [[ -n "$token_var" ]]; then
    headers+=("-H" "Authorization: Bearer $token_var")
  fi
  printf '%s\n' "${headers[@]}"
}

warn_if_no_auth() {
  local role="$1" # admin|owner|banned
  local cookie_var token_var
  case "$role" in
    admin)  cookie_var="${ADMIN_COOKIE:-}"; token_var="${ADMIN_TOKEN:-}";;
    owner)  cookie_var="${OWNER_COOKIE:-}"; token_var="${OWNER_TOKEN:-}";;
    banned) cookie_var="${BANNED_COOKIE:-}"; token_var="${BANNED_TOKEN:-}";;
    *)      cookie_var=""; token_var="";;
  esac
  if [[ -z "$cookie_var" && -z "$token_var" ]]; then
    echo -e "${YELLOW}[WARN] No auth provided for $role tests. These will likely return 401.${RESET}" | tee -a "$LOGFILE"
  fi
}

# --- UTILITY ---
run_test() {
  local name="$1"
  local expect="$2"   # space-separated list of acceptable HTTP codes
  shift 2
  echo -e "\n[TEST] $name" | tee -a "$LOGFILE"

  local output
  output=$("$@" 2>&1)
  local code=$?
  local status
  local latency

  local http_code
  http_code=$(echo "$output" | grep -Eo "HTTP/[0-9.]+ [0-9]+" | tail -1 | awk '{print $2}')
  latency=$(echo "$output" | grep -E "time_total:" | awk '{print $2}')

  echo "$output" | tee -a "$LOGFILE"
  echo -e "\n---" | tee -a "$LOGFILE"

  if [[ " $expect " == *" $http_code "* ]]; then
    status="${GREEN}✅${RESET}"
  else
    status="${RED}⚠️${RESET}"
  fi

  RESULTS["$name"]="$status"
  LATENCIES["$name"]="${latency:-N/A}"
}

get_channel_id() {
  local slug="$1"
  local auth_role="${2:-admin}"
  local headers=($(auth_headers "$auth_role"))
  local resp
  resp=$(curl -s "${headers[@]}" "$PROD_URL/api/community-hub/channels")
  echo "$resp" | jq -r --arg slug "$slug" '.channels[] | select(.slug==$slug) | .id' | head -1
}

# --- 1️⃣ Auth / Access ---
warn_if_no_auth "admin"
warn_if_no_auth "owner"
warn_if_no_auth "banned"

run_test "Auth (unauthenticated)" "401 403" curl -s -i "$PROD_URL/api/admin/users"
run_test "Auth (admin)" "200" curl -s -i $(auth_headers admin) "$PROD_URL/api/admin/users"
run_test "Auth (banned)" "403" curl -s -i $(auth_headers banned) "$PROD_URL/api/admin/users"

# --- 2️⃣ Community Hub ---
GENERAL_ID=$(get_channel_id "general-chat" "admin")
SIGNALS_ID=$(get_channel_id "signals" "admin")

if [[ -n "$GENERAL_ID" && "$GENERAL_ID" != "null" ]]; then
  run_test "Community (general message)" "200 201" curl -s -w "\ntime_total: %{time_total}\n" -i \
    -H "Content-Type: application/json" $(auth_headers admin) \
    -d "{\"channel_id\":\"$GENERAL_ID\",\"content\":\"[QA] general message\"}" \
    "$PROD_URL/api/community-hub/messages"
else
  echo -e "${YELLOW}[WARN] Could not resolve general channel id; skipping general message test.${RESET}" | tee -a "$LOGFILE"
fi

run_test "Community (channels)" "200" curl -s -i $(auth_headers admin) "$PROD_URL/api/community-hub/channels"

if [[ -n "$SIGNALS_ID" && "$SIGNALS_ID" != "null" ]]; then
  run_test "Community (signals locked)" "403" curl -s -i \
    -H "Content-Type: application/json" $(auth_headers admin) \
    -d "{\"channel_id\":\"$SIGNALS_ID\",\"content\":\"[QA] locked test\"}" \
    "$PROD_URL/api/community-hub/messages"
else
  echo -e "${YELLOW}[WARN] Could not resolve signals channel id; skipping signals lock test.${RESET}" | tee -a "$LOGFILE"
fi

if [[ -n "$GENERAL_ID" && "$GENERAL_ID" != "null" ]]; then
  run_test "Community (banned message)" "403" curl -s -i \
    -H "Content-Type: application/json" $(auth_headers banned) \
    -d "{\"channel_id\":\"$GENERAL_ID\",\"content\":\"[QA] banned attempt\"}" \
    "$PROD_URL/api/community-hub/messages"
fi

# --- 3️⃣ Stripe ---
echo -e "\n${YELLOW}[INFO] Stripe live checkout test must be done manually via UI.${RESET}" | tee -a "$LOGFILE"
echo "Check webhook -> /api/checkout/webhook = 200 in Stripe dashboard." | tee -a "$LOGFILE"

# --- 4️⃣ AI Operator ---
run_test "AI Operator" "200" curl -s -w "\ntime_total: %{time_total}\n" -i \
  -H "Content-Type: application/json" $(auth_headers admin) \
  -d '{"prompt":"Generate 2026 market outlook"}' \
  "$PROD_URL/api/admin/operator"

# --- 5️⃣ Security Headers ---
run_test "Security Headers" "200" curl -s -I "$PROD_URL"

# --- 6️⃣ Admin / Superadmin ---
run_test "Admin Overview" "200" curl -s -i $(auth_headers admin) "$PROD_URL/api/admin/overview"
run_test "Superadmin Summary" "200" curl -s -i $(auth_headers owner) "$PROD_URL/api/superadmin/summary"
run_test "Banned Admin Access" "403" curl -s -i $(auth_headers banned) "$PROD_URL/api/admin/overview"

# --- 7️⃣ Manual UI Validation ---
echo -e "\n${YELLOW}[INFO] Manual step: Load $PROD_URL/dashboard on desktop & mobile.${RESET}" | tee -a "$LOGFILE"
echo "Confirm <3s load time, no console errors, responsive layout, all nav links work." | tee -a "$LOGFILE"

# --- SUMMARY OUTPUT ---
echo -e "\n${YELLOW}=== Validation Summary ===${RESET}"
printf "%-30s | %-6s | %-8s\n" "Module" "Status" "Latency(s)"
printf "%-30s | %-6s | %-8s\n" "------------------------------" "------" "----------"
for name in "${!RESULTS[@]}"; do
  printf "%-30s | %b | %-8s\n" "$name" "${RESULTS[$name]}" "${LATENCIES[$name]}"
done

echo -e "\n${YELLOW}=== Validation Complete $(date) ===${RESET}"
echo "Full log written to $LOGFILE"

# --- ALERTING ---
FAILED_TESTS=()
for name in "${!RESULTS[@]}"; do
  if [[ "${RESULTS[$name]}" == *"⚠️"* ]]; then
    FAILED_TESTS+=("$name")
  fi
fi

EXIT_CODE=0
if [[ ${#FAILED_TESTS[@]} -gt 0 ]]; then
  EXIT_CODE=1
  failure_summary=$(printf '%s; ' "${FAILED_TESTS[@]}")
  failure_summary=${failure_summary%%; }
  message="🚨 VisionEdge FX launch validation failed on $(hostname). Failing tests: ${failure_summary}. Log: $LOGFILE"

  slack_payload=$(printf '{"text":"%s"}' "${message//\"/\\\"}")
  discord_payload=$(printf '{"content":"%s"}' "${message//\"/\\\"}")

  if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
    if ! curl -s -X POST -H "Content-Type: application/json" -d "$slack_payload" "$SLACK_WEBHOOK_URL" >/dev/null; then
      echo -e "${YELLOW}[WARN] Slack webhook notification failed.${RESET}" | tee -a "$LOGFILE"
    else
      echo "[INFO] Slack webhook sent." | tee -a "$LOGFILE"
    fi
  else
    echo -e "${YELLOW}[WARN] SLACK_WEBHOOK_URL not set; skipping Slack alert.${RESET}" | tee -a "$LOGFILE"
  fi

  if [[ -n "${DISCORD_WEBHOOK_URL:-}" ]]; then
    if ! curl -s -X POST -H "Content-Type: application/json" -d "$discord_payload" "$DISCORD_WEBHOOK_URL" >/dev/null; then
      echo -e "${YELLOW}[WARN] Discord webhook notification failed.${RESET}" | tee -a "$LOGFILE"
    else
      echo "[INFO] Discord webhook sent." | tee -a "$LOGFILE"
    fi
  else
    echo -e "${YELLOW}[WARN] DISCORD_WEBHOOK_URL not set; skipping Discord alert.${RESET}" | tee -a "$LOGFILE"
  fi
else
  echo "[INFO] All tests passed; no alerts sent." | tee -a "$LOGFILE"
fi

exit "$EXIT_CODE"
