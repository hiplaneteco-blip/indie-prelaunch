import { SlashCommandBuilder } from 'discord.js';
import { getMissionById } from '../db/missions.js';
import { findParticipation } from '../db/participations.js';
import { insertBug } from '../db/bugs.js';

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
  const missionId = interaction.options.getInteger('mission_id', true);
  const description = interaction.options.getString('description', true);
  const severity = interaction.options.getString('severity', true);

  const mission = await getMissionById(missionId);
  if (!mission) {
    await interaction.reply({ content: `No mission #${missionId}.`, ephemeral: true });
    return;
  }

  const participation = await findParticipation(missionId, interaction.user.id);
  if (!participation) {
    await interaction.reply({
      content: `You haven't joined mission #${missionId} — run \`/join\` first.`,
      ephemeral: true,
    });
    return;
  }

  await insertBug({ participationId: participation.participation_id, description, severity });

  await interaction.reply({
    content: `Bug logged for **#${missionId} ${mission.game_name}** (${severity}). Thanks!`,
    ephemeral: true,
  });
}
