import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('Show your missions completed, credits earned, and feedback submitted');

export async function execute(interaction) {
  await interaction.reply({
    content: 'profile: coming online once the credit system is wired up.',
    ephemeral: true,
  });
}
