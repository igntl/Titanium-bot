const { Client, GatewayIntentBits } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
  AudioPlayerStatus
} = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TARGET_CHANNEL_ID = "1475334190034587661";

‎// ⏱️ منع التكرار
let lastPlayTime = 0;
const COOLDOWN = 15;

client.on('ready', () => {
  console.log(`✅ شغال: ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {

  if (!oldState.channel && newState.channelId === TARGET_CHANNEL_ID) {

    const now = Date.now() / 1000;
    if (now - lastPlayTime < COOLDOWN) return;

    lastPlayTime = now;

    try {
      const connection = joinVoiceChannel({
        channelId: newState.channel.id,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 5000);

      const player = createAudioPlayer();
      const resource = createAudioResource('./welcome.mp3');

      player.play(resource);
      connection.subscribe(player);

‎      // 👇 يطلع بعد ما يخلص
      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

    } catch (error) {
      console.log("❌ خطأ:", error);
    }
  }
});

client.login(process.env.TOKEN);
