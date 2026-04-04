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

// حط ID الروم الصوتي هنا فقط
const TARGET_CHANNEL_ID = "1475334190034587661";

let isPlaying = false;

client.on('ready', () => {
  console.log(`Bot is ready: ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {

  if (!oldState.channel && newState.channelId === TARGET_CHANNEL_ID) {

    if (isPlaying) return;
    isPlaying = true;

    try {
      const connection = joinVoiceChannel({
        channelId: newState.channel.id,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 5000);

      const player = createAudioPlayer();

      const resource = createAudioResource('./welcome.mp3', {
        inlineVolume: true
      });

      resource.volume.setVolume(1);

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        isPlaying = false;
      });

      player.on('error', error => {
        console.log('Audio error:', error);
        connection.destroy();
        isPlaying = false;
      });

    } catch (error) {
      console.log('Error:', error);
      isPlaying = false;
    }
  }
});

client.login(process.env.TOKEN);
