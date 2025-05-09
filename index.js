import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { OpenAI } from 'openai'; // Importando o OpenAI
import { joinVoiceChannel } from '@discordjs/voice';
import { handleVoice } from './voice/handler.js';
import handleMessage from './events/messageCreate.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Chave da API OpenAI no arquivo .env
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const { default: commands } = await import(`./commands/${file}`);
  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }
}

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
});

// Adicionando a função de comando para interagir com o GPT-4o
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!chat')) {
    const userMessage = message.content.slice(6); // Remove o "!chat "

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Você é um assistente útil.' },
          { role: 'user', content: userMessage },
        ],
      });

      message.reply(completion.choices[0].message.content);
    } catch (error) {
      console.error('Erro ao chamar OpenAI:', error);
      message.reply('Desculpe, ocorreu um erro ao processar sua solicitação.');
    }
  }
});

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

client.on('messageCreate', handleMessage);
client.on('voiceStateUpdate', (oldState, newState) => handleVoice(client, oldState, newState));

client.login(process.env.DISCORD_TOKEN);
