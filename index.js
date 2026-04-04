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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

// الايديات
const SUPPORT_CATEGORY = "1489844874948907108";
const COMPLAINT_CATEGORY = "1489830376674295991";
const QUESTION_CATEGORY = "1489844828404584469";
const ADMIN_CATEGORY = "1489854271351427092";
const SUGGEST_CATEGORY = "1489854304851464292";

const ADMIN_ROLE = "1475334752436359320";
const LOG_CHANNEL_ID = "1489840541247213781";

// عداد
let ticketData = {};
if (fs.existsSync("tickets.json")) {
  ticketData = JSON.parse(fs.readFileSync("tickets.json"));
}

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} شغال`);
});

// 📩 البانل
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setTitle("📩 نظام التذاكر")
      .setDescription(`
📩 الدعم الفني
⛔ الشكاوي
❓ الاستفسارات
📝 تقديم الإدارة
💼 الاقتراحات
      `)
      .setImage("https://cdn.discordapp.com/attachments/1489280825068355728/1489848480078758029/6D0A7BEB-D183-459D-BB4E-5559F8AC5779.png");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_select")
      .setPlaceholder("اختر نوع التذكرة")
      .addOptions([
        { label: "الدعم الفني", value: "support", emoji: "📩" },
        { label: "الشكاوي", value: "complaint", emoji: "⛔" },
        { label: "الاستفسارات", value: "question", emoji: "❓" },
        { label: "تقديم الإدارة", value: "admin", emoji: "📝" },
        { label: "الاقتراحات", value: "suggestion", emoji: "💼" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 🎫 فتح
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  const type = interaction.values[0];

  let category;
  let key;

  if (type === "support") category = SUPPORT_CATEGORY, key = "support";
  if (type === "complaint") category = COMPLAINT_CATEGORY, key = "complaint";
  if (type === "question") category = QUESTION_CATEGORY, key = "question";
  if (type === "admin") category = ADMIN_CATEGORY, key = "admin";
  if (type === "suggestion") category = SUGGEST_CATEGORY, key = "suggestion";

  if (!ticketData[key]) ticketData[key] = 1;

  const number = ticketData[key];
  ticketData[key]++;

  fs.writeFileSync("tickets.json", JSON.stringify(ticketData));

  const channel = await interaction.guild.channels.create({
    name: `🎫・${number}`,
    type: ChannelType.GuildText,
    parent: category,
    topic: interaction.user.id,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      { id: ADMIN_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
    ],
  });

  const closeBtn = new ButtonBuilder()
    .setCustomId("close")
    .setLabel("🔒 إغلاق")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(closeBtn);

  await channel.send({ content: `👋 ${interaction.user}`, components: [row] });

  await interaction.reply({ content: "✅ تم فتح التذكرة", ephemeral: true });
});

// 🔒 إغلاق + أزرار
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const channel = interaction.channel;

  // 🔒 اغلاق
  if (interaction.customId === "close") {

    await channel.permissionOverwrites.edit(channel.topic, {
      ViewChannel: false,
      SendMessages: false
    });

    await channel.setName(`🔒・${channel.name.replace("🎫・", "").replace("🔒・", "")}`);

    const openBtn = new ButtonBuilder()
      .setCustomId("open")
      .setLabel("🔓 فتح")
      .setStyle(ButtonStyle.Success);

    const deleteBtn = new ButtonBuilder()
      .setCustomId("delete")
      .setLabel("🗑️ حذف")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(openBtn, deleteBtn);

    await channel.send({
      content: "🔒 تم إغلاق التذكرة",
      components: [row]
    });

    await interaction.reply({ content: "✅ تم الإغلاق", ephemeral: true });
  }

  // 🔓 فتح
  if (interaction.customId === "open") {

    await channel.permissionOverwrites.edit(channel.topic, {
      ViewChannel: true,
      SendMessages: true
    });

    await channel.setName(`🎫・${channel.name.replace("🔒・", "")}`);

    await interaction.reply("🔓 تم فتح التذكرة");
  }

  // 🗑️ حذف
  if (interaction.customId === "delete") {
    await interaction.reply("🗑️ جاري الحذف...");
    setTimeout(() => channel.delete(), 2000);
  }
});

client.login(TOKEN);
