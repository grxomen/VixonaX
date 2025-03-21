import { SlashCommandBuilder } from 'discord.js';
import { requireAllowedRole } from '../utils/permissions.js';
import { logAdminAction } from '../utils/logger.js';

const allowedRoleIDs = ['718973562152550432', '718982422284468285', '606250699868602425']; // Replace with your real role IDs

export default {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin control panel')
        .addSubcommand(sub =>
            sub.setName('refresh')
                .setDescription('🔁 Refresh config/JSON files')
                .addStringOption(opt =>
                    opt.setName('reason')
                        .setDescription('Reason for refreshing')
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub.setName('restart')
                .setDescription('♻️ Restart the bot')
                .addStringOption(opt =>
                    opt.setName('reason')
                        .setDescription('Reason for restart')
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub.setName('sync')
                .setDescription('🔄 Sync all commands to Discord')
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!await requireAllowedRole(interaction, allowedRoleIDs)) return;

        const subcommand = interaction.options.getSubcommand();
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        try {
            if (subcommand === 'refresh') {
                delete require.cache[require.resolve('../data/something.json')];
                const newData = require('../data/something.json');

                await interaction.editReply({ content: '✅ Config refreshed!' });
                await logAdminAction(interaction, `Refreshed config files.\n📝 Reason: ${reason}`);
            }

            if (subcommand === 'restart') {
                await interaction.editReply({ content: '♻️ Restarting bot...' });
                await logAdminAction(interaction, `Restarted the bot.\n📝 Reason: ${reason}`);
                process.exit(0); // PM2 will bring it back up
            }

            if (subcommand === 'sync') {
                await interaction.client.application.commands.set([]);
                await interaction.editReply({ content: '✅ Slash commands synced globally!' });
                await logAdminAction(interaction, `Synced slash commands across all servers.`);
            }
        } catch (err) {
            console.error(`❌ Error in /admin ${subcommand}:`, err);
            await interaction.editReply({ content: `❌ Failed to execute /admin ${subcommand}` });
        }
    }
};
