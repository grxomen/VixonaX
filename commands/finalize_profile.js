import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Profile from '../models/Profile.js';

export default {
    data: new SlashCommandBuilder()
        .setName('finalizeprofile')
        .setDescription('Submit your profile to the showcase channel.'),
    
    async execute(interaction) {
        const showcaseChannelId = '1352467059778392155'; // 🔹 Replace with your #profile-showcase channel ID

        try {
            const profile = await Profile.findOne({ userID: interaction.user.id }).exec();
            if (!profile) {
                return interaction.reply({ content: "⚠️ You don't have a profile yet. Use `/profile` to create one.", ephemeral: true });
            }

            const channel = await interaction.client.channels.fetch(showcaseChannelId);
            if (!channel || !channel.isTextBased()) {
                return interaction.reply({ content: "⚠️ Profile showcase channel not found!", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`${interaction.user.username}'s Profile`)
                .setThumbnail(
                    profile.avatar ||
                    interaction.member.displayAvatarURL({ dynamic: true }) ||
                    interaction.user.displayAvatarURL({ dynamic: true })
                )
                .addFields(
                    { name: "Name", value: profile.name || "N/A" },
                    { name: "Age", value: profile.age ? profile.age.toString() : "N/A" },
                    { name: "Gender", value: profile.gender || "Not specified" },
                    { name: "Location", value: profile.location || "Unknown" },
                    { name: "Height", value: profile.height || "N/A" },
                    { name: "Zodiac Sign", value: profile.zodiacSign || "N/A" },
                    { name: "DM Status", value: profile.dmStatus || "Closed" },
                    { name: "Verification Level", value: profile.verificationLevel || "Unverified" },
                    { name: "Hobbies", value: profile.hobbies.length ? profile.hobbies.join(", ") : "None" },
                    { name: "Interests", value: profile.interests || "None" },
                    { name: "Bio", value: profile.bio || "No bio yet" }
                );

            await channel.send({ embeds: [embed] });

            await interaction.reply({ content: `✅ Your profile has been posted to <#${showcaseChannelId}>!`, ephemeral: true });
            console.log(`📢 Profile posted for ${interaction.user.tag}`);
        } catch (error) {
            console.error(`❌ Error posting profile showcase:`, error);
            await interaction.reply({ content: "⚠️ An error occurred while posting your profile.", ephemeral: true });
        }
    }
};

