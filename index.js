const { Client, GatewayIntentBits } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
  AudioPlayerStatus
} = require('@discordjs/voice');

const googleTTS = require('google-tts-api');
const https = require('https');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TARGET_CHANNEL_ID = "1475334190034587661";

let isPlaying = false;

client.on('ready', () => {
  console.log(`Bot ready: ${client.user.tag}`);
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

      // 👇 النص اللي تبيه
      const url = googleTTS.getAudioUrl(
        "اهلا بك في سيرفر تتانيوم يرجى انتظار الدعم الفني",
        { lang: 'ar', slow: false }
      );

      const stream = https.get(url);

      const resource = createAudioResource(stream);

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        isPlaying = false;
      });

    } catch (error) {
      console.log(error);
      isPlaying = false;
    }
  }
});

client.login(process.env.TOKEN);
