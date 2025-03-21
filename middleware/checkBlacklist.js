import { isBlacklisted } from '../utils/blacklist.js';

export async function checkBlacklist(interaction) {
  const blocked = await isBlacklisted(interaction);

  if (blocked) {
    await interaction.reply({
      content: `🚫 You are blacklisted from using bot commands.\n📝 Reason: ${blocked.reason}`,
      ephemeral: true
    });
    return true;
  }

  return false;
}

