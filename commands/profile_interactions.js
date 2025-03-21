import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle } from 'discord.js';
import Profile from '../models/Profile.js';

export default async function profileInteraction(interaction) {
    console.log(`ℹ️ Interaction received from ${interaction.user.tag} (ID: ${interaction.user.id})`);

    if (interaction.isStringSelectMenu() && interaction.customId === 'profile_selection') {
        try {
            await interaction.deferReply({ ephemeral: true });
            console.log("✅ Interaction successfully deferred.");

            let profile = await Profile.findOne({ userID: interaction.user.id }).exec();
            if (!profile) {
                console.warn(`⚠️ No profile found for ${interaction.user.tag} (${interaction.user.id}), creating one...`);
                profile = new Profile({
                    userID: interaction.user.id,
                    name: interaction.user.username,
                    age: 0,
                    location: 'Unknown',
                    hobbies: [],
                    bio: 'No bio yet',
                    visibility: 'public'
                });
                await profile.save();
                console.log(`✅ Created profile for ${interaction.user.tag} (${interaction.user.id})`);
            }

            switch (interaction.values[0]) {
                case 'view': {
                    console.log(`ℹ️ ${interaction.user.tag} is viewing their profile.`);
                    const embed = new EmbedBuilder()
                        .setColor(0xe0dbf8)
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

                    await interaction.editReply({ embeds: [embed] });
                    console.log("✅ Profile embed sent.");
                    break;
                }

                case 'edit': {
                    console.log(`ℹ️ ${interaction.user.tag} is editing their profile.`);
                    const row1 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('edit_name').setLabel('Name').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_age').setLabel('Age').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_location').setLabel('Location').setStyle(ButtonStyle.Primary)
                    );

                    const row2 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('edit_height').setLabel('Height').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_zodiac').setLabel('Zodiac Sign').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_dmstatus').setLabel('DM Status').setStyle(ButtonStyle.Primary)
                    );

                    const row3 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('edit_hobbies').setLabel('Hobbies').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_interests').setLabel('Interests').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_bio').setLabel('Bio').setStyle(ButtonStyle.Primary)
                    );

                    const row4 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('upload_avatar').setLabel('Upload Avatar').setStyle(ButtonStyle.Success)
                    );
                    

                    await interaction.editReply({
                        content: 'What would you like to edit?',
                        components: [row1, row2, row3, row4]
                    });

                    console.log("✅ Edit options sent.");
                    break;
                }
            }
        } catch (error) {
            console.error(`❌ Error handling interaction:`, error);
            await interaction.editReply({ content: "⚠️ An error occurred while processing your request.", ephemeral: true });
        }
    }

    // 🔥 Handle button clicks for editing fields
    if (interaction.isButton()) {
        const field = interaction.customId.replace("edit_", ""); // Extracts the field name (e.g., "name", "age")

        if (interaction.customId === 'upload_avatar') {
            await interaction.reply({
                content: "📸 Please upload your avatar image (as an attachment). You have 45 seconds.",
                ephemeral: true
            });
        
            const filter = msg =>
                msg.author.id === interaction.user.id &&
                msg.attachments.size > 0 &&
                msg.attachments.first().contentType?.startsWith('image/');
        
            const channel = await interaction.channel;
            if (!channel) return;
        
            try {
                const collected = await channel.awaitMessages({
                    filter,
                    max: 1,
                    time: 45000,
                    errors: ['time']
                });
        
                const attachment = collected.first().attachments.first();
                const imageURL = attachment.url;
                const contentType = attachment.contentType;
        
                // ✅ Validate image format (optional stricter check)
                const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
                if (!allowedTypes.includes(contentType)) {
                    return await interaction.followUp({
                        content: `❌ Unsupported image type. Please upload PNG, JPG, WEBP, or GIF.`,
                        ephemeral: true
                    });
                }
        
                let profile = await Profile.findOne({ userID: interaction.user.id }).exec();
                if (!profile) {
                    profile = new Profile({ userID: interaction.user.id, name: interaction.user.username });
                }
        
                profile.avatar = imageURL;
                await profile.save();
        
                await interaction.followUp({
                    content: `✅ Your avatar has been updated!`,
                    ephemeral: true
                });
        
                console.log(`🖼️ Avatar updated for ${interaction.user.tag}: ${imageURL}`);
            } catch (err) {
                console.warn(`⚠️ Avatar upload failed or timed out for ${interaction.user.tag}`);
                await interaction.followUp({
                    content: `❌ You didn't upload a valid image in time.`,
                    ephemeral: true
                });
            }
        }
        
  
        // Create a modal for user input
        const modal = new ModalBuilder()
            .setCustomId(`modal_${field}`)
            .setTitle(`Edit ${field.charAt(0).toUpperCase() + field.slice(1)}`);

        const input = new TextInputBuilder()
            .setCustomId(`input_${field}`)
            .setLabel(`Enter new ${field.charAt(0).toUpperCase() + field.slice(1)}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(input);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
        console.log(`✅ Opened modal for editing ${field}`);
    }
}
