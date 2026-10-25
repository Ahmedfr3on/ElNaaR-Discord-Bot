const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  AttachmentBuilder,
  ActivityType
} = require('discord.js');

const { createCanvas, loadImage } = require('@napi-rs/canvas');

const token = process.env.DISCORD_TOKEN;

// ID المدير الوحيد
const OWNER_ID = "1055282336784195674";

const welcomeChannelId =
  process.env.WELCOME_CHANNEL_ID || '1561910009753903206';

const replyChannelId =
  process.env.REPLY_CHANNEL_ID || '1561116825847079005';

const BACKGROUND_PATH = './welcome-bg.png';

if (!token) {
  console.error(
    '❌ DISCORD_TOKEN مش موجود. ضيفه في Environment Variables في EuizHost.'
  );
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

// التحقق من أن الأمر صادر من المدير فقط
function isOwner(userId) {
  return userId === OWNER_ID;
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y);
  ctx.closePath();
}

async function makeWelcomeImage(member) {
  const bg = await loadImage(BACKGROUND_PATH);
  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(bg, 0, 0, bg.width, bg.height);

  const x = Math.round(bg.width * 0.675);
  const w = Math.round(bg.width * 0.30);
  const top = Math.round(bg.height * 0.175);
  const panelH = Math.round(bg.height * 0.57);

  ctx.save();
  ctx.shadowColor = '#ff4b0b';
  ctx.shadowBlur = 24;
  roundedRect(ctx, x, top, w, panelH, 22);
  ctx.fillStyle = 'rgba(8, 5, 6, 0.97)';
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#ff6a00';
  ctx.lineWidth = 3;
  roundedRect(ctx, x, top, w, panelH, 22);
  ctx.stroke();

  const pad = Math.round(w * 0.075);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ff7a18';
  ctx.font = 'bold 36px Sans';
  ctx.fillText('A NEW LEGEND RISES', x + pad, top + 58, w - pad * 2);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Sans';
  ctx.fillText('WELCOME TO ELNAAR', x + pad, top + 112, w - pad * 2);

  ctx.fillStyle = '#ffd27a';
  ctx.font = '24px Sans';
  ctx.fillText(
    'BORN IN FIRE  •  BUILT TO RISE',
    x + pad,
    top + 151,
    w - pad * 2
  );

  const avatarSize = Math.round(w * 0.34);
  const avatarX = x + pad;
  const avatarY = top + 190;

  ctx.save();
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2 + 5,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = '#ff6a00';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.clip();

  const avatarUrl = member.displayAvatarURL({
    extension: 'png',
    size: 256
  });

  const avatar = await loadImage(avatarUrl);
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  const textX = avatarX + avatarSize + Math.round(w * 0.055);
  const textW = x + w - pad - textX;

  ctx.fillStyle = '#ff9a25';
  ctx.font = 'bold 22px Sans';
  ctx.fillText('NEW MEMBER', textX, avatarY + 30, textW);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Sans';

  const username = member.user.globalName || member.user.username;
  ctx.fillText(username, textX, avatarY + 70, textW);

  ctx.fillStyle = '#ffd27a';
  ctx.font = '20px Sans';
  ctx.fillText(
    `MEMBER #${member.guild.memberCount}`,
    textX,
    avatarY + 105,
    textW
  );

  const joined = (member.joinedAt || new Date()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Cairo'
  });

  ctx.strokeStyle = 'rgba(255,106,0,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + pad, top + panelH - 105);
  ctx.lineTo(x + w - pad, top + panelH - 105);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '22px Sans';
  ctx.fillText(
    `JOINED: ${joined}`,
    x + pad,
    top + panelH - 65,
    w - pad * 2
  );

  ctx.fillStyle = '#ff7a18';
  ctx.font = 'bold 24px Sans';
  ctx.fillText(
    '🔥  TOGETHER WE RISE  👑',
    x + pad,
    top + panelH - 25,
    w - pad * 2
  );

  return new AttachmentBuilder(await canvas.encode('png'), {
    name: 'elnaar-welcome.png'
  });
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🔥 ELNAAR ONLINE: ${readyClient.user.tag}`);
  console.log(`👑 OWNER ID: ${OWNER_ID}`);

  readyClient.user.setPresence({
    activities: [
      {
        name: '🔥 ElNaaR | BORN IN FIRE',
        type: ActivityType.Watching
      }
    ],
    status: 'online',
  });
});

// الترحيب التلقائي بالأعضاء الجدد
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = await member.guild.channels
      .fetch(welcomeChannelId)
      .catch(() => null);

    if (!channel || !channel.isTextBased() || !channel.send) {
      console.error('[WELCOME] راجع WELCOME_CHANNEL_ID وصلاحيات البوت.');
      return;
    }

    let files = [];

    try {
      files = [await makeWelcomeImage(member)];
    } catch (imageError) {
      console.error(
        '[WELCOME IMAGE] تعذر تجهيز الصورة، هنبعت ترحيب عادي:',
        imageError
      );
    }

    const embed = new EmbedBuilder()
      .setColor(0xff5a0a)
      .setTitle('🔥 شرارة جديدة انضمت إلى ElNaaR!')
      .setDescription(
        `أهلًا ${member} في **ElNaaR — BORN IN FIRE** 👑\n\n` +
        '🔥 مش مجرد سيرفر؛ دي عيلة بتكبر بكل أسطورة جديدة.\n' +
        '⚔️ احترم الجميع، شاركنا الحماس، وخلي وجودك علامة مميزة!'
      )
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .addFields(
        {
          name: '👑 العضو رقم',
          value: `**${member.guild.memberCount}**`,
          inline: true
        },
        {
          name: '📅 تاريخ الانضمام',
          value: `<t:${Math.floor(Date.now() / 1000)}:D>`,
          inline: true
        },
        {
          name: '🌋 هويتنا',
          value: '**ELNAAR • BORN IN FIRE**',
          inline: false
        }
      )
      .setFooter({
        text: 'ELNAAR • RESPECT • UNITY • FIRE 🔥'
      })
      .setTimestamp();

    if (files.length) {
      embed.setImage('attachment://elnaar-welcome.png');
    }

    await channel.send({
      content: `🔥 أهلًا ${member}! الإمبراطورية نورت بوجودك. 🔥`,
      embeds: [embed],
      files,
      allowedMentions: { users: [member.id] },
    });

    console.log(`[WELCOME] تم الترحيب بـ ${member.user.tag}`);
  } catch (error) {
    console.error('[WELCOME] خطأ أثناء الترحيب:', error);
  }
});

// الردود التلقائية في قناة الردود المحددة فقط
client.on(Events.MessageCreate, async (message) => {
  if (
    !message.guild ||
    message.author.bot ||
    message.channel.id !== replyChannelId
  ) {
    return;
  }

  const msg = message.content.trim().toLowerCase();

  let title;
  let description;
  let color = 0xff5a0a;

  if (['السلام عليكم', 'سلام عليكم', 'salam', 'salaam'].includes(msg)) {
    title = '🔥 وعليكم السلام ورحمة الله وبركاته';
    description = `أهلًا ${message.author}، نوّرت ElNaaR! 🌋`;

  } else if (
    ['ازيك', 'إزيك', 'اخبارك', 'أخبارك', 'how are you', 'how r u'].includes(msg)
  ) {
    title = '⚡ النار مولّعة والحماس عالي!';
    description = `أنا تمام يا ${message.author} 🔥 إنت أخبارك إيه؟`;

  } else if (
    ['صباح الخير', 'صباح الفل', 'صباح النور', 'good morning'].includes(msg)
  ) {
    title = '🌅 صباح كله طاقة!';
    description = `صباح النور يا ${message.author}، يومك يبقى مليان انتصارات! 🔥`;
    color = 0xffb000;

  } else if (
    ['مساء الخير', 'مساء الفل', 'good evening', 'good night'].includes(msg)
  ) {
    title = '🌙 مساء الحماس يا بطل!';
    description = `نورت الشات يا ${message.author}، خلي ليلتك أسطورية! 🌋`;

  } else if (
    ['مين عملك', 'مين صنعك', 'مين المطور', 'who made you', 'developer'].includes(msg)
  ) {
    title = '👑 مطوّر ElNaaR';
    description = 'تم تجهيز بوت ElNaaR لخدمة أعضاء الإمبراطورية. 🔥';

  } else if (
    ['الاوامر', 'الأوامر', 'اوامر', 'مساعدة', 'help', 'commands'].includes(msg)
  ) {
    title = '📜 أوامر ElNaaR';
    description =
      '🔥 السلام عليكم • إزيك • صباح الخير • مساء الخير • مين المطور\n' +
      'اكتب أي تحية من دول وأنا هرد عليك هنا.';

  } else {
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'ELNAAR • BORN IN FIRE 🔥' })
    .setTimestamp();

  await message.reply({ embeds: [embed] }).catch((error) => {
    console.error('[REPLY]', error);
  });
});

// أمر اختبار بسيط للإدارة: !owner
// لا يستجيب إلا لحساب المدير المحدد أعلاه.
client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.trim().toLowerCase().startsWith('!owner')) return;

  if (!isOwner(message.author.id)) {
    await message.reply('⛔ الأمر ده متاح لمدير البوت فقط.').catch(() => {});
    return;
  }

  await message.reply(
    '👑 أهلًا يا مدير ElNaaR! تم التأكد من هويتك بنجاح. 🔥'
  ).catch(() => {});
});

client.login(token).catch((error) => {
  console.error(
    '❌ فشل تسجيل الدخول. راجع DISCORD_TOKEN وبيانات البوت:',
    error.message
  );
});
  const avatarY = top + 190;
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ff6a00';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();
  const avatarUrl = member.displayAvatarURL({ extension: 'png', size: 256 });
  const avatar = await loadImage(avatarUrl);
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  const textX = avatarX + avatarSize + Math.round(w * 0.055);
  const textW = x + w - pad - textX;
  ctx.fillStyle = '#ff9a25';
  ctx.font = 'bold 22px Sans';
  ctx.fillText('NEW MEMBER', textX, avatarY + 30, textW);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Sans';
  const username = member.user.globalName || member.user.username;
  ctx.fillText(username, textX, avatarY + 70, textW);
  ctx.fillStyle = '#ffd27a';
  ctx.font = '20px Sans';
  ctx.fillText(`MEMBER #${member.guild.memberCount}`, textX, avatarY + 105, textW);

  const joined = (member.joinedAt || new Date()).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Africa/Cairo'
  });
  ctx.strokeStyle = 'rgba(255,106,0,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + pad, top + panelH - 105);
  ctx.lineTo(x + w - pad, top + panelH - 105);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px Sans';
  ctx.fillText(`JOINED: ${joined}`, x + pad, top + panelH - 65, w - pad * 2);
  ctx.fillStyle = '#ff7a18';
  ctx.font = 'bold 24px Sans';
  ctx.fillText('🔥  TOGETHER WE RISE  👑', x + pad, top + panelH - 25, w - pad * 2);

  return new AttachmentBuilder(await canvas.encode('png'), { name: 'elnaar-welcome.png' });
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🔥 ELNAAR ONLINE: ${readyClient.user.tag}`);
  readyClient.user.setPresence({
    activities: [{ name: '🔥 ElNaaR | BORN IN FIRE', type: ActivityType.Watching }],
    status: 'online',
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = await member.guild.channels.fetch(welcomeChannelId).catch(() => null);
    if (!channel || !channel.isTextBased() || !channel.send) {
      console.error('[WELCOME] راجع WELCOME_CHANNEL_ID وصلاحيات البوت.');
      return;
    }

    let files = [];
    try {
      files = [await makeWelcomeImage(member)];
    } catch (imageError) {
      console.error('[WELCOME IMAGE] تعذر تجهيز الصورة، هنبعت ترحيب عادي:', imageError);
    }

    const embed = new EmbedBuilder()
      .setColor(0xff5a0a)
      .setTitle('🔥 شرارة جديدة انضمت إلى ElNaaR!')
      .setDescription(
        `أهلًا ${member} في **ElNaaR — BORN IN FIRE** 👑\n\n` +
        '🔥 مش مجرد سيرفر؛ دي عيلة بتكبر بكل أسطورة جديدة.\n' +
        '⚔️ احترم الجميع، شاركنا الحماس، وخلي وجودك علامة مميزة!'
      )
      .setThumbnail(member.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '👑 العضو رقم', value: `**${member.guild.memberCount}**`, inline: true },
        { name: '📅 تاريخ الانضمام', value: `<t:${Math.floor(Date.now() / 1000)}:D>`, inline: true },
        { name: '🌋 هويتنا', value: '**ELNAAR • BORN IN FIRE**', inline: false },
      )
      .setFooter({ text: 'ELNAAR • RESPECT • UNITY • FIRE 🔥' })
      .setTimestamp();

    if (files.length) embed.setImage('attachment://elnaar-welcome.png');
    await channel.send({
      content: `🔥 أهلًا ${member}! الإمبراطورية نورت بوجودك. 🔥`,
      embeds: [embed], files,
      allowedMentions: { users: [member.id] },
    });
    console.log(`[WELCOME] تم الترحيب بـ ${member.user.tag}`);
  } catch (error) {
    console.error('[WELCOME] خطأ أثناء الترحيب:', error);
  }
});

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
    description = '🔥 السلام عليكم • إزيك • صباح الخير • مساء الخير • مين المطور\nاكتب أي تحية من دول وأنا هرد عليك هنا.';
  } else {
    return;
  }

  const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(description)
    .setFooter({ text: 'ELNAAR • BORN IN FIRE 🔥' }).setTimestamp();
  await message.reply({ embeds: [embed] }).catch((error) => console.error('[REPLY]', error));
});

client.login(token).catch((error) => {
  console.error('❌ فشل تسجيل الدخول. راجع DISCORD_TOKEN وبيانات البوت:', error.message);
});
