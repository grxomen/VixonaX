import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from 'discord.js';
import {
  addToBlacklist,
  removeFromBlacklist,
  listBlacklist
} from '../utils/blacklist.js';

export default {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage bot blacklist')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a user/channel/role to the blacklist')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Type to block')
            .setRequired(true)
            .addChoices(
              { name: 'user', value: 'user' },
              { name: 'channel', value: 'channel' },
              { name: 'role', value: 'role' }
            )
        )
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('ID of the user/channel/role')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('reason')
            .setDescription('Reason for blacklisting')
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove from the blacklist')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Type')
            .setRequired(true)
            .addChoices(
              { name: 'user', value: 'user' },
              { name: 'channel', value: 'channel' },
              { name: 'role', value: 'role' }
            )
        )
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('ID to remove')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Show all blacklisted entries')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const type = interaction.options.getString('type');
      const id = interaction.options.getString('id');
      const reason = interaction.options.getString('reason') || 'No reason';

      await addToBlacklist(type, id, reason);
      return interaction.reply({
        content: `✅ Added ${type} \`${id}\` to blacklist.\n📝 Reason: ${reason}`,
        ephemeral: true
      });
    }

    if (sub === 'remove') {
      const type = interaction.options.getString('type');
      const id = interaction.options.getString('id');

      await removeFromBlacklist(type, id);
      return interaction.reply({
        content: `✅ Removed ${type} \`${id}\` from blacklist.`,
        ephemeral: true
      });
    }

    if (sub === 'list') {
      const entries = await listBlacklist();
      if (!entries.length) {
        return interaction.reply({ content: '📭 Blacklist is empty.', ephemeral: true });
      }

      const mapped = entries.map(entry => `• **${entry.type}** \`${entry.id}\` — ${entry.reason}`);
      return interaction.reply({
        content: `📃 Blacklisted Entries:\n${mapped.join('\n')}`,
        ephemeral: true
      });
    }
  }
};

