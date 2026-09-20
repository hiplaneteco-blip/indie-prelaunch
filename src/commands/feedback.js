import { SlashCommandBuilder } from 'discord.js';
import { getMissionById } from '../db/missions.js';
import { findParticipation, markCompleted } from '../db/participations.js';
import { insertFeedback } from '../db/feedback.js';
import { applyCredit } from '../db/credit-tx.js';

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
  const missionId = interaction.options.getInteger('mission_id', true);
  const combatRating = interaction.options.getInteger('combat_rating', true);
  const uiRating = interaction.options.getInteger('ui_rating', true);
  const difficultyRating = interaction.options.getInteger('difficulty_rating', true);
  const comments = interaction.options.getString('comments');

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
  if (participation.status === 'completed') {
    await interaction.reply({
      content: `You already submitted feedback for mission #${missionId}.`,
      ephemeral: true,
    });
    return;
  }

  await insertFeedback({
    participationId: participation.participation_id,
    combatRating,
    uiRating,
    difficultyRating,
    comments,
  });
  await markCompleted(participation.participation_id);

  // Self-test asymmetry: testing your own game costs credit_cost; testing
  // someone else's earns reward_credits. Credit is granted here, on feedback,
  // never on /join, so the incentive is tied to finishing the test.
  const isSelfTest = interaction.user.id === mission.owner_id;
  const amount = isSelfTest ? -mission.credit_cost : mission.reward_credits;
  const reason = isSelfTest
    ? `self-test cost: mission #${missionId}`
    : `feedback reward: mission #${missionId}`;
  const user = await applyCredit(interaction.user.id, amount, reason);

  await interaction.reply(
    `Feedback recorded for **#${missionId} ${mission.game_name}**. ` +
      `${amount >= 0 ? `+${amount}` : amount} credits (balance: ${user.credits}).`
  );
}
