import { SlashCommandBuilder } from 'discord.js';
import { getOrCreateUser } from '../db/users.js';
import { getProfileStats } from '../db/stats.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('Show your missions completed, credits earned, and feedback submitted');

export async function execute(interaction) {
  const user = await getOrCreateUser(interaction.user.id, interaction.user.username);
  const stats = await getProfileStats(interaction.user.id);

  await interaction.reply({
    content: [
      `**${user.username}**'s profile`,
      `Missions completed: ${stats.missions_completed}`,
      `Feedback submitted: ${stats.feedback_submitted}`,
      `Credits earned (lifetime): ${stats.credits_earned}`,
      `Current balance: ${user.credits}`,
    ].join('\n'),
    ephemeral: true,
  });
}
