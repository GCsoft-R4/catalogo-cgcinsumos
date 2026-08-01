#!/usr/bin/env bash
#
# Instala el watchdog como cron (cada minuto).
# Las alertas se envian por email reusando el SMTP del backend (backend/.env).
#
# Antes de instalar, configurar en backend/.env:
#   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
#   ALERT_EMAIL_TO=<tu email>          <- el destinatario de las alertas
#
# Uso:
#   bash install.sh
#
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/health-check.sh"

HEALTH_URL="${HEALTH_URL:-http://localhost:5000/health}"
ALERT_EMAIL_TO="${ALERT_EMAIL_TO:-}"

CRON_LINE="* * * * * HEALTH_URL=\"${HEALTH_URL}\" ${SCRIPT_PATH}"

chmod +x "$SCRIPT_PATH"

# Dependencias del watchdog (nodemailer, dotenv)
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "Instalando dependencias del watchdog..."
  (cd "$SCRIPT_DIR" && npm install --no-fund --no-audit)
fi

# Filtrar lineas existentes del watchdog para no duplicar
CURRENT="$(crontab -l 2>/dev/null || true)"
CLEANED="$(printf '%s\n' "$CURRENT" | grep -v 'health-check.sh' || true)"
printf '%s\n%s\n' "${CLEANED}" "${CRON_LINE}" | crontab -

echo "Watchdog instalado en crontab:"
echo "  ${CRON_LINE}"
echo ""
echo "ALERT_EMAIL_TO: ${ALERT_EMAIL_TO:-<vacío — lo lee email-alert.js de backend/.env>}"
echo ""
echo "Agregá ALERT_EMAIL_TO=<tu email> a backend/.env para recibir alertas."
echo "Probando ahora..."
bash "$SCRIPT_PATH"
echo ""
echo "Log de eventos: /var/log/catalogoweb_health.log"
echo "Si el backend responde OK, no hay alertas: el watchdog funciona en silencio."
