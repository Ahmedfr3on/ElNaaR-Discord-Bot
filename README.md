# ElNaaR — BORN IN FIRE 🔥

Discord.js v14 bot with an automatic personalized welcome image and automatic replies limited to one channel.

## Files
- `index.js` — bot logic and dynamic welcome image generation.
- `welcome-bg.png` — ElNaaR welcome artwork template.
- `package.json` — dependencies and start script.
- `Procfile` — worker start command for hosts that support Procfile.

## Environment variables
Set these in your hosting panel (do not put your token in the source code):
- `DISCORD_TOKEN` = your Discord bot token (keep it secret).
- `WELCOME_CHANNEL_ID` = `1561910009753903206`
- `REPLY_CHANNEL_ID` = `1561116825847079005`

## Start
```bash
npm install
npm start
```

## Discord Developer Portal checklist
Enable **Server Members Intent** and **Message Content Intent** under Bot > Privileged Gateway Intents. Invite the bot with View Channels, Send Messages, Embed Links, Attach Files, and Read Message History permissions. The bot role must be able to see and send in both configured channels.

The welcome image automatically adds the joining member's avatar, display name, server member count, and join date. If image generation fails, the bot falls back to a normal embed welcome message.
