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

const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

// 📂 الكاتقوري
const SUPPORT_CATEGORY = "1489844874948907108";
const COMPLAINT_CATEGORY = "1489830376674295991";
const QUESTION_CATEGORY = "1489844828404584469";

// 👑 رول الإدارة العليا
const HIGH_ADMIN_ROLE = "1475334752436359320";

// 📊 لوق
const LOG_CHANNEL_ID = "1489840541247213781";

// 📁 عداد
let ticketData = {};
if (fs.existsSync("tickets.json")) {
  ticketData = JSON.parse(fs.readFileSync("tickets.json"));
}

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

// 📩 بانل
client.on("messageCreate", async (message) => {
  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setTitle("📩 نظام التذاكر")
      .setDescription("اختر نوع التذكرة من القائمة 👇")
      .setImage("https://cdn.discordapp.com/attachments/1489280825068355728/1489848480078758029/6D0A7BEB-D183-459D-BB4E-5559F8AC5779.png");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket")
      .setPlaceholder("اختر نوع التذكرة")
      .addOptions([
        { label: "الدعم الفني", value: "support", emoji: "📩" },
        { label: "الشكاوي", value: "complaint", emoji: "⛔" },
        { label: "الاستفسارات", value: "question", emoji: "❓" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 🎯 التفاعل
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  const type = interaction.values[0];

  let category;
  let key;

  if (type === "support") {
    category = SUPPORT_CATEGORY;
    key = "support";
  }

  if (type === "complaint") {
    category = COMPLAINT_CATEGORY;
    key = "complaint";
  }

  if (type === "question") {
    category = QUESTION_CATEGORY;
    key = "question";
  }

  // 🔢 ترقيم
  if (!ticketData[key]) ticketData[key] = 1;

  const number = ticketData[key];
  ticketData[key]++;

  fs.writeFileSync("tickets.json", JSON.stringify(ticketData));

  // 📂 إنشاء روم
  const channel = await interaction.guild.channels.create({
    name: `${number}`,
    type: ChannelType.GuildText,
    parent: category,
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
        id: HIGH_ADMIN_ROLE,
        allow: [PermissionsBitField.Flags.ViewChannel],
      }
    ],
  });

  // 🎫 رسالة داخل التذكرة
  const embed = new EmbedBuilder()
    .setTitle("🎫 تذكرة جديدة")
    .setDescription(`
👤 ${interaction.user}
🔢 رقم التذكرة: ${number}
📂 النوع: ${type}
    `);

  const closeBtn = new ButtonBuilder()
    .setCustomId("close")
    .setLabel("🔒 إغلاق")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(closeBtn);

  await channel.send({ embeds: [embed], components: [row] });

  // رد سريع بدون تعليق
  await interaction.reply({
    content: "✅ تم فتح التذكرة",
    ephemeral: true
  });

  // لوق
  const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (log) log.send(`📩 تذكرة: ${channel}`);
});

// ❌ إغلاق
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "close") {
    await interaction.reply({ content: "🔒 جاري الإغلاق..." });

    setTimeout(() => {
      interaction.channel.delete();
    }, 2000);
  }
});

client.login(TOKEN);
