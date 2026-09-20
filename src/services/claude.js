import Anthropic from '@anthropic-ai/sdk';

let client;
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY in environment.');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// Pulled out as a pure function so it can be unit-tested without hitting the
// network. Prompt isn't finalized (per spec) — first real feedback batch
// should inform how this reads; keep changes localized to this function.
export function buildSummaryPrompt({ gameName, feedbackRows, bugRows }) {
  const avg = (key) =>
    feedbackRows.length
      ? (feedbackRows.reduce((sum, r) => sum + r[key], 0) / feedbackRows.length).toFixed(1)
      : 'n/a';

  const comments =
    feedbackRows
      .filter((r) => r.comments)
      .map((r, i) => `${i + 1}. ${r.comments}`)
      .join('\n') || '(no free-text comments)';

  const bugs = bugRows.length
    ? bugRows.map((b, i) => `${i + 1}. [${b.severity}] ${b.description}`).join('\n')
    : '(no bugs reported)';

  return `You are summarizing playtest feedback for the indie game "${gameName}".

${feedbackRows.length} tester(s) submitted feedback. Average ratings (1-5 scale):
- Combat: ${avg('combat_rating')}
- UI: ${avg('ui_rating')}
- Difficulty: ${avg('difficulty_rating')}

Tester comments:
${comments}

Bugs reported (${bugRows.length}):
${bugs}

Write a concise summary for the developer, organized under three headings —
Combat, UI, Difficulty — each covering what testers said and any actionable
takeaway. Follow with a short Bugs section prioritized by severity. Keep the
whole thing under 300 words. Use Discord markdown (bold section titles, not
# headers) since this gets posted straight into a Discord channel.`;
}

export async function generateMissionSummary({ gameName, feedbackRows, bugRows }) {
  const prompt = buildSummaryPrompt({ gameName, feedbackRows, bugRows });
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}
