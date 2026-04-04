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

// 📂 الكاتقوري (اللي عطيتني)
const SUPPORT_CATEGORY = "1489844874948907108";
const COMPLAINT_CATEGORY = "1489830376674295991";
const QUESTION_CATEGORY = "1489844828404584469";

// 🔥 حط ايديات الرولات هنا (مهم)
const HIGH_ADMIN_ROLE = "PUT_HIGH_ADMIN_ROLE"; // الإدارة العليا
const QUESTION_ROLE = "PUT_QUESTION_ROLE";
const ADMIN_ROLE = "PUT_ADMIN_ROLE";
const SUGGEST_ROLE = "PUT_SUGGEST_ROLE";

const LOG_CHANNEL_ID = "1489840541247213781";

// 📁 الترقيم
let ticketData = {};
if (fs.existsSync("tickets.json")) {
  ticketData = JSON.parse(fs.readFileSync("tickets.json"));
}

client.once("ready", () => {
  console.log(`✅ ${client.user.tag}`);
});

// 📩 البانل
client.on("messageCreate", async (message) => {
  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setTitle("📩 نظام التذاكر")
      .setDescription(`
📩 الدعم الفني  
⛔ الشكاوي  
❓ الاستفسارات  
📝 تقديم الإدارة  
💼 الاقتراحات  

اختر نوع التذكرة 👇
      `)
      .setImage("https://cdn.discordapp.com/attachments/1489280825068355728/1489848480078758029/6D0A7BEB-D183-459D-BB4E-5559F8AC5779.png");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_select")
      .setPlaceholder("اختر فئة التذكرة")
      .addOptions([
        { label: "الدعم الفني", value: "support", emoji: "📩" },
        { label: "الشكاوي", value: "complaint", emoji: "⛔" },
        { label: "الاستفسارات", value: "question", emoji: "❓" },
        { label: "تقديم الإدارة", value: "admin", emoji: "📝" },
        { label: "الاقتراحات", value: "suggestion", emoji: "💼" }
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
    let role;
    let key;

    if (type === "support") {
      category = SUPPORT_CATEGORY;
      role = HIGH_ADMIN_ROLE; // 👑 الإدارة العليا فقط
      key = "support";
    }

    if (type === "complaint") {
      category = COMPLAINT_CATEGORY;
      role = HIGH_ADMIN_ROLE;
      key = "complaint";
    }

    if (type === "question") {
      category = QUESTION_CATEGORY;
      role = QUESTION_ROLE;
      key = "question";
    }

    if (type === "admin") {
      category = SUPPORT_CATEGORY;
      role = ADMIN_ROLE;
      key = "admin";
    }

    if (type === "suggestion") {
      category = QUESTION_CATEGORY;
      role = SUGGEST_ROLE;
      key = "suggestion";
    }

    // 🔢 الترقيم
    if (!ticketData[key]) ticketData[key] = 1;
    const count = ticketData[key];
    ticketData[key]++;
    fs.writeFileSync("tickets.json", JSON.stringify(ticketData, null, 2));

    // 📂 إنشاء روم
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
          id: role,
          allow: [PermissionsBitField.Flags.ViewChannel],
        }
      ],
    });

    // 🎫 Embed داخل التذكرة
    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🎫 | معلومات التذكرة")
      .setDescription(`
👤 **مالك التذكرة:**
${interaction.user}

🛡️ **المسؤولين:**
<@&${role}>

📅 **التاريخ:**
<t:${Math.floor(Date.now() / 1000)}:F>

🔢 **رقم التذكرة:**
${count}

📂 **القسم:**
${type}
      `)
      .setThumbnail(interaction.user.displayAvatarURL());

    const btn1 = new ButtonBuilder()
      .setCustomId("controls")
      .setLabel("🎛️ خيارات")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(btn1);

    await channel.send({ embeds: [embed], components: [row] });

    const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (log) log.send(`📩 تذكرة جديدة: ${channel}`);

    await interaction.editReply({ content: "✅ تم فتح التذكرة" });
  }

  // خيارات
  if (interaction.isButton() && interaction.customId === "controls") {

    const close = new ButtonBuilder()
      .setCustomId("close")
      .setLabel("🔒 إغلاق")
      .setStyle(ButtonStyle.Danger);

    const claim = new ButtonBuilder()
      .setCustomId("claim")
      .setLabel("📌 استلام")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(close, claim);

    await interaction.reply({
      content: "اختر:",
      components: [row],
      ephemeral: true
    });
  }

  // استلام
  if (interaction.customId === "claim") {
    await interaction.reply({
      content: `📌 تم الاستلام بواسطة ${interaction.user}`
    });
  }

  // إغلاق
  if (interaction.customId === "close") {
    await interaction.reply({ content: "🔒 جاري الإغلاق..." });
    setTimeout(() => interaction.channel.delete(), 2000);
  }
});

client.login(TOKEN);
