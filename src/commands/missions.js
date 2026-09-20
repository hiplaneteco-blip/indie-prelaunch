import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('missions')
  .setDescription('List open playtest missions');

export async function execute(interaction) {
  await interaction.reply({
    content: 'missions: coming online in the next build step (missions table).',
    ephemeral: true,
  });
}
