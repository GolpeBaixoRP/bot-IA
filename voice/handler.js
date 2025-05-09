import { joinVoiceChannel, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import fs from 'fs';
import { transcribeAudio } from '../utils/whisper.js';
import { handleVoiceCommand } from '../utils/voiceCommands.js';

export async function handleVoice(client, oldState, newState) {
  if (!newState.channelId || newState.member.user.bot) return;

  const connection = joinVoiceChannel({
    channelId: newState.channelId,
    guildId: newState.guild.id,
    adapterCreator: newState.guild.voiceAdapterCreator,
  });

  const audioPlayer = createAudioPlayer();
  connection.subscribe(audioPlayer);

  const audioFilePath = '/tmp/audio.wav';
  setTimeout(async () => {
    try {
      const transcript = await transcribeAudio(audioFilePath);
      const response = await handleVoiceCommand(transcript, newState.member.user.id);
      if (response.audioPath) {
        const resource = createAudioResource(response.audioPath);
        audioPlayer.play(resource);
      }
    } catch (err) {
      console.error("Erro no handler de voz:", err);
    }
  }, 5000);
}
