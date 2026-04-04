const { Client, GatewayIntentBits } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
  AudioPlayerStatus
} = require('@discordjs/voice');

const ffmpeg = require('ffmpeg-static');
const { spawn } = require('child_process');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

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

      // 🔥 تشغيل الصوت باستخدام ffmpeg (الحل النهائي)
      const stream = spawn(ffmpeg, [
        '-i', 'welcome.mp3',
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        'pipe:1'
      ], { stdio: ['ignore', 'pipe', 'ignore'] });

      const resource = createAudioResource(stream.stdout);

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
