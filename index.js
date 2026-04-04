const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

const CATEGORY_ID = "1489830376674295991";
const SUPPORT_ROLE_ID = "1475334752436359320";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!ticket") {
    message.channel.send("اضغط 📩 لفتح تذكرة");
  }

  if (message.content === "!open") {
    const channel = await message.guild.channels.create({
      name: `ticket-${message.author.username}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: message.author.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: SUPPORT_ROLE_ID,
          allow: [PermissionsBitField.Flags.ViewChannel],
        }
      ],
    });

    channel.send(`أهلاً ${message.author}، اكتب مشكلتك هنا`);
  }

  if (message.content === "!close") {
    if (message.channel.name.startsWith("ticket-")) {
      message.channel.delete();
    }
  }
});

client.login(TOKEN);
