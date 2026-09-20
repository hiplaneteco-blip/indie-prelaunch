import { SlashCommandBuilder } from 'discord.js';
import { listOpenMissions } from '../db/missions.js';

export const data = new SlashCommandBuilder()
  .setName('missions')
  .setDescription('List open playtest missions');

export async function execute(interaction) {
  const missions = await listOpenMissions();

  if (missions.length === 0) {
    await interaction.reply({ content: 'No open missions right now.', ephemeral: true });
    return;
  }

  const lines = missions.map(
    (m) =>
      `**#${m.mission_id} ${m.game_name}** — ${m.slots_filled}/${m.slots_total} slots, ` +
      `min ${m.min_minutes} min, ${m.reward_credits} credits — owner <@${m.owner_id}>`
  );

  await interaction.reply(`**Open missions**\n${lines.join('\n')}`);
}
