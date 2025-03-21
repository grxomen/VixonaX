import { EmbedBuilder, ChannelType, PermissionsBitField } from 'discord.js';

const LOG_CHANNEL_NAME = '𝐕𝐢𝐱𝐨𝐧𝐚𝐗-mod-log';
const EMBED_COLOR = 0xff5e00; // a nice spicy orange

/**
 * Logs an admin action as an embed.
 * Auto-creates the mod-log channel if missing.
 * @param {Interaction} interaction
 * @param {string} actionDescription
 */
export async function logAdminAction(interaction, actionDescription) {
    const client = interaction.client;
    const guild = interaction.guild;

    if (!guild) {
        console.warn('⚠️ Attempted to log outside a guild.');
        return;
    }

    let logChannel = guild.channels.cache.find(
        ch => ch.name === LOG_CHANNEL_NAME && ch.isTextBased?.()
    );

    // Auto-create the mod-log channel if not found
    if (!logChannel) {
        try {
            logChannel = await guild.channels.create({
                name: LOG_CHANNEL_NAME,
                type: ChannelType.GuildText,
                reason: 'Auto-created mod-log channel for VixonaX bot',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: client.user.id,
                        allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel],
                    },
                ]
            });

            console.log(`✅ Created #${LOG_CHANNEL_NAME} in ${guild.name}`);
        } catch (err) {
            console.error(`❌ Failed to auto-create log channel:`, err);
            return;
        }
    }

    // Build log embed
    const embed = new EmbedBuilder()
        .setTitle('🛡️ Admin Action Logged')
        .setColor(EMBED_COLOR)
        .setDescription(actionDescription)
        .addFields(
            { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: 'Command', value: `/${interaction.commandName}`, inline: true }
        )
        .setTimestamp();

    try {
        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error(`❌ Failed to send embed log:`, err);
    }
}
