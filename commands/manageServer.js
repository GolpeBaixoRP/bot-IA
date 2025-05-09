
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName('criar-canal')
      .setDescription('Cria um canal de texto')
      .addStringOption(option => option.setName('nome').setDescription('Nome do canal'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      const nome = interaction.options.getString('nome');
      try {
        await interaction.guild.channels.create({ name: nome, type: 0 });
        await interaction.reply(`Canal "${nome}" criado.`);
      } catch (err) {
        console.error(err);
        await interaction.reply('Erro ao criar canal.');
      }
    }
  }
];
