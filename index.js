const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType, 
  PermissionsBitField, 
  EmbedBuilder 
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ✏️ عدل هنا
const SUPPORT_ROLE_ID = "1475334752436359320";
const CATEGORY_ID = "1489830376674295991";

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// 🎫 التعامل مع الأزرار
client.on('interactionCreate', async (interaction) => {

  if (!interaction.isButton()) return;

  // فتح التذكرة
  if (interaction.customId === 'create_ticket') {

    const existing = interaction.guild.channels.cache.find(
      c => c.name === `ticket-${interaction.user.id}`
    );

    if (existing) {
      return interaction.reply({ content: "❗ عندك تذكرة مفتوحة", ephemeral: true });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: SUPPORT_ROLE_ID,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
      ],
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('🔒 إغلاق التذكرة')
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `🎫 أهلاً ${interaction.user}\nاكتب مشكلتك هنا`,
      components: [row]
    });

    await interaction.reply({ content: `✅ تم فتح التذكرة: ${channel}`, ephemeral: true });
  }

  // إغلاق التذكرة
  if (interaction.customId === 'close_ticket') {

    await interaction.reply({ content: "⏳ سيتم إغلاق التذكرة...", ephemeral: true });

    setTimeout(() => {
      interaction.channel.delete();
    }, 3000);
  }
});

// 🔥 إرسال اللوحة (مرة وحدة فقط)
client.on('messageCreate', async (message) => {

  if (message.content === '!panel') {

    const embed = new EmbedBuilder()
      .setTitle("📩 الدعم الفني")
      .setDescription("اضغط الزر بالأسفل لفتح تذكرة")
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('🎫 فتح تذكرة')
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

client.login(process.env.TOKEN);
