import { SlashCommandBuilder } from 'discord.js';

const RATING_CHOICES = [1, 2, 3, 4, 5].map((n) => ({ name: String(n), value: n }));

export const data = new SlashCommandBuilder()
  .setName('feedback')
  .setDescription('Submit feedback for a mission you completed')
  .addIntegerOption((opt) =>
    opt.setName('mission_id').setDescription('Mission number').setRequired(true).setMinValue(1)
  )
  .addIntegerOption((opt) =>
    opt
      .setName('combat_rating')
      .setDescription('Combat rating (1-5)')
      .setRequired(true)
      .addChoices(...RATING_CHOICES)
  )
  .addIntegerOption((opt) =>
    opt
      .setName('ui_rating')
      .setDescription('UI rating (1-5)')
      .setRequired(true)
      .addChoices(...RATING_CHOICES)
  )
  .addIntegerOption((opt) =>
    opt
      .setName('difficulty_rating')
      .setDescription('Difficulty rating (1-5)')
      .setRequired(true)
      .addChoices(...RATING_CHOICES)
  )
  .addStringOption((opt) =>
    opt.setName('comments').setDescription('Free-text comments').setRequired(false)
  );

export async function execute(interaction) {
  await interaction.reply({
    content: 'feedback: coming online once the credit system is wired up.',
    ephemeral: true,
  });
}
