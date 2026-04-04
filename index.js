const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  Events,
  StringSelectMenuBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

// 🎭 رول الستاف
const STAFF_ROLE = "1475334752436359320";

// 📁 الكاتقوري
const categories = {
  support: "1489844874948907108",
  questions: "1489844828404584469",
  complaints: "1489830376674295991",
  admin: "1489854271351427092",
  suggest: "1489854304851464292"
};

// 📝 أسماء عربية
const categoryNames = {
  support: "📩 الدعم الفني",
  questions: "❓ الاستفسارات",
  complaints: "🚫 الشكاوي",
  admin: "📝 تقديم الإدارة",
  suggest: "💡 الاقتراحات"
};

let ticketCounter = 1;

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});


// 📌 بانل
client.on("messageCreate", async (msg) => {
  if (msg.content === "!panel") {

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("📩 نظام التذاكر")
      .setDescription(
        "📩 نظام التذاكر\n\n" +
        "📩 الدعم الفني\n" +
        "🚫 الشكاوي\n" +
        "❓ الاستفسارات\n" +
        "📝 تقديم الإدارة\n" +
        "💡 الاقتراحات\n\n" +
        "👇 اختر نوع التذكرة"
      );

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_select")
      .setPlaceholder("📩 اختر فئة التذكرة")
      .addOptions([
        { label: "الدعم الفني", value: "support", emoji: "📩" },
        { label: "الشكاوي", value: "complaints", emoji: "🚫" },
        { label: "الاستفسارات", value: "questions", emoji: "❓" },
        { label: "تقديم الإدارة", value: "admin", emoji: "📝" },
        { label: "الاقتراحات", value: "suggest", emoji: "💡" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    msg.channel.send({ embeds: [embed], components: [row] });
  }
});


// 🎟️ التفاعل
client.on(Events.InteractionCreate, async (interaction) => {
  try {

    // 📩 اختيار من القائمة
    if (interaction.isStringSelectMenu()) {

      const type = interaction.values[0];

      const number = ticketCounter++;

      const channel = await interaction.guild.channels.create({
        name: `🎫・تذكرة-${number}`,
        type: ChannelType.GuildText,
        parent: categories[type],
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: STAFF_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
      });

      channel.setTopic(interaction.user.id);

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("📂 معلومات التذكرة")
        .addFields(
          { name: "👤 مالك التذكرة:", value: `${interaction.user}` },
          { name: "🛡️ مشرفي التذاكر:", value: `<@&${STAFF_ROLE}>` },
          { name: "📅 تاريخ التذكرة:", value: `<t:${Math.floor(Date.now()/1000)}:F>` },
          { name: "🔢 رقم التذكرة:", value: `${number}` },
          { name: "📁 قسم التذكرة:", value: `${categoryNames[type]}` },
          { name: "━━━━━━━━━━━━━━", value: "✍️ الرجاء كتابة مشكلتك أو طلبك بالتفصيل\nوسيتم الرد عليك في أقرب وقت" }
        );

      const closeBtn = new ButtonBuilder()
        .setCustomId("toggle")
        .setLabel("🔒 إغلاق التذكرة")
        .setStyle(ButtonStyle.Danger);

      await channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(closeBtn)]
      });

      await interaction.reply({
        content: `تم إنشاء التذكرة: ${channel}`,
        ephemeral: true
      });
    }

    // 🔒🔓 زر واحد (Toggle)
    if (interaction.isButton() && interaction.customId === "toggle") {

      const ch = interaction.channel;
      const userId = ch.topic;

      const isClosed = ch.name.startsWith("🔒");

      if (!isClosed) {

        await ch.permissionOverwrites.edit(userId, {
          SendMessages: false
        });

        const num = ch.name.replace("🎫・تذكرة-", "");
        await ch.setName(`🔒・تذكرة-${num}`);

        const btn = new ButtonBuilder()
          .setCustomId("toggle")
          .setLabel("🔓 فتح التذكرة")
          .setStyle(ButtonStyle.Success);

        await interaction.update({
          content: "🔒 تم إغلاق التذكرة",
          components: [new ActionRowBuilder().addComponents(btn)]
        });

      } else {

        await ch.permissionOverwrites.edit(userId, {
          SendMessages: true
        });

        const num = ch.name.replace("🔒・تذكرة-", "");
        await ch.setName(`🎫・تذكرة-${num}`);

        const btn = new ButtonBuilder()
          .setCustomId("toggle")
          .setLabel("🔒 إغلاق التذكرة")
          .setStyle(ButtonStyle.Danger);

        await interaction.update({
          content: "🎫 تم فتح التذكرة",
          components: [new ActionRowBuilder().addComponents(btn)]
        });
      }
    }

  } catch (err) {
    console.error("❌ Error:", err);
  }
});

process.on("uncaughtException", err => console.error(err));
process.on("unhandledRejection", err => console.error(err));

client.login(TOKEN);
