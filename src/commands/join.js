import { SlashCommandBuilder } from 'discord.js';
import { getOrCreateUser } from '../db/users.js';
import { getMissionById, fillSlot } from '../db/missions.js';
import { joinMission, DUPLICATE_JOIN } from '../db/participations.js';

export const data = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Join an open playtest mission')
  .addIntegerOption((opt) =>
    opt.setName('mission_id').setDescription('Mission number, e.g. 7').setRequired(true).setMinValue(1)
  );

export async function execute(interaction) {
  const missionId = interaction.options.getInteger('mission_id', true);

  const mission = await getMissionById(missionId);
  if (!mission) {
    await interaction.reply({ content: `No mission #${missionId}.`, ephemeral: true });
    return;
  }
  if (mission.status !== 'open') {
    await interaction.reply({
      content: `Mission #${missionId} is ${mission.status}, not open for new testers.`,
      ephemeral: true,
    });
    return;
  }

  await getOrCreateUser(interaction.user.id, interaction.user.username);

  try {
    await joinMission(missionId, interaction.user.id);
  } catch (err) {
    if (err.code === DUPLICATE_JOIN) {
      await interaction.reply({
        content: `You've already joined mission #${missionId}.`,
        ephemeral: true,
      });
      return;
    }
    throw err;
  }

  const updated = await fillSlot(missionId);

  await interaction.reply(
    `<@${interaction.user.id}> joined **#${missionId} ${mission.game_name}** ` +
      `(${updated.slots_filled}/${updated.slots_total} slots filled). ` +
      `Submit \`/feedback\` when done to earn ${mission.reward_credits} credits.`
  );
}
