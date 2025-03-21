import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import Profile from '../models/Profile.js';

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Manage your profile.'),

    async execute(interaction) {
        const profile = await Profile.findOne({ userID: interaction.user.id });

        if (!profile) {
            await Profile.create({ userID: interaction.user.id });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('profile_selection')
            .setPlaceholder('Choose an action')
            .addOptions([
                { label: 'View Profile', value: 'view' },
                { label: 'Edit Profile', value: 'edit' },
                { label: 'Toggle Visibility', value: 'visibility' }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);
        await interaction.reply({ content: 'Select an option:', components: [row] });
    }
};
