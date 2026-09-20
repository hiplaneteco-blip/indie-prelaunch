import { SlashCommandBuilder } from 'discord.js';
import { getOrCreateUser } from '../db/users.js';
import { createMission } from '../db/missions.js';

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
  const gameName = interaction.options.getString('game_name', true);
  const minMinutes = interaction.options.getInteger('min_minutes', true);
  const slotsTotal = interaction.options.getInteger('slots_total', true);
  const rewardCredits = interaction.options.getInteger('reward_credits', true);
  const creditCost = interaction.options.getInteger('credit_cost') ?? 0;

  await getOrCreateUser(interaction.user.id, interaction.user.username);

  // Role gating starts loose (see README): tag the caller's roles on the
  // mission instead of blocking non-developers from calling this at all.
  const ownerRoles = interaction.member?.roles?.cache
    ? [...interaction.member.roles.cache.values()].map((r) => r.name)
    : [];

  const mission = await createMission({
    gameName,
    ownerId: interaction.user.id,
    minMinutes,
    slotsTotal,
    rewardCredits,
    creditCost,
    ownerRoles,
  });

  await interaction.reply(
    [
      `**Mission #${mission.mission_id} created: ${mission.game_name}**`,
      `Posted by <@${mission.owner_id}>`,
      `Needs ${mission.slots_total} tester(s), min ${mission.min_minutes} min each.`,
      `Reward: ${mission.reward_credits} credits on completed feedback.`,
      `Run \`/join mission_id:${mission.mission_id}\` to sign up.`,
    ].join('\n')
  );
}
