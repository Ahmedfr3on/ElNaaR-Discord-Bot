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

// ═══════════════════════════════════════
// ELNAAR OWNER SETTINGS
// ═══════════════════════════════════════

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

// ═══════════════════════════════════════
// OWNER SECURITY
// ═══════════════════════════════════════

function isOwner(userId) {
  return userId === OWNER_ID;
}

// ═══════════════════════════════════════
// WELCOME IMAGE — UPDATED MEMBER DETAILS
// ═══════════════════════════════════════

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

  // ═══════════════════════════════
  // MEMBER AVATAR (مكان الصورة)
  // ═══════════════════════════════

  // ضبطت الأرقام دي عشان تنزل في نص الدائرة بالظبط
  const avatarCX = 1110; 
  const avatarCY = 440;  
  const avatarR = 82;    

  const avatarUrl = member.displayAvatarURL({
    extension: 'png',
    size: 256
  });

  const avatar = await loadImage(avatarUrl);

  ctx.save();

  ctx.beginPath();
  ctx.arc(
    avatarCX,
    avatarCY,
    avatarR,
    0,
    Math.PI * 2
  );

  ctx.clip();

  const diameter = avatarR * 2;

  const scale = Math.max(
    diameter / avatar.width,
    diameter / avatar.height
  );

  const drawW = avatar.width * scale;
  const drawH = avatar.height * scale;

  ctx.drawImage(
    avatar,
    avatarCX - drawW / 2,
    avatarCY - drawH / 2,
    drawW,
    drawH
  );

  ctx.restore();

  // ═══════════════════════════════
  // MEMBER NAME (الاسم)
  // ═══════════════════════════════

  const username =
    member.user.globalName || member.user.username;

  ctx.save();

  ctx.textAlign = 'center'; 
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 22px sans-serif'; 
  ctx.fillStyle = '#FFFFFF'; // أبيض ناصع عشان يبان

  // مكان الاسم جوه المستطيل الطويل اللي تحت التاج
  ctx.fillText(username, 1345, 390);

  ctx.restore();

  // ═══════════════════════════════
  // MEMBER NUMBER (رقم العضو)
  // ═══════════════════════════════

  const memberNumber = String(
    member.guild.memberCount
  );

  ctx.save();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#FFFFFF'; 

  // مكان الرقم بعد كلمة MEMBER #
  ctx.fillText(memberNumber, 1380, 465);

  ctx.restore();

  // ═══════════════════════════════
  // JOINED DATE (تاريخ الانضمام)
  // ═══════════════════════════════

  const joinedDate = (
    member.joinedAt || new Date()
  ).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Cairo'
  });

  ctx.save();

  ctx.textAlign = 'left'; 
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#FFFFFF'; 

  // مكان التاريخ بعد كلمة JOINED:
  ctx.fillText(joinedDate, 1380, 505);

  ctx.restore();

  // ═══════════════════════════════
  // EXPORT IMAGE
  // ═══════════════════════════════

  return new AttachmentBuilder(
    await canvas.encode('png'),
    {
      name: 'elnaar-welcome.png'
    }
  );
}

