#!/usr/bin/env bash
#
# Instala el watchdog como cron (cada minuto).
#
# Uso (editar valores si hace falta):
#   sudo HEALTH_URL="http://localhost:5000/health" \
#        TELEGRAM_BOT_TOKEN="TU_BOT_TOKEN" \
#        TELEGRAM_CHAT_ID="TU_CHAT_ID" \
#        bash install.sh
#
set -eu

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/health-check.sh"

HEALTH_URL="${HEALTH_URL:-http://localhost:5000/health}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

CRON_LINE="* * * * * HEALTH_URL=\"${HEALTH_URL}\" TELEGRAM_BOT_TOKEN=\"${TELEGRAM_BOT_TOKEN}\" TELEGRAM_CHAT_ID=\"${TELEGRAM_CHAT_ID}\" ${SCRIPT_PATH}"

chmod +x "$SCRIPT_PATH"

# Filtrar lineas existentes del watchdog para no duplicar
CURRENT="$(crontab -l 2>/dev/null || true)"
CLEANED="$(printf '%s\n' "$CURRENT" | grep -v 'health-check.sh' || true)"
printf '%s\n%s\n' "${CLEANED}" "${CRON_LINE}" | crontab -

echo "Watchdog instalado en crontab:"
echo "  ${CRON_LINE}"
echo ""
echo "Probando ahora..."
bash "$SCRIPT_PATH"
echo ""
echo "Log de eventos: /var/log/catalogoweb_health.log (sudo journalctl/tail)"
echo "Si el backend responde OK, no hay alertas: el watchdog funciona en silencio."
