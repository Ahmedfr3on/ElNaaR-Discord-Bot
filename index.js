const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
  Events,
  ChannelType,
  MessageFlags,
} = require("discord.js");

// ElNaaR Cosmic Bot — Node.js / discord.js v14
// Add DISCORD_TOKEN in your hosting provider's environment variables.
// WELCOME_CHANNEL_ID is optional; defaults to the channel ID provided by you.

const token = process.env.DISCORD_TOKEN;
const welcomeChannelId =
  process.env.WELCOME_CHANNEL_ID || "1561910009753903206";
const replyChannelId =
  process.env.REPLY_CHANNEL_ID || "1561116825847079005";
const replyChannelId =
  process.env.REPLY_CHANNEL_ID || "1561116825847079005";

if (!token) {
  console.error("❌ DISCORD_TOKEN is missing. Add it in EuizHost → Environment Variables.");
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

const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80";
const THUMB_IMAGE =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=512&q=80";
const FOOTER_ICON =
  "https://cdn-icons-png.flaticon.com/512/3284/3284620.png";

const WELCOME_IMAGES = [
  "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
  "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif",
  "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",
];

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`🌌 [SYSTEM ONLINE] ${readyClient.user.tag} — ElNaaR Cosmic Bot`);
  console.log(`🔮 Connected to ${readyClient.guilds.cache.size} server(s).`);

  try {
    await readyClient.user.setPresence({
      activities: [{ name: "🌠 المجرة | ElNaaR Cosmic 🔥", type: ActivityType.Watching }],
      status: "dnd",
    });
  } catch (error) {
    console.error("Could not set bot presence:", error);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel =
      member.guild.channels.cache.get(welcomeChannelId) ||
      member.guild.systemChannel;

    if (!channel) {
      console.error(`❌ No welcome channel found in guild ${member.guild.name}. Check WELCOME_CHANNEL_ID.`);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle("✨ ═══ نجم جديد أشرق في مجرتنا ═══ ✨")
      .setDescription(
        `🌠 **مرحباً بك يا ${member}**\n\n` +
        "لقد انضممت إلى **سيرفر ElNaaR** — حيث تلتقي العقول، وتُولد الأفكار، وتُصنع الأساطير.\n\n" +
        "📜 **نرجو منك قراءة القوانين أولاً**\n" +
        "🎭 **عرّفنا بنفسك في قناة التعريف**\n" +
        "💎 **استمتع بتجربة عالمية فريدة**"
      )
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .setImage(WELCOME_IMAGES[Math.floor(Math.random() * WELCOME_IMAGES.length)])
      .setAuthor({
        name: `عضو جديد | ${member.user.username}`,
        iconURL: member.displayAvatarURL({ size: 128 }),
      })
      .addFields(
        { name: "🆔 العضو رقم", value: `#${member.guild.memberCount}`, inline: true },
        { name: "📅 تاريخ الانضمام", value: new Date().toISOString().slice(0, 10), inline: true }
      )
      .setFooter({
        text: "🌌 ElNaaR Cosmic Empire — حيث الأساطير تُصنع",
        iconURL: FOOTER_ICON,
      })
      .setTimestamp();

    const content = `🎊 ${member} **أهلاً بك في الإمبراطورية!**`;

    if (channel.type === ChannelType.GuildForum) {
      await channel.threads.create({
        name: `Welcome ${member.user.username}`.slice(0, 100),
        message: { content, embeds: [embed] },
      });
    } else if (channel.isTextBased() && typeof channel.send === "function") {
      await channel.send({ content, embeds: [embed] });
    } else {
      console.error("❌ Welcome channel is not a text or forum channel.");
    }
  } catch (error) {
    console.error("❌ Failed to send welcome message:", error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  // Only answer in the configured reply channel. If not configured, replies are disabled
  // to prevent the bot from responding throughout every channel by accident.
  if (!replyChannelId || message.channel.id !== replyChannelId) return;

  const msg = message.content.trim().toLowerCase();
  const author = message.author.toString();

  try {
    if (["السلام عليكم", "سلام عليكم", "salam", "salaam"].includes(msg)) {
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("☪️ وعليكم السلام ورحمة الله وبركاته")
        .setDescription(`أهلاً وسهلاً بك يا ${author} 🌟\nنوّرت المجرة بوجودك ✨`)
        .setThumbnail(THUMB_IMAGE);
      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } else if (["ازيك", "إزيك", "اخبارك", "أخبارك", "how are you", "how r u"].includes(msg)) {
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle("💫 أنا في أفضل حال!")
        .setDescription(`يا ${author}، وجودك في السيرفر يجعلني أعمل بقوة **1000%** ⚡\n\n🤖 *كيف حالك أنت؟ أتمنى أن تكون بألف خير*`)
        .setImage(BANNER_IMAGE);
      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } else if (["صباح الخير", "صباح الفل", "صباح النور", "good morning"].includes(msg)) {
      const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle("☀️ صباح الخير والنور")
        .setDescription(`أسعد الله صباحك يا ${author} 🌅\nليكن يومك مليئاً بالإنجازات ✨`);
      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } else if (["مساء الخير", "مساء الفل", "good evening", "good night"].includes(msg)) {
      const embed = new EmbedBuilder()
        .setColor(0x34495e)
        .setTitle("🌙 مساء الخير والياسمين")
        .setDescription(`أهلاً بك يا ${author} 🌌\nلتكن ليلتك هادئة كنجوم السماء ⭐`);
      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } else if (["مين عملك", "مين صنعك", "مين المطور", "who made you", "developer"].includes(msg)) {
      const embed = new EmbedBuilder()
        .setColor(0xff0080)
        .setTitle("🧑‍💻 المطور")
        .setDescription("🌟 تمت صناعة هذا البوت لمجتمع **ElNaaR** 🎮\n\n⚡ *رؤية خيالية، تنفيذ احترافي، نتائج أسطورية*")
        .setThumbnail(THUMB_IMAGE)
        .setFooter({ text: "ElNaaR Cosmic Empire" });
      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } else if (["الاوامر", "الأوامر", "اوامر", "أوامر", "مساعدة", "help", "commands"].includes(msg)) {
      const embed = new EmbedBuilder()
        .setColor(0x00bfff)
        .setTitle("📜 ═══ دليل الأوامر ═══ 📜")
        .setDescription("🌌 مرحباً بك في **ElNaaR Cosmic Bot**")
        .addFields(
          { name: "💬 ردود المحادثة", value: "`السلام عليكم` • `ازيك` • `صباح الخير` • `مساء الخير`", inline: false },
          { name: "ℹ️ معلومات", value: "`مين المطور` • `الاوامر`", inline: false },
          { name: "🎉 الترحيب", value: "تلقائي عند دخول أي عضو جديد", inline: false }
        )
        .setImage(BANNER_IMAGE)
        .setFooter({ text: "🌠 ElNaaR Cosmic Empire — ElNaaR" });
      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
  } catch (error) {
    console.error("❌ Failed to handle message:", error);
  }
});

client.login(token).catch((error) => {
  console.error("❌ Discord login failed. Check DISCORD_TOKEN in EuizHost.");
  console.error(error.message);
  process.exit(1);
});
