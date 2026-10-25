const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID; // اختياري: رقم قناة الترحيب

if (!token) {
  console.error("خطأ: أضف DISCORD_TOKEN في متغيرات البيئة بموقع الاستضافة.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`تم تشغيل البوت بنجاح: ${client.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
  let channel = null;

  if (welcomeChannelId) {
    channel = member.guild.channels.cache.get(welcomeChannelId) ?? null;
  }

  if (!channel) {
    channel = member.guild.systemChannel ?? null;
  }

  if (!channel || !channel.isTextBased()) {
    console.error("لم يتم العثور على قناة ترحيب. أضف WELCOME_CHANNEL_ID أو عيّن قناة النظام.");
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("أهلًا بيك في ElNaaR 🎮")
    .setDescription(
      `نورت السيرفر يا ${member}!\n\n` +
      "أهلًا بيك وسط عيلة **ElNaaR** 💜\n" +
      "اقرأ القوانين واستمتع معانا في ولف تيم!"
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `أنت العضو رقم ${member.guild.memberCount}` })
    .setTimestamp();

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("تعذر إرسال رسالة الترحيب:", error);
  }
});

client.login(token);
