// utils/permissions.js

/**
 * Checks if a user has any of the allowed role IDs.
 * @param {Interaction} interaction
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export function userHasAllowedRole(interaction, allowedRoles) {
    return interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));
}

/**
 * Handles denial + reply if user lacks permission
 * @param {Interaction} interaction
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export async function requireAllowedRole(interaction, allowedRoles) {
    if (!userHasAllowedRole(interaction, allowedRoles)) {
        await interaction.reply({
            content: '🚫 You do not have permission to use this command.',
            ephemeral: true
        });
        return false;
    }
    return true;
}

