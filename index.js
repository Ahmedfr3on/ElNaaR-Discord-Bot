const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  AttachmentBuilder,
  ActivityType
} = require('discord.js');

const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

const token = process.env.DISCORD_TOKEN;

// ═══════════════════════════════════════
// ELNAAR OWNER SETTINGS
// ═══════════════════════════════════════

const OWNER_ID = "1055282336784195674";
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID || '1561910009753903206';
const replyChannelId = process.env.REPLY_CHANNEL_ID || '1561116825847079005';

// ضع الصورة الجديدة في نفس مجلد index.js بهذا الاسم بالضبط
const BACKGROUND_PATH = './welcome-bg.png';

// ═══════════════════════════════════════
// تسجيل الخط
// ═══════════════════════════════════════
try {
  GlobalFonts.registerFromPath('./font.ttf', 'MyFont');
  console.log('✅ تم تحميل الخط بنجاح');
} catch (e) {
  console.log('⚠️ تحذير: ملف font.ttf مش موجود، سيتم استخدام خط بديل');
}

if (!token) {
  console.error('❌ DISCORD_TOKEN مش موجود.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

function isOwner(userId) {
  return userId === OWNER_ID;
}

// ═══════════════════════════════════════
// WELCOME IMAGE — NEW ELNAAR BACKGROUND
// الصورة الجديدة تظل كما هي، ونضيف بيانات العضو في شريط أسفلها
// ═══════════════════════════════════════

async function makeWelcomeImage(member) {
  const bg = await loadImage(BACKGROUND_PATH);

  // شريط معلومات أسفل الصورة حتى لا نغطي أي جزء من التصميم الأصلي
  const infoHeight = 285;
  const canvas = createCanvas(bg.width, bg.height + infoHeight);
  const ctx = canvas.getContext('2d');

  // رسم الصورة الجديدة بدون تغيير تصميمها
  ctx.drawImage(bg, 0, 0, bg.width, bg.height);

  // خلفية الشريط السفلي
  const panelY = bg.height;
  const panelGrad = ctx.createLinearGradient(0, panelY, 0, panelY + infoHeight);
  panelGrad.addColorStop(0, '#160606');
  panelGrad.addColorStop(0.5, '#080808');
  panelGrad.addColorStop(1, '#1b0505');
  ctx.fillStyle = panelGrad;
  ctx.fillRect(0, panelY, bg.width, infoHeight);

  // إطار ناري علوي وسفلي
  ctx.save();
  ctx.shadowColor = '#ff2a00';
  ctx.shadowBlur = 22;
  ctx.strokeStyle = '#ff3b0a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(35, panelY + 8);
  ctx.lineTo(bg.width - 35, panelY + 8);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#b98b24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(35, panelY + infoHeight - 10);
  ctx.lineTo(bg.width - 35, panelY + infoHeight - 10);
  ctx.stroke();
  ctx.restore();

  const centerY = panelY + infoHeight / 2;

  // الصورة الشخصية
  const avatarR = 82;
  const avatarX = 155;
  const avatarY = centerY + 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR + 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 55, 0, 0.22)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#050505';
  ctx.fill();

  ctx.shadowColor = '#ff3b0a';
  ctx.shadowBlur = 22;
  ctx.strokeStyle = '#ffb52e';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  try {
    const avatarUrl = member.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarUrl);
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.clip();

    const diameter = avatarR * 2;
    const scale = Math.max(diameter / avatar.width, diameter / avatar.height);
    const drawW = avatar.width * scale;
    const drawH = avatar.height * scale;
    ctx.drawImage(
      avatar,
      avatarX - drawW / 2,
      avatarY - drawH / 2,
      drawW,
      drawH
    );
  } catch (error) {
    console.error('[WELCOME AVATAR] تعذر تحميل صورة العضو:', error.message);
  }
  ctx.restore();

  // بيانات العضو
  const username = member.user.globalName || member.user.username;
  const memberNumber = String(member.guild.memberCount);
  const joinedAt = member.joinedAt || new Date();
  const joinedDate = joinedAt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Cairo'
  });

  const textX = 300;
  const rightEdge = bg.width - 65;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // NEW MEMBER
  ctx.fillStyle = '#ffbd35';
  ctx.font = 'bold 31px MyFont, Arial';
  ctx.shadowColor = '#ff3b0a';
  ctx.shadowBlur = 12;
  ctx.fillText('🔥  NEW MEMBER', textX, panelY + 55);
  ctx.shadowBlur = 0;

  // اسم العضو مع تصغير تلقائي لو الاسم طويل
  let nameFontSize = 43;
  ctx.font = `bold ${nameFontSize}px MyFont, Arial`;
  while (ctx.measureText(username).width > rightEdge - textX && nameFontSize > 25) {
    nameFontSize -= 2;
    ctx.font = `bold ${nameFontSize}px MyFont, Arial`;
  }

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ff4a0a';
  ctx.shadowBlur = 13;
  ctx.fillText(username, textX, panelY + 112);
  ctx.shadowBlur = 0;

  // رقم العضوية
  ctx.fillStyle = '#ffbd35';
  ctx.font = 'bold 27px MyFont, Arial';
  ctx.fillText('MEMBER #', textX, panelY + 190);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 29px MyFont, Arial';
  ctx.fillText(memberNumber, textX + 190, panelY + 190);

  // تاريخ الانضمام
  ctx.fillStyle = '#ffbd35';
  ctx.font = 'bold 27px MyFont, Arial';
  ctx.fillText('JOINED:', textX + 360, panelY + 190);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 27px MyFont, Arial';
  ctx.fillText(joinedDate, textX + 475, panelY + 190);

  // الهوية
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ff4a0a';
  ctx.font = 'bold 22px MyFont, Arial';
  ctx.fillText('ELNAAR • RESPECT • UNITY • FIRE 🔥', rightEdge, panelY + 245);

  return new AttachmentBuilder(await canvas.encode('png'), {
    name: 'elnaar-welcome.png'
  });
}

