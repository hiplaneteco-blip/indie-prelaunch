import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('bug')
  .setDescription('Report a bug found during a mission')
  .addIntegerOption((opt) =>
    opt.setName('mission_id').setDescription('Mission number').setRequired(true).setMinValue(1)
  )
  .addStringOption((opt) =>
    opt.setName('description').setDescription('What went wrong').setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName('severity')
      .setDescription('How bad is it')
      .setRequired(true)
      .addChoices(
        { name: 'low', value: 'low' },
        { name: 'medium', value: 'medium' },
        { name: 'high', value: 'high' },
        { name: 'critical', value: 'critical' }
      )
  );

export async function execute(interaction) {
  await interaction.reply({
    content: 'bug: coming online once the credit system is wired up.',
    ephemeral: true,
  });
}
