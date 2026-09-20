import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('create-test')
  .setDescription('Register a game for playtesting')
  .addStringOption((opt) =>
    opt.setName('game_name').setDescription('Name of the game').setRequired(true)
  )
  .addIntegerOption((opt) =>
    opt
      .setName('min_minutes')
      .setDescription('Minimum minutes a tester must play')
      .setRequired(true)
      .setMinValue(1)
  )
  .addIntegerOption((opt) =>
    opt
      .setName('slots_total')
      .setDescription('Number of testers needed')
      .setRequired(true)
      .setMinValue(1)
  )
  .addIntegerOption((opt) =>
    opt
      .setName('reward_credits')
      .setDescription('Credits paid to each tester who completes feedback')
      .setRequired(true)
      .setMinValue(0)
  )
  .addIntegerOption((opt) =>
    opt
      .setName('credit_cost')
      .setDescription('Credits charged if the owner tests their own mission (default 0)')
      .setRequired(false)
      .setMinValue(0)
  );

export async function execute(interaction) {
  await interaction.reply({
    content: 'create-test: coming online in the next build step (missions table).',
    ephemeral: true,
  });
}
