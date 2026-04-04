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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// 👇 عدل هنا
const SUPPORT_ROLE_ID = "1475334752436359320"; // ايدي رتبة الدعم
const CATEGORY_ID = "1489830376674295991"; // ايدي الكاتيجوري

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 🎫 فتح التذكرة
client.on('interactionCreate', async (interaction) => {

  if (!interaction.isButton()) return;

  // فتح التذكرة
  if (interaction.customId === 'create_ticket') {

    const existing = interaction.guild.channels.cache.find(
      c => c.name === `ticket-${interaction.user.id}`
    );

    if (existing) {
      return interaction.reply({ content: "❗ عندك تذكرة مفتوحة بالفعل", ephemeral: true });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
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

    const embed = new EmbedBuilder()
      .setTitle("🎫 تذكرة دعم")
      .setDescription("يرجى شرح مشكلتك وسيتم الرد عليك من الدعم الفني.")
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('🔒 إغلاق التذكرة')
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${interaction.user.id}> <@&${SUPPORT_ROLE_ID}>`,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({ content: `✅ تم إنشاء التذكرة: ${channel}`, ephemeral: true });
  }

  // 🔒 إغلاق التذكرة
  if (interaction.customId === 'close_ticket') {

    await interaction.reply({ content: "⏳ جاري إغلاق التذكرة...", ephemeral: true });

    setTimeout(() => {
      interaction.channel.delete();
    }, 3000);
  }
});

// 📩 أمر إرسال لوحة التذاكر
client.on('messageCreate', async (message) => {

  if (message.content === '!ticket') {

    const embed = new EmbedBuilder()
      .setTitle("📩 الدعم الفني")
      .setDescription("اضغط الزر بالأسفل لفتح تذكرة دعم.")
      .setColor("Green");

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
