const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

// ✅ جاهزة من عندك
const CATEGORY_ID = "1489830376674295991";
const SUPPORT_ROLE_ID = "1475334752436359320";
const LOG_CHANNEL_ID = "1489840541247213781";

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// 📩 إرسال البانل
client.on("messageCreate", async (message) => {
  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setTitle("📩 نظام التذاكر")
      .setDescription(`
🎧 الدعم الفني: مشاكل السيرفر  
⚠️ الشكاوي: مشكلة مع عضو  
❓ الاستفسارات: سؤال عام  

اختر نوع التذكرة من القائمة 👇
      `)
      .setColor("#2b2d31")
      .setImage("https://cdn.discordapp.com/attachments/1489280825068355728/1489842642006179901/7FCB9C09-6BA0-4A5B-B6A0-961659BB6B5E.png?ex=69d1e395&is=69d09215&hm=28b044bd0a1e50ea925f323ae5d7c52fe9e02535c0962bc0778dbe6b0c8dc100&");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("select_ticket")
      .setPlaceholder("اختر فئة التذكرة")
      .addOptions([
        {
          label: "الدعم الفني",
          value: "support",
          emoji: "🎧"
        },
        {
          label: "شكوى",
          value: "complaint",
          emoji: "⚠️"
        },
        {
          label: "استفسار",
          value: "question",
          emoji: "❓"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

// 🎯 التفاعل
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

  // 📥 فتح تذكرة
  if (interaction.isStringSelectMenu() && interaction.customId === "select_ticket") {

    await interaction.deferReply({ ephemeral: true });

    const existing = interaction.guild.channels.cache.find(
      c => c.name === `ticket-${interaction.user.id}`
    );

    if (existing) {
      return interaction.editReply({
        content: "❌ عندك تذكرة مفتوحة بالفعل"
      });
    }

    const type = interaction.values[0];

    let name = "ticket";
    let label = "";

    if (type === "support") {
      name = "support";
      label = "🎧 دعم فني";
    }

    if (type === "complaint") {
      name = "complaint";
      label = "⚠️ شكوى";
    }

    if (type === "question") {
      name = "question";
      label = "❓ استفسار";
    }

    const channel = await interaction.guild.channels.create({
      name: `${name}-${interaction.user.id}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: SUPPORT_ROLE_ID,
          allow: [PermissionsBitField.Flags.ViewChannel],
        }
      ],
    });

    const closeBtn = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 إغلاق التذكرة")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeBtn);

    await channel.send({
      content: `أهلاً ${interaction.user}\nنوع التذكرة: ${label}`,
      components: [row]
    });

    // 📝 لوق
    const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (log) {
      log.send(`📩 تذكرة جديدة: ${channel} بواسطة ${interaction.user}`);
    }

    await interaction.editReply({
      content: "✅ تم فتح التذكرة"
    });
  }

  // 🔒 إغلاق
  if (interaction.isButton() && interaction.customId === "close_ticket") {

    const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (log) {
      log.send(`🔒 تم إغلاق التذكرة: ${interaction.channel.name}`);
    }

    await interaction.reply({ content: "جاري الإغلاق...", ephemeral: true });

    setTimeout(() => {
      interaction.channel.delete();
    }, 2000);
  }
});

client.login(TOKEN);
