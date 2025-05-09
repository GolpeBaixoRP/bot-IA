import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import handleVoice from './voice/handler.js';

// Criação do cliente do bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Leitura dos arquivos de comando
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const commands = await import(`./commands/${file}`);
  for (const command of commands.default) {
    client.commands.set(command.data.name, command);
  }
}

// Evento 'ready' quando o bot estiver online
client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
});

// Evento de interação
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
  }
});

// Eventos de mensagem e atualização de estado de voz
client.on('messageCreate', async () => {
  const messageCreate = await import('./events/messageCreate.js');
  messageCreate.default();
});

client.on('voiceStateUpdate', (oldState, newState) => handleVoice(client, oldState, newState));

// Login do bot
client.login(process.env.DISCORD_TOKEN);
