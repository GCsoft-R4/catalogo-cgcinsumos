#!/usr/bin/env bash
#
# Watchdog de salud del backend catalogoweb.
# Verifica GET /health cada minuto (via cron) y alerta cuando el backend
# no responde OK durante ALERT_RETRIES chequeos consecutivos.
#
# Configuracion via variables de entorno (ver install.sh):
#   HEALTH_URL            URL a chequear (default: http://localhost:5000/health)
#   WATCHDOG_LOG          archivo de log (default: /var/log/catalogoweb_health.log)
#   ALERT_RETRIES         fallos consecutivos antes de alertar (default: 3)
#   TELEGRAM_BOT_TOKEN    token del bot (opcional, desactiva alertas si vacio)
#   TELEGRAM_CHAT_ID      chat/group id (opcional)
#
set -u

HEALTH_URL="${HEALTH_URL:-http://localhost:5000/health}"
LOG_FILE="${WATCHDOG_LOG:-/var/log/catalogoweb_health.log}"
STATE_DIR="${WATCHDOG_STATE_DIR:-/tmp/catalogoweb}"
STATE_FILE="$STATE_DIR/fail_count"
ALERTED_FILE="$STATE_DIR/alerted"
ALERT_RETRIES="${ALERT_RETRIES:-3}"

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOG_FILE"
}

send_telegram() {
  local msg="$1"
  if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
    curl -s -m 15 -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d chat_id="$TELEGRAM_CHAT_ID" \
      --data-urlencode "text=${msg}" > /dev/null 2>&1
  fi
}

alert() {
  log "ALERTA: $1"
  send_telegram "$1"
}

http_code() {
  curl -s -m 10 -o /dev/null -w "%{http_code}" "$HEALTH_URL"
}

mkdir -p "$STATE_DIR"

code="$(http_code)"

if [ "$code" = "200" ]; then
  # El backend responde bien.
  if [ -f "$ALERTED_FILE" ]; then
    rm -f "$ALERTED_FILE"
    alert "✅ Backend RECUPERADO: HTTP 200 en ${HEALTH_URL}"
  fi
  rm -f "$STATE_FILE"
  exit 0
fi

# El backend no respondio bien: acumular fallos consecutivos.
count="$(cat "$STATE_FILE" 2>/dev/null || echo 0)"
count=$((count + 1))
echo "$count" > "$STATE_FILE"

if [ "$count" -ge "$ALERT_RETRIES" ]; then
  touch "$ALERTED_FILE"
  alert "🔴 BACKEND CAÍDO: ${count} chequeos seguidos. HTTP ${code} en ${HEALTH_URL}"
  log "Detalle: $(curl -s -m 10 "$HEALTH_URL" 2>&1)"
  echo 0 > "$STATE_FILE"
fi
