import { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import mongoose from 'mongoose';
import Canvas from 'canvas';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Schema
const profileSchema = new mongoose.Schema({
    userID: String,
    name: String,
    age: Number,
    location: String,
    hobbies: [String],
    bio: String,
    visibility: String,
});
const Profile = mongoose.model('Profile', profileSchema);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'profile') {
        await interaction.reply({
            content: 'Select an option:',
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('profile_selection')
                        .setPlaceholder('Choose an action')
                        .addOptions([
                            { label: 'Create Profile', value: 'create' },
                            { label: 'View Profile', value: 'view' },
                            { label: 'Edit Profile', value: 'edit' }
                        ])
                )
            ]
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'profile_selection') {
        const value = interaction.values[0];
        if (value === 'create') {
            await interaction.update({ content: 'Enter your name:', components: [] });

            const filter = msg => msg.author.id === interaction.user.id;
            const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });
            const name = collected.first().content;

            const newProfile = new Profile({
                userID: interaction.user.id,
                name,
                age: 0,
                location: 'Unknown',
                hobbies: [],
                bio: 'No bio yet',
                visibility: 'public'
            });
            await newProfile.save();

            // Auto-Role Assignment
            const role = interaction.guild.roles.cache.find(r => r.name === "Profile Created");
            if (role) {
                const member = interaction.guild.members.cache.get(interaction.user.id);
                if (member) await member.roles.add(role);
            }

            await interaction.followUp(`Profile created for ${name}! You have been assigned a role.`);
        }
        if (value === 'edit') {
            await interaction.update({
                content: 'What would you like to edit?',
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('edit_name').setLabel('Name').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_age').setLabel('Age').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_location').setLabel('Location').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_hobbies').setLabel('Hobbies').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('edit_bio').setLabel('Bio').setStyle(ButtonStyle.Primary)
                    )
                ]
            });
        }
    }
});

// Generate Profile Card with Canvas
async function generateProfileCard(profile, user) {
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#23272A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Avatar
    const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png' }));
    ctx.drawImage(avatar, 25, 25, 100, 100);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    ctx.fillText(`Name: ${profile.name}`, 150, 50);
    ctx.fillText(`Age: ${profile.age}`, 150, 100);
    ctx.fillText(`Location: ${profile.location}`, 150, 150);
    ctx.fillText(`Hobbies: ${profile.hobbies.join(', ')}`, 150, 200);

    return canvas.toBuffer();
}

client.login(process.env.TOKEN);