// ═══════════════════════════════════════
// BOT READY
// ═══════════════════════════════════════

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🔥 ELNAAR ONLINE: ${readyClient.user.tag}`);

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

// ═══════════════════════════════════════
// AUTOMATIC WELCOME
// ═══════════════════════════════════════

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = await member.guild.channels
      .fetch(welcomeChannelId)
      .catch(() => null);

    if (!channel || !channel.isTextBased() || !channel.send) {
      console.error(
        '[WELCOME] راجع WELCOME_CHANNEL_ID وصلاحيات البوت.'
      );
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
      allowedMentions: {
        users: [member.id]
      },
    });

    console.log(
      `[WELCOME] تم الترحيب بـ ${member.user.tag}`
    );
  } catch (error) {
    console.error(
      '[WELCOME] خطأ أثناء الترحيب:',
      error
    );
  }
});

// ═══════════════════════════════════════
// AUTOMATIC REPLIES
// ═══════════════════════════════════════

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

  if (
    ['السلام عليكم', 'سلام عليكم', 'salam', 'salaam'].includes(msg)
  ) {
    title = '🔥 وعليكم السلام ورحمة الله وبركاته';
    description = `أهلًا ${message.author}، نوّرت ElNaaR! 🌋`;

  } else if (
    [
      'ازيك',
      'إزيك',
      'اخبارك',
      'أخبارك',
      'how are you',
      'how r u'
    ].includes(msg)
  ) {
    title = '⚡ النار مولّعة والحماس عالي!';
    description = `أنا تمام يا ${message.author} 🔥 إنت أخبارك إيه؟`;

  } else if (
    [
      'صباح الخير',
      'صباح الفل',
      'صباح النور',
      'good morning'
    ].includes(msg)
  ) {
    title = '🌅 صباح كله طاقة!';
    description = `صباح النور يا ${message.author}، يومك يبقى مليان انتصارات! 🔥`;
    color = 0xffb000;

  } else if (
    [
      'مساء الخير',
      'مساء الفل',
      'good evening',
      'good night'
    ].includes(msg)
  ) {
    title = '🌙 مساء الحماس يا بطل!';
    description = `نورت الشات يا ${message.author}، خلي ليلتك أسطورية! 🌋`;

  } else if (
    [
      'مين عملك',
      'مين صنعك',
      'مين المطور',
      'who made you',
      'developer'
    ].includes(msg)
  ) {
    title = '👑 مطوّر ElNaaR';
    description = 'تم تجهيز بوت ElNaaR لخدمة أعضاء الإمبراطورية. 🔥';

  } else if (
    [
      'الاوامر',
      'الأوامر',
      'اوامر',
      'مساعدة',
      'help',
      'commands'
    ].includes(msg)
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
    .setFooter({
      text: 'ELNAAR • BORN IN FIRE 🔥'
    })
    .setTimestamp();

  await message.reply({
    embeds: [embed]
  }).catch((error) => {
    console.error('[REPLY]', error);
  });
});

// ═══════════════════════════════════════
// OWNER COMMANDS — ADMIN ONLY
// ═══════════════════════════════════════

client.on(Events.MessageCreate, async (message) => {
  try {
    if (!message.guild || message.author.bot) return;

    const content = message.content.trim();

    const adminCommands = [
      '!panel',
      '!welcome',
      '!say',
      '!stats',
      '!helpadmin'
    ];

    const command = content.split(/\s+/)[0].toLowerCase();

    if (!adminCommands.includes(command)) return;

    if (!isOwner(message.author.id)) {
      await message.reply(
        '⛔ أوامر الإدارة متاحة لمدير ElNaaR فقط.'
      );
      return;
    }

    // !panel
    if (command === '!panel') {
      const panel = new EmbedBuilder()
        .setColor(0xff5a0a)
        .setTitle('👑 ELNAAR | OWNER CONTROL PANEL')
        .setDescription(
          '🔥 أهلًا بمدير الإمبراطورية!\n\n' +
          '**أوامر التحكم المتاحة:**\n' +
          '`!panel` — عرض لوحة التحكم\n' +
          '`!welcome @member` — إعادة إرسال ترحيب لعضو\n' +
          '`!say الرسالة` — إرسال رسالة باسم البوت\n' +
          '`!stats` — إحصائيات السيرفر والبوت\n' +
          '`!helpadmin` — المساعدة الإدارية\n\n' +
          '🔐 لوحة الإدارة مخصصة لصاحب الحساب المعتمد فقط.'
        )
        .setFooter({
          text: 'ELNAAR • BORN IN FIRE 🔥'
        })
        .setTimestamp();

      await message.reply({
        embeds: [panel]
      });

      return;
    }

    // !helpadmin
    if (command === '!helpadmin') {
      const help = new EmbedBuilder()
        .setColor(0xff6a00)
        .setTitle('📜 ELNAAR ADMIN COMMANDS')
        .setDescription(
          '`!panel`\nعرض لوحة تحكم المسؤول.\n\n' +
          '`!welcome @member`\nإعادة إرسال رسالة الترحيب للعضو مع الصورة.\n\n' +
          '`!say اكتب رسالتك هنا`\nإرسال رسالة من البوت.\n\n' +
          '`!stats`\nعرض إحصائيات السيرفر والبوت.'
        )
        .setFooter({
          text: 'OWNER ONLY • ELNAAR 🔥'
        })
        .setTimestamp();

      await message.reply({
        embeds: [help]
      });

      return;
    }

    // !say
    if (command === '!say') {
      const textToSend = content
        .slice(command.length)
        .trim();

      if (!textToSend) {
        await message.reply(
          '⚠️ اكتب الرسالة بعد الأمر.\nمثال: `!say أهلًا بكم في ElNaaR 🔥`'
        );
        return;
      }

      await message.channel.send({
        content: textToSend,
        allowedMentions: {
          parse: []
        }
      });

      await message.react('✅').catch(() => {});

      return;
    }

    // !stats
    if (command === '!stats') {
      const guild = message.guild;

      const stats = new EmbedBuilder()
        .setColor(0xff5a0a)
        .setTitle('📊 ELNAAR SERVER STATISTICS')
        .addFields(
          {
            name: '👑 اسم السيرفر',
            value: guild.name,
            inline: false
          },
          {
            name: '👥 عدد الأعضاء',
            value: `${guild.memberCount}`,
            inline: true
          },
          {
            name: '💬 عدد القنوات',
            value: `${guild.channels.cache.size}`,
            inline: true
          },
          {
            name: '🤖 اسم البوت',
            value: client.user.tag,
            inline: false
          },
          {
            name: '🌋 حالة البوت',
            value: '🟢 متصل',
            inline: true
          }
        )
        .setFooter({
          text: 'ELNAAR • BORN IN FIRE 🔥'
        })
        .setTimestamp();

      await message.reply({
        embeds: [stats]
      });

      return;
    }

    // !welcome @member
    if (command === '!welcome') {
      const target = message.mentions.members.first();

      if (!target) {
        await message.reply(
          '⚠️ منشن العضو المطلوب.\nمثال: `!welcome @member`'
        );
        return;
      }

      const channel = await target.guild.channels
        .fetch(welcomeChannelId)
        .catch(() => null);

      if (!channel || !channel.isTextBased() || !channel.send) {
        await message.reply(
          '❌ مش قادر أوصل لقناة الترحيب. راجع WELCOME_CHANNEL_ID وصلاحيات البوت.'
        );
        return;
      }

      let files = [];

      try {
        files = [await makeWelcomeImage(target)];
      } catch (imageError) {
        console.error(
          '[ADMIN WELCOME IMAGE]',
          imageError
        );
      }

      const embed = new EmbedBuilder()
        .setColor(0xff5a0a)
        .setTitle('🔥 شرارة جديدة انضمت إلى ElNaaR!')
        .setDescription(
          `أهلًا ${target} في **ElNaaR — BORN IN FIRE** 👑\n\n` +
          '🔥 مش مجرد سيرفر؛ دي عيلة بتكبر بكل أسطورة جديدة.\n' +
          '⚔️ احترم الجميع، شاركنا الحماس، وخلي وجودك علامة مميزة!'
        )
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          {
            name: '👑 العضو رقم',
            value: `**${target.guild.memberCount}**`,
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
        content: `🔥 أهلًا ${target}! الإمبراطورية نورت بوجودك. 🔥`,
        embeds: [embed],
        files,
        allowedMentions: {
          users: [target.id]
        }
      });

      await message.reply(
        '✅ تم إرسال الترحيب للعضو بنجاح.'
      );

      return;
    }

  } catch (error) {
    console.error(
      '[OWNER COMMAND ERROR]',
      error
    );

    await message.reply(
      '❌ حصل خطأ أثناء تنفيذ الأمر. راجع سجل التشغيل.'
    ).catch(() => {});
  }
});

// ═══════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════

client.login(token).catch((error) => {
  console.error(
    '❌ فشل تسجيل الدخول. راجع DISCORD_TOKEN وبيانات البوت:',
    error.message
  );
});
