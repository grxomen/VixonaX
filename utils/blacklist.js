import Blacklist from '../models/Blacklist.js';

export async function isBlacklisted(interaction) {
  const checks = [
    { type: 'user', id: interaction.user.id },
    { type: 'channel', id: interaction.channelId },
  ];

  if (interaction.member) {
    interaction.member.roles.cache.forEach(role => {
      checks.push({ type: 'role', id: role.id });
    });
  }

  const blocked = await Blacklist.findOne({ $or: checks });
  return blocked || null;
}

export async function addToBlacklist(type, id, reason = 'No reason provided') {
  return await Blacklist.findOneAndUpdate(
    { type, id },
    { reason, createdAt: new Date() },
    { upsert: true, new: true }
  );
}

export async function removeFromBlacklist(type, id) {
  return await Blacklist.findOneAndDelete({ type, id });
}

export async function listBlacklist() {
  return await Blacklist.find();
}

