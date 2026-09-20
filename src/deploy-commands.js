import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from './commands/index.js';
import { logger } from './utils/logger.js';

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  logger.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment.');
  process.exit(1);
}

const body = commands.map((cmd) => cmd.data.toJSON());
const rest = new REST().setToken(DISCORD_TOKEN);

const route = DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID)
  : Routes.applicationCommands(DISCORD_CLIENT_ID);

try {
  logger.info(
    `Registering ${body.length} slash commands ${
      DISCORD_GUILD_ID ? `to guild ${DISCORD_GUILD_ID} (instant)` : 'globally (up to 1h to propagate)'
    }...`
  );
  const result = await rest.put(route, { body });
  logger.info(`Registered ${result.length} commands: ${result.map((c) => c.name).join(', ')}`);
} catch (err) {
  logger.error('Failed to register commands:', err);
  process.exit(1);
}
