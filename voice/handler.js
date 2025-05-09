import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import fs from 'fs';
import { transcribeAudio } from '../utils/whisper.js';
import { handleVoiceCommand } from '../utils/voiceCommands.js';

export default async (client, oldState, newState) => {
  if (!newState.channelId || newState.member.user.bot) return;

  const connection = joinVoiceChannel({
    channelId: newState.channelId,
    guildId: newState.guild.id,
    adapterCreator: newState.guild.voiceAdapterCreator,
  });

  const audioPlayer = createAudioPlayer();
  connection.subscribe(audioPlayer);

  const audioFilePath = '/tmp/audio.wav';
  // Simulação de gravação e resposta (na prática usaria biblioteca externa)
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
};
