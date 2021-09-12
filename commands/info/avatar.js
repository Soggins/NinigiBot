exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require('discord.js');

        // Get user
        let user;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = message.mentions.users.first();
        };

        if (!user && args[0]) {
            let userID = args[0];
            user = await client.users.fetch(userID);
            if (!user) user = client.users.cache.find(user => user.username.toLowerCase() == args[0].toString().toLowerCase());
        };

        if (!user) {
            if (message.type == 'DEFAULT') {
                user = message.author;
            } else {
                user = message.member.user;
            };
        };

        let member;
        try {
            member = await message.guild.members.fetch(user.id);
        } catch (e) {
            // console.log(e);
            return sendMessage(client, message, `No member information could be found for this user.`);
        };

        // Get avatar
        let avatar = null;
        if (user.avatarURL()) avatar = user.avatarURL({ format: "png", dynamic: true });
        if (!avatar) return sendMessage(client, message, `**${user.tag}** doesn't have an avatar.`);

        const avatarEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`${user.username}'s avatar:`)
            .setImage(`${avatar}?size=512`)
            .setFooter(user.tag)
            .setTimestamp();

        return sendMessage(client, message, null, avatarEmbed);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "Avatar",
    type: "USER",
    aliases: ["avi", "pfp"]
};