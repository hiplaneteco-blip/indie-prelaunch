import { SlashCommandBuilder } from 'discord.js';
import { getOrCreateUser } from '../db/users.js';

export const data = new SlashCommandBuilder()
  .setName('credits')
  .setDescription('Show your credit balance');

export async function execute(interaction) {
  const user = await getOrCreateUser(interaction.user.id, interaction.user.username);
  await interaction.reply({ content: `You have **${user.credits}** credits.`, ephemeral: true });
}
