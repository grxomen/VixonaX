import { SlashCommandBuilder } from 'discord.js';
import { requireAllowedRole } from '../utils/permissions.js';

const allowedRoleIDs = ['718973562152550432', '718982422284468285', '606250699868602425']; // Replace with your real role IDs

export default {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('♻️ Restart the bot process (PM2 required, admin only)'),

    async execute(interaction) {
        if (!await requireAllowedRole(interaction, allowedRoleIDs)) return;

        await interaction.reply({
            content: '♻️ Restarting bot...',
            ephemeral: true
        });

        console.log(`♻️ Bot is restarting via /restart by ${interaction.user.tag}`);
        process.exit(0); // PM2 will automatically restart it
    }
};

