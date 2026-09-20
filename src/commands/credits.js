import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('credits')
  .setDescription('Show your credit balance');

export async function execute(interaction) {
  await interaction.reply({
    content: 'credits: coming online once the credit system is wired up.',
    ephemeral: true,
  });
}
