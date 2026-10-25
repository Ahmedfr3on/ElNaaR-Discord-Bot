# ElNaaR Cosmic Bot (Node.js)

## Configured channels
- Welcome channel: `1561910009753903206`
- Reply channel: `1561116825847079005`

The IDs are also set as defaults in `index.js`. You can override them in EuizHost Environment Variables:
- `DISCORD_TOKEN` = your new Discord bot token
- `WELCOME_CHANNEL_ID` = welcome channel ID (optional if using the default)
- `REPLY_CHANNEL_ID` = reply channel ID (optional if using the default)

## Features
- Automatic welcome messages in the configured welcome channel
- Automatic replies to selected Arabic/English greetings only in the configured reply channel
- Help command using `help`, `مساعدة`, or `الاوامر`
- Discord presence set to Do Not Disturb

## Required Discord settings
In Discord Developer Portal → Bot, enable:
- Server Members Intent
- Message Content Intent

The bot needs View Channel and Send Messages permissions in both channels. For embeds, it also needs Embed Links.

Never publish your bot token or put it in source code. If a token was exposed, reset it in Discord Developer Portal before using this project.
