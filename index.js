
import 'dotenv/config';
import fs from 'node:fs';

const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const handleVoice = require('./voice/handler');

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
  const commands = require(`./commands/${file}`);
  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }
}

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
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

client.on('messageCreate', require('./events/messageCreate'));
client.on('voiceStateUpdate', (oldState, newState) => handleVoice(client, oldState, newState));

client.login(process.env.DISCORD_TOKEN);
