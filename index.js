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

// 🔥 الايديات جاهزة منك
const SUPPORT_CATEGORY = "1489844874948907108";
const COMPLAINT_CATEGORY = "1489830376674295991";
const QUESTION_CATEGORY = "1489844828404584469";

const SUPPORT_ROLE_ID = "1475334752436359320";
const LOG_CHANNEL_ID = "1489840541247213781";

// 📁 تخزين الترقيم
let ticketData = {};
if (fs.existsSync("tickets.json")) {
  ticketData = JSON.parse(fs.readFileSync("tickets.json"));
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// 📩 البانل
client.on("messageCreate", async (message) => {
  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setTitle("📩 نظام التذاكر")
      .setDescription(`
🎧 الدعم الفني  
⚠️ الشكاوي  
❓ الاستفسارات  

اختر نوع التذكرة 👇
      `)
      .setImage("https://cdn.discordapp.com/attachments/1489280825068355728/1489845888342818907/9A6F3045-2E8F-4730-88F7-58002A9A1C0C.jpg?ex=69d1e69b&is=69d0951b&hm=2b24294140e53b65a68e8363563ba43913415372be9e716a62833bd30d3d0d12&");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_select")
      .setPlaceholder("اختر الفئة")
      .addOptions([
        { label: "الدعم الفني", value: "support", emoji: "🎧" },
        { label: "شكوى", value: "complaint", emoji: "⚠️" },
        { label: "استفسار", value: "question", emoji: "❓" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 🎯 التفاعل
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

  // فتح تذكرة
  if (interaction.isStringSelectMenu()) {

    await interaction.deferReply({ ephemeral: true });

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

    // 🔢 الترقيم لكل قسم لحاله
    if (!ticketData[key]) ticketData[key] = 1;

    const count = ticketData[key];
    ticketData[key]++;

    fs.writeFileSync("tickets.json", JSON.stringify(ticketData, null, 2));

    // 📂 إنشاء التذكرة باسم رقم فقط
    const channel = await interaction.guild.channels.create({
      name: `${count}`,
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
          id: SUPPORT_ROLE_ID,
          allow: [PermissionsBitField.Flags.ViewChannel],
        }
      ],
    });

    // زر إغلاق
    const closeBtn = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 إغلاق التذكرة")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeBtn);

    await channel.send({
      content: `أهلاً ${interaction.user} 👋\nاكتب مشكلتك هنا`,
      components: [row]
    });

    // لوق
    const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (log) {
      log.send(`📩 تم فتح تذكرة: ${channel}`);
    }

    await interaction.editReply({
      content: "✅ تم فتح التذكرة"
    });
  }

  // إغلاق
  if (interaction.isButton() && interaction.customId === "close_ticket") {

    await interaction.reply({
      content: "🔒 جاري الإغلاق...",
      ephemeral: true
    });

    const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (log) {
      log.send(`❌ تم إغلاق: ${interaction.channel.name}`);
    }

    setTimeout(() => {
      interaction.channel.delete();
    }, 2000);
  }
});

client.login(TOKEN);
