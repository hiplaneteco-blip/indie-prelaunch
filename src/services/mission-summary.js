import { listFeedbackForMission } from '../db/feedback.js';
import { listBugsForMission } from '../db/bugs.js';
import { generateMissionSummary } from './claude.js';
import { logger } from '../utils/logger.js';

// Fires when a mission's slots_filled just reached slots_total (checked by
// the caller before invoking this). Note this triggers off *joins*, per the
// spec's /join behavior — not off every tester having submitted /feedback —
// so a summary can post with less feedback/bug data than the mission will
// eventually have. That tradeoff is called out as unresolved in the spec's
// deferred section (prompt design pending real feedback); revisit the trigger
// point together with the prompt once the first real batch comes in.
export async function postMissionSummaryIfFull(mission, channel) {
  if (mission.status !== 'full') return;

  const [feedbackRows, bugRows] = await Promise.all([
    listFeedbackForMission(mission.mission_id),
    listBugsForMission(mission.mission_id),
  ]);

  try {
    const summary = await generateMissionSummary({
      gameName: mission.game_name,
      feedbackRows,
      bugRows,
    });
    await channel.send(
      `**Mission #${mission.mission_id} (${mission.game_name}) is full — AI summary:**\n${summary}`
    );
  } catch (err) {
    logger.error(`Failed to generate/post summary for mission #${mission.mission_id}:`, err);
    await channel.send(
      `Mission #${mission.mission_id} (${mission.game_name}) just filled its last slot, but ` +
        `the AI summary failed to generate. Feedback/bug data is still saved — check the logs.`
    );
  }
}
