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

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/health-check.sh"
BACKEND_DIR="$(cd "$(dirname "$0")/../backend" && pwd)"

HEALTH_URL="${HEALTH_URL:-http://localhost:5000/health}"
ALERT_EMAIL_TO="${ALERT_EMAIL_TO:-}"

CRON_LINE="* * * * * HEALTH_URL=\"${HEALTH_URL}\" BACKEND_DIR=\"${BACKEND_DIR}\" ALERT_EMAIL_TO=\"${ALERT_EMAIL_TO}\" ${SCRIPT_PATH}"

chmod +x "$SCRIPT_PATH"

# Filtrar lineas existentes del watchdog para no duplicar
CURRENT="$(crontab -l 2>/dev/null || true)"
CLEANED="$(printf '%s\n' "$CURRENT" | grep -v 'health-check.sh' || true)"
printf '%s\n%s\n' "${CLEANED}" "${CRON_LINE}" | crontab -

echo "Watchdog instalado en crontab:"
echo "  ${CRON_LINE}"
echo ""
echo "ALERT_EMAIL_TO: ${ALERT_EMAIL_TO:-<vacío — tomado de backend/.env por el script de email>}"
echo ""
echo "Si no pasaste ALERT_EMAIL_TO, agregalo a backend/.env."
echo "Probando ahora..."
bash "$SCRIPT_PATH"
echo ""
echo "Log de eventos: /var/log/catalogoweb_health.log"
echo "Si el backend responde OK, no hay alertas: el watchdog funciona en silencio."
