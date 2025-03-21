const Canvas = require('canvas');

async function generateProfileCard(profile, user) {
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#23272A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png' }));
    ctx.drawImage(avatar, 25, 25, 100, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    ctx.fillText(`Name: ${profile.name}`, 150, 50);
    ctx.fillText(`Age: ${profile.age}`, 150, 100);
    ctx.fillText(`Location: ${profile.location}`, 150, 150);
    ctx.fillText(`Hobbies: ${profile.hobbies.join(', ')}`, 150, 200);

    return canvas.toBuffer();
}

module.exports = generateProfileCard;
