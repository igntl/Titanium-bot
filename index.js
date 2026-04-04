const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = "حط_التوكن_هنا";

// 🎭 الرول
const STAFF_ROLE = "1475334752436359320";

// 📁 الكاتقوري
const categories = {
  support: "1489844874948907108",
  questions: "1489844828404584469",
  complaints: "1489830376674295991",
  admin: "1489854271351427092",
  suggest: "1489854304851464292"
};

// 📜 اللوق
const LOG_CHANNEL = "1489840541247213781";

let ticketCounter = 1;

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});


// 📌 بانل
client.on("messageCreate", async (msg) => {
  try {
    if (msg.content === "!panel") {

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("📩 نظام التذاكر")
        .setDescription(`
📩 الدعم الفني  
⛔ الشكاوي  
❓ الاستفسارات  
📝 تقديم الإدارة  
💼 الاقتراحات  

👇 اختر نوع التذكرة
`)
        .setImage("https://cdn.discordapp.com/attachments/1489280825068355728/1489848480078758029/6D0A7BEB-D183-459D-BB4E-5559F8AC5779.png");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("support").setLabel("الدعم الفني").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("complaints").setLabel("الشكاوي").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("questions").setLabel("الاستفسارات").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("admin").setLabel("تقديم الإدارة").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("suggest").setLabel("الاقتراحات").setStyle(ButtonStyle.Secondary)
      );

      msg.channel.send({ embeds: [embed], components: [row] });
    }
  } catch (err) {
    console.error("❌ Panel Error:", err);
  }
});


// 🎟️ التفاعلات
client.on(Events.InteractionCreate, async (interaction) => {
  try {

    if (!interaction.isButton()) return;

    // 🎟️ إنشاء
    if (categories[interaction.customId]) {

      const number = ticketCounter++;

      const channel = await interaction.guild.channels.create({
        name: `🎟️・${number}`,
        type: ChannelType.GuildText,
        parent: categories[interaction.customId],
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
          { name: "📁 قسم التذكرة:", value: `${interaction.customId}` },
          { name: "━━━━━━━━━━━━━━", value: "✍️ الرجاء كتابة مشكلتك أو طلبك بالتفصيل\nوسيتم الرد عليك في أقرب وقت" }
        );

      const closeBtn = new ButtonBuilder()
        .setCustomId("close")
        .setLabel("🔒 إغلاق التذكرة")
        .setStyle(ButtonStyle.Danger);

      await channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(closeBtn)]
      });

      await interaction.reply({ content: `تم إنشاء التذكرة: ${channel}`, ephemeral: true });

      const log = client.channels.cache.get(LOG_CHANNEL);
      if (log) {
        log.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setTitle("📂 فتح تذكرة")
              .setDescription(`👤 ${interaction.user}`)
          ]
        });
      }
    }

    // 🔒 إغلاق
    if (interaction.customId === "close") {

      const ch = interaction.channel;
      const userId = ch.topic;

      await ch.permissionOverwrites.edit(userId, { SendMessages: false });
      await ch.setName(`🔒・${ch.name.replace("🎟️・", "")}`);

      const open = new ButtonBuilder()
        .setCustomId("open")
        .setLabel("🔓 فتح")
        .setStyle(ButtonStyle.Success);

      const del = new ButtonBuilder()
        .setCustomId("delete")
        .setLabel("🗑️ حذف")
        .setStyle(ButtonStyle.Danger);

      await interaction.update({
        content: "🔒 تم إغلاق التذكرة",
        embeds: [],
        components: [new ActionRowBuilder().addComponents(open, del)]
      });

      const log = client.channels.cache.get(LOG_CHANNEL);
      if (log) {
        log.send({ content: `🔒 تم إغلاق تذكرة بواسطة ${interaction.user}` });
      }
    }

    // 🔓 فتح
    if (interaction.customId === "open") {

      const ch = interaction.channel;
      const userId = ch.topic;

      await ch.permissionOverwrites.edit(userId, { SendMessages: true });
      await ch.setName(`🎟️・${ch.name.replace("🔒・", "")}`);

      const close = new ButtonBuilder()
        .setCustomId("close")
        .setLabel("🔒 إغلاق التذكرة")
        .setStyle(ButtonStyle.Danger);

      await interaction.update({
        content: "🎫 تم فتح التذكرة",
        components: [new ActionRowBuilder().addComponents(close)]
      });
    }

    // 🗑️ حذف
    if (interaction.customId === "delete") {
      await interaction.reply({ content: "🗑️ جاري الحذف...", ephemeral: true });
      setTimeout(() => interaction.channel.delete(), 2000);
    }

  } catch (err) {
    console.error("❌ Interaction Error:", err);
  }
});


// 🔥 حماية من الكراش
process.on("uncaughtException", err => console.error("🔥 Crash:", err));
process.on("unhandledRejection", err => console.error("🔥 Promise:", err));

client.login(TOKEN);
