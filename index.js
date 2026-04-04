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
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = "حط_التوكن_هنا";

// 📁 كاتقوري
const categories = {
  support: "1489844874948907108",
  questions: "1489844828404584469",
  complaints: "1489830376674295991",
  admin: "1489854271351427092",
  suggest: "1489854304851464292"
};

// 🎭 رول
const STAFF_ROLE = "1475334752436359320";

// 📜 لوق
const LOG_CHANNEL = "1489840541247213781";

let ticketCounter = 1;

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});


// 📌 امر البانل
client.on("messageCreate", async (msg) => {
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
});


// 🎟️ إنشاء التذكرة
client.on(Events.InteractionCreate, async (interaction) => {

  if (interaction.isButton()) {

    if (categories[interaction.customId]) {

      const ticketNumber = ticketCounter++;

      const channel = await interaction.guild.channels.create({
        name: `🎟️・${ticketNumber}`,
        type: ChannelType.GuildText,
        parent: categories[interaction.customId],
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          },
          {
            id: STAFF_ROLE,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          }
        ]
      });

      channel.setTopic(interaction.user.id);

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("📂 معلومات التذكرة")
        .addFields(
          { name: "👤 مالك التذكرة:", value: `${interaction.user}`, inline: false },
          { name: "🛡️ مشرفي التذاكر:", value: `<@&${STAFF_ROLE}>`, inline: false },
          { name: "📅 تاريخ التذكرة:", value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false },
          { name: "🔢 رقم التذكرة:", value: `${ticketNumber}`, inline: false },
          { name: "📁 قسم التذكرة:", value: `${interaction.customId}`, inline: false },
          { name: "━━━━━━━━━━━━━━", value: "✍️ الرجاء كتابة مشكلتك أو طلبك بالتفصيل\nوسيتم الرد عليك في أقرب وقت", inline: false }
        );

      const closeBtn = new ButtonBuilder()
        .setCustomId("close")
        .setLabel("🔒 إغلاق التذكرة")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(closeBtn);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({ content: `تم إنشاء التذكرة: ${channel}`, ephemeral: true });

      // 📜 لوق فتح
      const log = client.channels.cache.get(LOG_CHANNEL);
      log.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setTitle("📂 سجل التذكرة")
            .addFields(
              { name: "👤 تم فتح التذكرة بواسطة:", value: `${interaction.user}` },
              { name: "📅 وقت الفتح:", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
            )
        ]
      });
    }


    // 🔒 إغلاق
    if (interaction.customId === "close") {

      const channel = interaction.channel;
      const userId = channel.topic;

      await channel.permissionOverwrites.edit(userId, {
        SendMessages: false
      });

      await channel.setName(`🔒・${channel.name.replace("🎟️・", "")}`);

      const openBtn = new ButtonBuilder()
        .setCustomId("open")
        .setLabel("🔓 فتح")
        .setStyle(ButtonStyle.Success);

      const deleteBtn = new ButtonBuilder()
        .setCustomId("delete")
        .setLabel("🗑️ حذف")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(openBtn, deleteBtn);

      await interaction.update({
        content: "🔒 تم إغلاق التذكرة",
        embeds: [],
        components: [row]
      });

      // 📜 لوق إغلاق
      const log = client.channels.cache.get(LOG_CHANNEL);
      log.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("🔒 تم إغلاق التذكرة")
            .addFields(
              { name: "👤 بواسطة:", value: `${interaction.user}` },
              { name: "📅 الوقت:", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
            )
        ]
      });
    }


    // 🔓 فتح
    if (interaction.customId === "open") {

      const channel = interaction.channel;
      const userId = channel.topic;

      await channel.permissionOverwrites.edit(userId, {
        SendMessages: true
      });

      await channel.setName(`🎟️・${channel.name.replace("🔒・", "")}`);

      const closeBtn = new ButtonBuilder()
        .setCustomId("close")
        .setLabel("🔒 إغلاق التذكرة")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(closeBtn);

      await interaction.update({
        content: "🎫 تم فتح التذكرة",
        components: [row]
      });
    }


    // 🗑️ حذف
    if (interaction.customId === "delete") {
      await interaction.reply({ content: "🗑️ جاري الحذف...", ephemeral: true });
      setTimeout(() => interaction.channel.delete(), 2000);
    }
  }
});

client.login(TOKEN);
