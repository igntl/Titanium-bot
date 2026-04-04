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

const STAFF_ROLE = "1475334752436359320";
const LOG_CHANNEL = "1489840541247213781";

const categories = {
  support: "1489844874948907108",
  questions: "1489844828404584469",
  complaints: "1489830376674295991",
  admin: "1489854271351427092",
  suggest: "1489854304851464292"
};

const categoryNames = {
  support: "📩 الدعم الفني",
  questions: "❓ الاستفسارات",
  complaints: "🚫 الشكاوي",
  admin: "📝 تقديم الإدارة",
  suggest: "💡 الاقتراحات"
};

let ticketCounter = 1;
let claimedTickets = {};
let logMessages = {};

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
        "📩 الدعم الفني\n🚫 الشكاوي\n❓ الاستفسارات\n📝 تقديم الإدارة\n💡 الاقتراحات\n\n👇 اختر نوع التذكرة"
      )
      .setImage("https://cdn.discordapp.com/attachments/1489280825068355728/1489848480078758029/6D0A7BEB-D183-459D-BB4E-5559F8AC5779.png");

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

    msg.channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  }
});


// 🎟️ التفاعل
client.on(Events.InteractionCreate, async (interaction) => {
  try {

    const log = client.channels.cache.get(LOG_CHANNEL);

    // 📩 إنشاء تذكرة
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
          { name: "📌 المستلم:", value: "لا يوجد" },
          { name: "━━━━━━━━━━━━━━", value: "✍️ الرجاء كتابة مشكلتك أو طلبك بالتفصيل\nوسيتم الرد عليك في أقرب وقت" }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("claim").setLabel("📌 استلام").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("toggle").setLabel("🔒 إغلاق").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("delete").setLabel("🗑️ حذف").setStyle(ButtonStyle.Secondary)
      );

      await channel.send({ embeds: [embed], components: [row] });

      // 📜 لوق (رسالة وحدة)
      if (log) {
        const msg = await log.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("📁 TITANIUM")
              .setDescription(
                `📩 تم فتح التذكرة\n\n` +
                `👤 بواسطة: ${interaction.user}\n` +
                `📁 ${categoryNames[type]}\n` +
                `🎫 تذكرة-${number}\n\n` +
                `📅 <t:${Math.floor(Date.now()/1000)}:F>`
              )
          ]
        });

        logMessages[channel.id] = msg.id;
      }

      await interaction.reply({ content: `تم إنشاء التذكرة: ${channel}`, ephemeral: true });
    }

    // 📌 استلام
    if (interaction.isButton() && interaction.customId === "claim") {

      const ch = interaction.channel;

      if (claimedTickets[ch.id]) {
        return interaction.reply({ content: "❌ التذكرة مستلمة", ephemeral: true });
      }

      claimedTickets[ch.id] = interaction.user;

      if (log) {
        log.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("📁 TITANIUM | استلام")
              .setDescription(
                `📌 تم استلام التذكرة\n\n` +
                `👤 بواسطة: ${interaction.user}\n` +
                `🎫 ${ch.name}\n` +
                `📅 <t:${Math.floor(Date.now()/1000)}:F>`
              )
          ]
        });
      }

      await interaction.reply({ content: `📌 تم استلام التذكرة بواسطة ${interaction.user}` });
    }

    // 🔒🔓 إغلاق / فتح
    if (interaction.isButton() && interaction.customId === "toggle") {

      const ch = interaction.channel;
      const msgId = logMessages[ch.id];

      if (!log || !msgId) return;

      const logMsg = await log.messages.fetch(msgId);
      const isClosed = ch.name.startsWith("🔒");

      if (!isClosed) {

        await ch.permissionOverwrites.edit(ch.topic, { SendMessages: false });
        const num = ch.name.replace("🎫・تذكرة-", "");
        await ch.setName(`🔒・تذكرة-${num}`);

        await logMsg.edit({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("📁 TITANIUM")
              .setDescription(
                `🔒 تم إغلاق التذكرة\n\n` +
                `👤 بواسطة: ${interaction.user}\n` +
                `🎫 ${ch.name}\n` +
                `📅 <t:${Math.floor(Date.now()/1000)}:F>`
              )
          ]
        });

        await interaction.update({ content: "🔒 تم الإغلاق", components: interaction.message.components });

      } else {

        await ch.permissionOverwrites.edit(ch.topic, { SendMessages: true });
        const num = ch.name.replace("🔒・تذكرة-", "");
        await ch.setName(`🎫・تذكرة-${num}`);

        await logMsg.edit({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setTitle("📁 TITANIUM")
              .setDescription(
                `🔓 تم فتح التذكرة\n\n` +
                `👤 بواسطة: ${interaction.user}\n` +
                `🎫 ${ch.name}\n` +
                `📅 <t:${Math.floor(Date.now()/1000)}:F>`
              )
          ]
        });

        await interaction.update({ content: "🔓 تم الفتح", components: interaction.message.components });
      }
    }

    // 🗑️ حذف
    if (interaction.isButton() && interaction.customId === "delete") {
      await interaction.reply({ content: "🗑️ جاري الحذف...", ephemeral: true });
      setTimeout(() => interaction.channel.delete(), 2000);
    }

  } catch (err) {
    console.error(err);
  }
});

client.login(TOKEN);
