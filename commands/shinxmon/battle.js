const { Users } = require('../../database/dbObjects');
const ShinxBattle = require('../../shinx/shinxBattle');
const colors = ['green', 'yellow', 'orange', 'red', 'purple'];

const addLine = (line) => {
    return (line + '\n');
};

const wait = () => new Promise(resolve => setTimeout(resolve, 5000));

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Canvas = require('canvas');
        const hp = require('../../util/getHP');
        const { bank } = require('../../database/bank');
        const Discord = require("discord.js");

        let author = interaction.user;
        let target = interaction.options.getUser("user");

        if (target.bot) return sendMessage({ client: client, interaction: interaction, content: `You can not battle a bot.` });

        const trainers = [author, target];
        if (!trainers[1]) return sendMessage({ client: client, interaction: interaction, content: `Please tag a valid person to battle.` });
        if (trainers[0].id === trainers[1].id) return sendMessage({ client: client, interaction: interaction, content: `You cannot battle yourself!` });
        if (globalVars.battling.yes) return sendMessage({ client: client, interaction: interaction, content: `Theres already a battle going on.` });
        let shinxes = [];

        for (let i = 0; i < 2; i++) {
            const shinx = await bank.currency.getShinx(trainers[i].id);
            if (!shinx) return sendMessage({ client: client, interaction: interaction, content: `At least one of the participants doesn't have a Shinx yet. Simply use \`/shinx\` to create one.` });
            shinx.see();
            if (shinx.sleeping) return sendMessage({ client: client, interaction: interaction, content: `At least one of the participating Shinx is asleep.` });
            const user = await Users.findOne({ where: { user_id: trainers[i].id } });
            if (!user) user = await Users.create({ user_id: trainers[i].id });
            const equipments = await user.getEquipments();
            shinxes.push(new ShinxBattle(trainers[i], shinx, equipments));
        };

        let ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        await interaction.channel.send({ content: `Do you accept the challenge, ${trainers[1]}? Type \`Yes\` to accept` });
        const filter = m => m.author.id == trainers[1].id;
        const accepts = await interaction.channel.awaitMessages({ filter, max: 1, time: 10000 });
        if (!accepts.first() || !'yes'.includes(accepts.first().content.toLowerCase())) return sendMessage({ client: client, interaction: interaction, content: `Battle has been cancelled.` });
        if (globalVars.battling.yes) return sendMessage({ client: client, interaction: interaction, content: `Theres already a battle going on.` });
        globalVars.battling.yes = true;
        let text = '';
        const avatars = [trainers[0].displayAvatarURL(globalVars.displayAvatarSettings), trainers[1].displayAvatarURL(globalVars.displayAvatarSettings)];

        let canvas = Canvas.createCanvas(240, 71);
        let ctx = canvas.getContext('2d');
        let background = await Canvas.loadImage('./assets/vs.png');
        ctx.drawImage(background, 0, 0);
        ctx.beginPath();
        for (let i = 0; i < 2; i++) ctx.arc(47 + 147 * i, 36, 29, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.clip();

        for (let i = 0; i < 2; i++) {
            const avatar = await Canvas.loadImage(avatars[i]);
            ctx.drawImage(avatar, 18 + 147 * i, 7, 58, 58);
        };

        let messageFile = new Discord.MessageAttachment(canvas.toBuffer());
        await interaction.channel.send({ files: [messageFile] });

        canvas = Canvas.createCanvas(240, 168);
        ctx = canvas.getContext('2d');
        background = await Canvas.loadImage('./assets/battleUI.png');
        ctx.drawImage(background, 0, 0);
        ctx.font = 'normal bolder 14px Arial';
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 2; i++) {
            ctx.fillText(trainers[i].username, 53 + 49 * i, 49 + 79 * i);
        };

        const battleSprite = await Canvas.loadImage('./assets/battleSprite.png');

        for (let i = 0; i < 2; i++) {
            if (shinxes[i].shiny) {
                ctx.drawImage(battleSprite, 39 * i, 0, 39, 26, (12 + 177 * i), 24 + 79 * i, 39, 26);
            };
        };

        const nicks = [];
        const prevColors = [0, 0];
        for (let i = 0; i < 2; i++) shinxes[i].nick.trim().toLowerCase() === 'shinx' ? nicks.push(`${shinxes[i].owner.username}'s Shinx`) : nicks.push(shinxes[i].nick);
        const geasson = await Canvas.loadImage('./assets/geasson.png');
        const geassoff = await Canvas.loadImage('./assets/geassoff.png');

        for (let i = 0; i < 2; i++) {
            if (shinxes[i].supergeass || shinxes[i].geass > 0) {
                text += addLine(`**...?**\nThe power of love remains!\n**${nicks[i]} entered geass mode!**`);
                ctx.drawImage(geasson, 52 + 35 * i, 20 + 79 * i);
                ctx.font = 'normal bolder 14px Arial';
                ctx.fillStyle = '#fc03c2';
                ctx.fillText(trainers[i].username, 53 + 49 * i, 49 + 79 * i);
            };
        };

        if (text.length > 0) interaction.channel.send({ content: text });
        while (true) {
            text = '';
            for (let i = 0; i < 2; i++) {
                const attackMove = shinxes[i].attack();
                text += addLine(`**${nicks[i]}** used **${attackMove[0]}**!`);
                const result = shinxes[(i + 1) % 2].takeDamage(attackMove);
                if (result === true) {
                    canvas = Canvas.createCanvas(240, 130);
                    ctx = canvas.getContext('2d');
                    background = await Canvas.loadImage('./assets/results.png');
                    ctx.drawImage(background, 0, 0);
                    ctx.beginPath();
                    for (let i = 0; i < 2; i++) ctx.arc(58 + 134 * i, 83, 40, 0, Math.PI * 2, false);
                    ctx.closePath();
                    ctx.clip();
                    for (let q = 0; q < 2; q++) {
                        const avatar = await Canvas.loadImage(avatars[q]);
                        ctx.drawImage(avatar, 18 + 134 * (q === i), 43, 80, 80);
                    };
                    text += addLine(`**${nicks[(i + 1) % 2]}** fainted!`);
                    const paidMoney = bank.currency.payBattle(trainers[(i + 1) % 2].id, trainers[i].id);
                    if (paidMoney !== 0) text += addLine(`${trainers[(i + 1) % 2].username} paid ${paidMoney}${globalVars.currency} to ${trainers[i].username}.`);
                    for (let h = 0; h < 2; h++) {
                        const exp = shinxes[h].gainExperience(shinxes[(h + 1) % 2].level, i !== h);
                        text += addLine(`**${nicks[h]}** won ${exp[0]} exp. points!`);
                        if (exp[1] > 0) {
                            text += addLine(`**${nicks[h]}** grew to level **${shinxes[h].level}**!`);
                            const rewards = await require('../../shinx/levelRewards')(shinxes[h], exp[1]);
                            if (rewards.length > 0) for (let c = 0; c < rewards.length; c++) text += addLine(`**${trainers[h].username}**, you got a new ${rewards[c][0]}: **${rewards[c][1]}**!`);
                        };
                    };

                    for (let p = 0; p < 2; p++) await bank.currency.updateShinx(shinxes[p], p === i);
                    globalVars.battling.yes = false;
                    let messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                    return sendMessage({ client: client, interaction: interaction, content: text, files: messageFile });
                } else {
                    if (result === -1) {
                        text += addLine(`**${nicks[i]}** lost his shield by blocking a deathblow!`);
                    };
                };
            };

            let shinxHP0 = await hp(shinxes[0].percent);
            let shinxHP1 = await hp(shinxes[1].percent);
            const hps = [shinxHP0, shinxHP1]
            for (let i = 0; i < 2; i++) {
                if (!isNaN(hps[i][0])) {
                    const color = hps[i][0];
                    if (color > 2 && prevColors[i] <= color - 1) {
                        ctx.fillStyle = colors[color - 1];
                        ctx.fillRect(38 + 90 * i, 58 + 78 * i, 96, 4);
                    };
                    ctx.fillStyle = colors[color];
                    ctx.fillRect(38 + 90 * i, 58 + 78 * i, hps[i][1], 4);
                    prevColors[i] = color;
                };
                if (shinxes[i].geassMode()) {
                    text += addLine(`**...?**\nThe power of love remains!\n**${nicks[i]} entered Geass mode!**`);
                    ctx.drawImage(geasson, 52 + 35 * i * i, 20 + 79 * i);
                    ctx.font = 'normal bolder 14px Arial';
                    ctx.fillStyle = '#fc03c2';
                    ctx.fillText(trainers[i].username, 53 + 49 * i, 49 + 79 * i);
                };
                if (shinxes[i].reduceGeass()) {
                    text += addLine(`**${nicks[i]} no longer has Geass mode!**`);
                    ctx.drawImage(geassoff, 52 + 35 * i * i, 20 + 79 * i);
                    ctx.font = 'normal bolder 14px Arial';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(trainers[i].username, 53 + 49 * i, 49 + 79 * i);
                };
                const regen = shinxes[i].applyRegen();
                if (regen) {
                    let verb = regen > 0 ? 'recovered' : 'lost';
                    text += addLine(`**${nicks[i]}** ${verb} some health!`);
                };
            };
            let messageFile = new Discord.MessageAttachment(canvas.toBuffer());
            interaction.channel.send({ content: text, files: [messageFile] });
            await wait();
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "battle",
    description: "Battle someone's Shinx.",
    options: [{
        name: "user",
        type: "USER",
        description: "Specify user.",
        required: true
    }]
};