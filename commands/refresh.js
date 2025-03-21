import { SlashCommandBuilder } from 'discord.js';
import { requireAllowedRole } from '../utils/permissions.js';

const allowedRoleIDs = ['718973562152550432', '718982422284468285', '606250699868602425']; // Replace with your real role IDs

export default {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('🔁 Refresh configuration or JSON files (admin only)'),

    async execute(interaction) {
        if (!await requireAllowedRole(interaction, allowedRoleIDs)) return;

        try {
            delete require.cache[require.resolve('../data/something.json')];
            const newData = require('../data/something.json');

            await interaction.reply({
                content: '✅ Refreshed configuration files successfully!',
                ephemeral: true
            });

            console.log('🔁 JSON config refreshed via /refresh');
        } catch (err) {
            console.error('❌ Failed to refresh config:', err);
            await interaction.reply({
                content: '❌ Failed to refresh config.',
                ephemeral: true
            });
        }
    }
};

