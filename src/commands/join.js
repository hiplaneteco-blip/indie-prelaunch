import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Join an open playtest mission')
  .addIntegerOption((opt) =>
    opt.setName('mission_id').setDescription('Mission number, e.g. 7').setRequired(true).setMinValue(1)
  );

export async function execute(interaction) {
  await interaction.reply({
    content: 'join: coming online in the next build step (missions table).',
    ephemeral: true,
  });
}
