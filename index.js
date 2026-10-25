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
const BACKGROUND_PATH = './welcome-bg.png'; 

// ═══════════════════════════════════════
// تسجيل الخط
// ═══════════════════════════════════════
try {
  GlobalFonts.registerFromPath('./font.ttf', 'MyFont');
  console.log('✅ تم تحميل الخط بنجاح');
} catch (e) {
  console.log('⚠️ تحذير: ملف font.ttf مش موجود، النص ممكن ميظهرش');
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
// WELCOME IMAGE — FIERY HUD DESIGN
// ═══════════════════════════════════════

async function makeWelcomeImage(member) {
  const bg = await loadImage(BACKGROUND_PATH);
  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(bg, 0, 0, bg.width, bg.height);

  const centerY = bg.height / 2;

  // ═══════════════════════════════
  // 1. تصميم البطاقة النارية (HUD Style)
  // ═══════════════════════════════
  const boxW = 520;
  const boxH = 580;
  const boxX = bg.width - boxW - 60;
  const boxY = centerY - (boxH / 2);
  const cut = 25; // حجم الزاوية المقطوعة

  // أ. الخلفية السوداء بتدرج أحمر ناري
  const cardGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
  cardGrad.addColorStop(0, 'rgba(40, 0, 0, 0.9)');
  cardGrad.addColorStop(0.5, 'rgba(10, 0, 0, 0.95)');
  cardGrad.addColorStop(1, 'rgba(30, 0, 0, 0.9)');

  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  // رسم شكل الزوايا المقطوعة (HUD)
  ctx.moveTo(boxX + cut, boxY);
  ctx.lineTo(boxX + boxW - cut, boxY);
  ctx.lineTo(boxX + boxW, boxY + cut);
  ctx.lineTo(boxX + boxW, boxY + boxH - cut);
  ctx.lineTo(boxX + boxW - cut, boxY + boxH);
  ctx.lineTo(boxX + cut, boxY + boxH);
  ctx.lineTo(boxX, boxY + boxH - cut);
  ctx.lineTo(boxX, boxY + cut);
  ctx.closePath();
  ctx.fill();

  // ب. الإطار الناري المتوهج
  ctx.shadowColor = '#ff3300';
  ctx.shadowBlur = 35;
  ctx.strokeStyle = '#ff5500';
  ctx.lineWidth = 6;
  ctx.stroke(); // رسم نفس الشكل

  // ج. إطار داخلي رفيع بلون ذهبي عشان يدي فخامة
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.stroke();

  // ═══════════════════════════════
  // 2. الصورة الشخصية (مع إضاءة نارية)
  // ═══════════════════════════════
  const avatarCX = boxX + 130;
  const avatarCY = boxY + 170;
  const avatarR = 85;

  // هالة نارية حوالين الصورة
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR + 15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 51, 0, 0.2)';
  ctx.fill();

  // الدائرة السوداء
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();
  
  // إطار الصورة المتوهج
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#ff3300';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // وضع الصورة
  try {
    const avatarUrl = member.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
    ctx.clip();
    const diameter = avatarR * 2;
    const scale = Math.max(diameter / avatar.width, diameter / avatar.height);
    const drawW = avatar.width * scale;
    const drawH = avatar.height * scale;
    ctx.drawImage(avatar, avatarCX - drawW / 2, avatarCY - drawH / 2, drawW, drawH);
    ctx.restore();
  } catch (e) {
    console.log("مش قادر يحمل الصورة");
  }

  // ═══════════════════════════════
  // 3. النصوص (توهج ناري)
  // ═══════════════════════════════
  
  // كلمة NEW MEMBER
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700'; // ذهبي
  ctx.font = 'bold 35px "MyFont"';
  ctx.shadowColor = '#ff3300';
  ctx.shadowBlur = 10;
  ctx.fillText('NEW MEMBER', boxX + (boxW / 2) + 40, boxY + 80);
  ctx.shadowBlur = 0;

  // خط فاصل ناري
  const lineGrad = ctx.createLinearGradient(boxX + 40, 0, boxX + boxW - 40, 0);
  lineGrad.addColorStop(0, 'rgba(255, 51, 0, 0)');
  lineGrad.addColorStop(0.5, '#ff5500');
  lineGrad.addColorStop(1, 'rgba(255, 51, 0, 0)');
  
  ctx.beginPath();
  ctx.moveTo(boxX + 40, boxY + 250);
  ctx.lineTo(boxX + boxW - 40, boxY + 250);
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 3;
  ctx.stroke();

  // الاسم (بحجم كبير وتوهج)
  const username = member.user.globalName || member.user.username;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px "MyFont"'; 
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff5500';
  ctx.shadowBlur = 15;
  ctx.fillText(username, boxX + (boxW / 2), boxY + 310);
  ctx.shadowBlur = 0;

  // رقم العضو
  ctx.textAlign = 'left';
  
  // كلمة MEMBER #
  ctx.fillStyle = '#ffaa00';
  ctx.font = 'bold 24px "MyFont"';
  ctx.fillText('MEMBER #', boxX + 50, boxY + 390);
  
  // الرقم نفسه
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px "MyFont"';
  ctx.fillText(String(member.guild.memberCount), boxX + 210, boxY + 390);

  // تاريخ الانضمام
  const joinedDate = (member.joinedAt || new Date()).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Africa/Cairo'
  });

  // كلمة JOINED:
  ctx.fillStyle = '#ffaa00';
  ctx.font = 'bold 24px "MyFont"';
  ctx.fillText('JOINED:', boxX + 50, boxY + 460);

  // التاريخ
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px "MyFont"';
  ctx.fillText(joinedDate, boxX + 160, boxY + 460);

  // إضافة لمسة نارية أسفل البطاقة (خط متوهج)
  ctx.beginPath();
  ctx.moveTo(boxX + 100, boxY + boxH - 30);
  ctx.lineTo(boxX + boxW - 100, boxY + boxH - 30);
  ctx.strokeStyle = '#ff3300';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#ff5500';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

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

    const embed = new EmbedBuilder()
      .setColor(0xff5a0a)
      .setTitle('🔥 شرارة جديدة انضمت إلى ElNaaR!')
      .setDescription(`أهلًا ${member} في **ElNaaR — BORN IN FIRE** 👑\n\n🔥 مش مجرد سيرفر؛ دي عيلة بتكبر بكل أسطورة جديدة.\n⚔️ احترم الجميع، شاركنا الحماس، وخلي وجودك علامة مميزة!`)
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '👑 العضو رقم', value: `**${member.guild.memberCount}**`, inline: true },
        { name: '📅 تاريخ الانضمام', value: `<t:${Math.floor(Date.now() / 1000)}:D>`, inline: true },
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

  const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setFooter({ text: 'ELNAAR • BORN IN FIRE 🔥' }).setTimestamp();
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
    if (!isOwner(message.author.id)) return await message.reply('⛔ أوامر الإدارة متاحة لمدير ElNaaR فقط.');

    if (command === '!panel') {
      const panel = new EmbedBuilder().setColor(0xff5a0a).setTitle('👑 ELNAAR | OWNER CONTROL PANEL')
        .setDescription('🔥 أهلًا بمدير الإمبراطورية!\n\n**أوامر التحكم المتاحة:**\n`!panel` — عرض لوحة التحكم\n`!welcome @member` — إعادة إرسال ترحيب لعضو\n`!say الرسالة` — إرسال رسالة باسم البوت\n`!stats` — إحصائيات السيرفر والبوت\n`!helpadmin` — المساعدة الإدارية\n\n🔐 لوحة الإدارة مخصصة لصاحب الحساب المعتمد فقط.')
        .setFooter({ text: 'ELNAAR • BORN IN FIRE 🔥' }).setTimestamp();
      return await message.reply({ embeds: [panel] });
    }

    if (command === '!helpadmin') {
      const help = new EmbedBuilder().setColor(0xff6a00).setTitle('📜 ELNAAR ADMIN COMMANDS')
        .setDescription('`!panel`\nعرض لوحة تحكم المسؤول.\n\n`!welcome @member`\nإعادة إرسال رسالة الترحيب للعضو مع الصورة.\n\n`!say اكتب رسالتك هنا`\nإرسال رسالة من البوت.\n\n`!stats`\nعرض إحصائيات السيرفر والبوت.')
        .setFooter({ text: 'OWNER ONLY • ELNAAR 🔥' }).setTimestamp();
      return await message.reply({ embeds: [help] });
    }

    if (command === '!say') {
      const textToSend = content.slice(command.length).trim();
      if (!textToSend) return await message.reply('⚠️ اكتب الرسالة بعد الأمر.\nمثال: `!say أهلًا بكم في ElNaaR 🔥`');
      await message.channel.send({ content: textToSend, allowedMentions: { parse: [] } });
      return await message.react('✅').catch(() => {});
    }

    if (command === '!stats') {
      const guild = message.guild;
      const stats = new EmbedBuilder().setColor(0xff5a0a).setTitle('📊 ELNAAR SERVER STATISTICS')
        .addFields(
          { name: '👑 اسم السيرفر', value: guild.name, inline: false },
          { name: '👥 عدد الأعضاء', value: `${guild.memberCount}`, inline: true },
          { name: '💬 عدد القنوات', value: `${guild.channels.cache.size}`, inline: true },
          { name: '🤖 اسم البوت', value: client.user.tag, inline: false },
          { name: '🌋 حالة البوت', value: '🟢 متصل', inline: true }
        ).setFooter({ text: 'ELNAAR • BORN IN FIRE 🔥' }).setTimestamp();
      return await message.reply({ embeds: [stats] });
    }

    if (command === '!welcome') {
      const target = message.mentions.members.first();
      if (!target) return await message.reply('⚠️ منشن العضو المطلوب.\nمثال: `!welcome @member`');

      const channel = await target.guild.channels.fetch(welcomeChannelId).catch(() => null);
      if (!channel || !channel.isTextBased() || !channel.send) return await message.reply('❌ مش قادر أوصل لقناة الترحيب.');

      let files = [];
      try { files = [await makeWelcomeImage(target)]; } catch (e) { console.error(e); }

      const embed = new EmbedBuilder().setColor(0xff5a0a).setTitle('🔥 شرارة جديدة انضمت إلى ElNaaR!')
        .setDescription(`أهلًا ${target} في **ElNaaR — BORN IN FIRE** 👑\n\n🔥 مش مجرد سيرفر؛ دي عيلة بتكبر بكل أسطورة جديدة.\n⚔️ احترم الجميع، شاركنا الحماس، وخلي وجودك علامة مميزة!`)
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👑 العضو رقم', value: `**${target.guild.memberCount}**`, inline: true },
          { name: '📅 تاريخ الانضمام', value: `<t:${Math.floor(Date.now() / 1000)}:D>`, inline: true },
          { name: '🌋 هويتنا', value: '**ELNAAR • BORN IN FIRE**', inline: false }
        ).setFooter({ text: 'ELNAAR • RESPECT • UNITY • FIRE 🔥' }).setTimestamp();

      if (files.length) embed.setImage('attachment://elnaar-welcome.png');

      await channel.send({
        content: `🔥 أهلًا ${target}! الإمبراطورية نورت بوجودك. 🔥`,
        embeds: [embed], files, allowedMentions: { users: [target.id] }
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
