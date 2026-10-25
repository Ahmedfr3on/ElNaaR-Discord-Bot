# ElNaaR — BORN IN FIRE 🔥

Configured channels:
- Welcome: `1561910009753903206`
- Replies: `1561116825847079005`

EuizHost environment variables:
- `DISCORD_TOKEN` = bot token (keep secret)
- `WELCOME_CHANNEL_ID` = optional; defaults to the welcome channel above
- `REPLY_CHANNEL_ID` = optional; defaults to the reply channel above

Discord Developer Portal → Bot:
- Enable Server Members Intent
- Enable Message Content Intent

The bot needs View Channel, Send Messages, and Embed Links in both channels.
Keep the welcome channel read-only for @everyone, but allow the bot role to send messages.

Never put your token in GitHub. If it was exposed, reset it before use.
