#!/usr/bin/env bash
#
# Watchdog de salud del backend catalogoweb.
# Verifica GET /health cada minuto (via cron) y alerta cuando el backend
# no responde OK durante ALERT_RETRIES chequeos consecutivos.
# Las alertas se envian por email usando el SMTP del backend (backend/.env).
#
# Configuracion via variables de entorno (ver install.sh):
#   HEALTH_URL            URL a chequear (default: http://localhost:5000/health)
#   WATCHDOG_LOG          archivo de log (default: /var/log/catalogoweb_health.log)
#   ALERT_RETRIES         fallos consecutivos antes de alertar (default: 3)
#
# Las alertas se envian por email con email-alert.js (misma carpeta), que lee
# SMTP_* y ALERT_EMAIL_TO desde backend/.env. Requiere: npm install en watchdog/.
#
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HEALTH_URL="${HEALTH_URL:-http://localhost:5000/health}"
LOG_FILE="${WATCHDOG_LOG:-/var/log/catalogoweb_health.log}"
STATE_DIR="${WATCHDOG_STATE_DIR:-/tmp/catalogoweb}"
STATE_FILE="$STATE_DIR/fail_count"
ALERTED_FILE="$STATE_DIR/alerted"
ALERT_RETRIES="${ALERT_RETRIES:-3}"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOG_FILE"
}

send_alert_email() {
  local msg="$1"
  if command -v node >/dev/null 2>&1 && [ -d "$SCRIPT_DIR/node_modules" ]; then
    node "$SCRIPT_DIR/email-alert.js" "$msg" >> "$LOG_FILE" 2>&1
  else
    log "Email no enviado (falta node o npm install en watchdog/): $msg"
  fi
}

alert() {
  log "ALERTA: $1"
  send_alert_email "$1"
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
    alert "Recuperado: el backend vuelve a responder HTTP 200 en ${HEALTH_URL}"
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
  alert "ALERTA - BACKEND CAIDO: ${count} chequeos seguidos. HTTP ${code} en ${HEALTH_URL}"
  log "Detalle: $(curl -s -m 10 "$HEALTH_URL" 2>&1)"
  echo 0 > "$STATE_FILE"
fi