// ═══════════════════════════════════════
// BOT READY
// ═══════════════════════════════════════

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🔥 ELNAAR ONLINE: ${readyClient.user.tag}`);
  readyClient.user.setPresence({
    activities: [{ name: '🔥 ElNaaR | BORN IN FIRE', type: ActivityType.Watching }],
    status: 'online',
  });
});

// ═══════════════════════════════════════
// AUTOMATIC WELCOME
// ═══════════════════════════════════════

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = await member.guild.channels.fetch(welcomeChannelId).catch(() => null);
    if (!channel || !channel.isTextBased() || !channel.send) return;

    let files = [];
    try {
      files = [await makeWelcomeImage(member)];
    } catch (imageError) {
      console.error('[WELCOME IMAGE] تعذر تجهيز الصورة:', imageError);
    }

    const joinedAt = member.joinedAt || new Date();

    const embed = new EmbedBuilder()
      .setColor(0xff5a0a)
      .setTitle('🔥 شرارة جديدة انضمت إلى ElNaaR!')
      .setDescription(`أهلًا ${member} في **ElNaaR — BORN IN FIRE** 👑\n\n🔥 مش مجرد سيرفر؛ دي عيلة بتكبر بكل أسطورة جديدة.\n⚔️ احترم الجميع، شاركنا الحماس، وخلي وجودك علامة مميزة!`)
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '👑 العضو رقم', value: `**${member.guild.memberCount}**`, inline: true },
        { name: '📅 تاريخ الانضمام', value: `<t:${Math.floor(joinedAt.getTime() / 1000)}:D>`, inline: true },
        { name: '🌋 هويتنا', value: '**ELNAAR • BORN IN FIRE**', inline: false }
      )
      .setFooter({ text: 'ELNAAR • RESPECT • UNITY • FIRE 🔥' })
      .setTimestamp();

    if (files.length) embed.setImage('attachment://elnaar-welcome.png');

    await channel.send({
      content: `🔥 أهلًا ${member}! الإمبراطورية نورت بوجودك. 🔥`,
      embeds: [embed],
      files,
      allowedMentions: { users: [member.id] },
    });

  } catch (error) {
    console.error('[WELCOME] خطأ أثناء الترحيب:', error);
  }
});

// ═══════════════════════════════════════
// AUTOMATIC REPLIES
// ═══════════════════════════════════════

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot || message.channel.id !== replyChannelId) return;

  const msg = message.content.trim().toLowerCase();
  let title, description, color = 0xff5a0a;

  if (['السلام عليكم', 'سلام عليكم', 'salam', 'salaam'].includes(msg)) {
    title = '🔥 وعليكم السلام ورحمة الله وبركاته';
    description = `أهلًا ${message.author}، نوّرت ElNaaR! 🌋`;
  } else if (['ازيك', 'إزيك', 'اخبارك', 'أخبارك', 'how are you', 'how r u'].includes(msg)) {
    title = '⚡ النار مولّعة والحماس عالي!';
    description = `أنا تمام يا ${message.author} 🔥 إنت أخبارك إيه؟`;
  } else if (['صباح الخير', 'صباح الفل', 'صباح النور', 'good morning'].includes(msg)) {
    title = '🌅 صباح كله طاقة!';
    description = `صباح النور يا ${message.author}، يومك يبقى مليان انتصارات! 🔥`;
    color = 0xffb000;
  } else if (['مساء الخير', 'مساء الفل', 'good evening', 'good night'].includes(msg)) {
    title = '🌙 مساء الحماس يا بطل!';
    description = `نورت الشات يا ${message.author}، خلي ليلتك أسطورية! 🌋`;
  } else if (['مين عملك', 'مين صنعك', 'مين المطور', 'who made you', 'developer'].includes(msg)) {
    title = '👑 مطوّر ElNaaR';
    description = 'تم تجهيز بوت ElNaaR لخدمة أعضاء الإمبراطورية. 🔥';
  } else if (['الاوامر', 'الأوامر', 'اوامر', 'مساعدة', 'help', 'commands'].includes(msg)) {
    title = '📜 أوامر ElNaaR';
    description = '🔥 السلام عليكم • إزيك • صباح الخير • مساء الخير • مين المطور\n' + 'اكتب أي تحية من دول وأنا هرد عليك هنا.';
  } else {
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'ELNAAR • BORN IN FIRE 🔥' })
    .setTimestamp();

  await message.reply({ embeds: [embed] }).catch((error) => console.error('[REPLY]', error));
});

// ═══════════════════════════════════════
// OWNER COMMANDS
// ═══════════════════════════════════════

client.on(Events.MessageCreate, async (message) => {
  try {
    if (!message.guild || message.author.bot) return;
    const content = message.content.trim();
    const adminCommands = ['!panel', '!welcome', '!say', '!stats', '!helpadmin'];
    const command = content.split(/\s+/)[0].toLowerCase();

    if (!adminCommands.includes(command)) return;
    if (!isOwner(message.author.id)) {
      return await message.reply('⛔ أوامر الإدارة متاحة لمدير ElNaaR فقط.');
    }

    if (command === '!panel') {
      const panel = new EmbedBuilder()
        .setColor(0xff5a0a)
        .setTitle('👑 ELNAAR | OWNER CONTROL PANEL')
        .setDescription('🔥 أهلًا بمدير الإمبراطورية!\n\n**أوامر التحكم المتاحة:**\n`!panel` — عرض لوحة التحكم\n`!welcome @member` — إعادة إرسال ترحيب لعضو\n`!say الرسالة` — إرسال رسالة باسم البوت\n`!stats` — إحصائيات السيرفر والبوت\n`!helpadmin` — المساعدة الإدارية\n\n🔐 لوحة الإدارة مخصصة لصاحب الحساب المعتمد فقط.')
        .setFooter({ text: 'ELNAAR • BORN IN FIRE 🔥' })
        .setTimestamp();
      return await message.reply({ embeds: [panel] });
    }

    if (command === '!helpadmin') {
      const help = new EmbedBuilder()
        .setColor(0xff6a00)
        .setTitle('📜 ELNAAR ADMIN COMMANDS')
        .setDescription('`!panel`\nعرض لوحة تحكم المسؤول.\n\n`!welcome @member`\nإعادة إرسال رسالة الترحيب للعضو مع الصورة.\n\n`!say اكتب رسالتك هنا`\nإرسال رسالة من البوت.\n\n`!stats`\nعرض إحصائيات السيرفر والبوت.')
        .setFooter({ text: 'OWNER ONLY • ELNAAR 🔥' })
        .setTimestamp();
      return await message.reply({ embeds: [help] });
    }

    if (command === '!say') {
      const textToSend = content.slice(command.length).trim();
      if (!textToSend) {
        return await message.reply('⚠️ اكتب الرسالة بعد الأمر.\nمثال: `!say أهلًا بكم في ElNaaR 🔥`');
      }
      await message.channel.send({ content: textToSend, allowedMentions: { parse: [] } });
      return await message.react('✅').catch(() => {});
    }

    if (command === '!stats') {
      const guild = message.guild;
      const stats = new EmbedBuilder()
        .setColor(0xff5a0a)
        .setTitle('📊 ELNAAR SERVER STATISTICS')
        .addFields(
          { name: '👑 اسم السيرفر', value: guild.name, inline: false },
          { name: '👥 عدد الأعضاء', value: `${guild.memberCount}`, inline: true },
          { name: '💬 عدد القنوات', value: `${guild.channels.cache.size}`, inline: true },
          { name: '🤖 اسم البوت', value: client.user.tag, inline: false },
          { name: '🌋 حالة البوت', value: '🟢 متصل', inline: true }
        )
        .setFooter({ text: 'ELNAAR • BORN IN FIRE 🔥' })
        .setTimestamp();
      return await message.reply({ embeds: [stats] });
    }

    if (command === '!welcome') {
      const target = message.mentions.members.first();
      if (!target) {
        return await message.reply('⚠️ منشن العضو المطلوب.\nمثال: `!welcome @member`');
      }

      const channel = await target.guild.channels.fetch(welcomeChannelId).catch(() => null);
      if (!channel || !channel.isTextBased() || !channel.send) {
        return await message.reply('❌ مش قادر أوصل لقناة الترحيب.');
      }

      let files = [];
      try {
        files = [await makeWelcomeImage(target)];
      } catch (e) {
        console.error('[MANUAL WELCOME IMAGE]', e);
      }

      const joinedAt = target.joinedAt || new Date();

      const embed = new EmbedBuilder()
        .setColor(0xff5a0a)
        .setTitle('🔥 شرارة جديدة انضمت إلى ElNaaR!')
        .setDescription(`أهلًا ${target} في **ElNaaR — BORN IN FIRE** 👑\n\n🔥 مش مجرد سيرفر؛ دي عيلة بتكبر بكل أسطورة جديدة.\n⚔️ احترم الجميع، شاركنا الحماس، وخلي وجودك علامة مميزة!`)
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👑 العضو رقم', value: `**${target.guild.memberCount}**`, inline: true },
          { name: '📅 تاريخ الانضمام', value: `<t:${Math.floor(joinedAt.getTime() / 1000)}:D>`, inline: true },
          { name: '🌋 هويتنا', value: '**ELNAAR • BORN IN FIRE**', inline: false }
        )
        .setFooter({ text: 'ELNAAR • RESPECT • UNITY • FIRE 🔥' })
        .setTimestamp();

      if (files.length) embed.setImage('attachment://elnaar-welcome.png');

      await channel.send({
        content: `🔥 أهلًا ${target}! الإمبراطورية نورت بوجودك. 🔥`,
        embeds: [embed],
        files,
        allowedMentions: { users: [target.id] }
      });

      return await message.reply('✅ تم إرسال الترحيب للعضو بنجاح.');
    }
  } catch (error) {
    console.error('[OWNER COMMAND ERROR]', error);
    await message.reply('❌ حصل خطأ أثناء تنفيذ الأمر.').catch(() => {});
  }
});

client.login(token).catch((error) => {
  console.error('❌ فشل تسجيل الدخول:', error.message);
});
