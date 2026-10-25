const {
  Client, GatewayIntentBits, Events, EmbedBuilder, ActivityType
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID || "1561910009753903206";
const replyChannelId = process.env.REPLY_CHANNEL_ID || "1561116825847079005";

if (!token) {
  console.error("❌ متغير DISCORD_TOKEN غير موجود في إعدادات الاستضافة.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🔥 [ELNAAR ONLINE] ${readyClient.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "🔥 ElNaaR | BORN IN FIRE", type: ActivityType.Watching }],
    status: "online",
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = await member.guild.channels.fetch(welcomeChannelId).catch(() => null);
    if (!channel || !channel.isTextBased() || !channel.send) {
      console.error("[WELCOME] قناة الترحيب غير موجودة أو ليست نصية.");
      return;
    }

    const joinedAt = new Date().toLocaleDateString("ar-EG", {
      year: "numeric", month: "long", day: "numeric", timeZone: "Africa/Cairo"
    });

    const embed = new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle("🔥 وَلَّعْنَا المَجَرَّة… نجم جديد دخل الإمبراطورية! 🔥")
      .setDescription(
        `╭━━━ 🔥 **أَهْلًا بِكَ فِي إِمْبِرَاطُورِيَّة ElNaaR** 🔥 ━━━╮\n\n` +
        `يا ${member}، دخولك مش مجرد انضمام… **دي شرارة جديدة بتولّع الحماس!** ⚡\n` +
        `هنا النار رمز القوة، والاحترام أساس الفريق، واللعب الحلو هو اللي بيصنع الأساطير. 🎮\n\n` +
        `**📜 قبل ما تبدأ رحلتك:**\n` +
        `> 🔥 اقرأ القوانين والتزم باحترام الجميع.\n` +
        `> ⚔️ شاركنا اللعب والفعاليات وخليك جزء من الفريق.\n` +
        `> 👑 خليك أسطورة بأخلاقك قبل مهارتك.\n\n` +
        `╰━━━ **مستعد تولّعها معانا؟** 🔥 ━━━╯`
      )
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "👑 العضو رقم", value: `\`${member.guild.memberCount}\``, inline: true },
        { name: "📅 تاريخ الانضمام", value: `\`${joinedAt}\``, inline: true },
        { name: "🌋 شعار الإمبراطورية", value: "**🔥 ELNAAR — BORN IN FIRE 🔥**", inline: false }
      )
      .setFooter({ text: "ELNAAR • BORN IN FIRE 🔥 | احترام • قوة • أساطير" })
      .setTimestamp();

    await channel.send({
      content: `🔥 ${member} دخل السيرفر! الشرارة الجديدة وصلت! 🔥`,
      embeds: [embed],
      allowedMentions: { users: [member.id] },
    });
    console.log(`[WELCOME] تم الترحيب بالعضو ${member.user.tag} في #${channel.name}`);
  } catch (error) {
    console.error("[WELCOME] تعذر إرسال الترحيب:", error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot || message.channel.id !== replyChannelId) return;
  const msg = message.content.trim().toLowerCase();
  let title, description, color = 0xFF4500;

  if (["السلام عليكم", "سلام عليكم", "salam", "salaam"].includes(msg)) {
    title = "🔥 وعليكم السلام ورحمة الله وبركاته";
    description = `أهلًا يا ${message.author}، نوّرت ElNaaR! 🌋`;
    color = 0xFF6A00;
  } else if (["ازيك", "إزيك", "اخبارك", "أخبارك", "how are you", "how r u"].includes(msg)) {
    title = "⚡ النار مولّعة والحماس عالي!";
    description = `أنا تمام يا ${message.author} 🔥 إنت أخبارك إيه؟`;
  } else if (["صباح الخير", "صباح الفل", "صباح النور", "good morning"].includes(msg)) {
    title = "🌅 صباح كله طاقة!";
    description = `صباح النور يا ${message.author}، يومك يبقى مليان انتصارات! 🔥`;
    color = 0xFFB000;
  } else if (["مساء الخير", "مساء الفل", "good evening", "good night"].includes(msg)) {
    title = "🌙 مساء الحماس يا بطل!";
    description = `نورت الشات يا ${message.author}، خلي ليلتك أسطورية! 🌋`;
  } else if (["مين عملك", "مين صنعك", "مين المطور", "who made you", "developer"].includes(msg)) {
    title = "👑 مطوّر ElNaaR";
    description = "تم تجهيز بوت ElNaaR لخدمة أعضاء الإمبراطورية. 🔥";
  } else if (["الاوامر", "الأوامر", "اوامر", "مساعدة", "help", "commands"].includes(msg)) {
    title = "📜 أوامر ElNaaR";
    description = "🔥 السلام عليكم • إزيك • صباح الخير • مساء الخير • مين المطور\n\nاكتب أي تحية من دول وأنا هرد عليك هنا.";
    color = 0xFF6A00;
  } else {
    return;
  }

  const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(description)
    .setFooter({ text: "ELNAAR • BORN IN FIRE 🔥" }).setTimestamp();
  await message.reply({ embeds: [embed] }).catch((error) => console.error("[REPLY]", error));
});

client.login(token).catch((error) => {
  console.error("❌ فشل تسجيل الدخول. راجع DISCORD_TOKEN:", error.message);
});
