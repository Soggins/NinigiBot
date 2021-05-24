module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_ROLES") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        // Minutes the user is muted
        let muteTime = 60;
        let muteRoleName = "muted";

        if (!args[0]) return sendMessage(client, message, `Please provide a mentioned user as an argument.`);

        if (args[1]) {
            muteTime = args[1];
            if (isNaN(muteTime) || 1 > muteTime) return sendMessage(client, message, `Please provide a valid number.`);
            if (muteTime > 10080) muteTime = 10080;
        };

        let member;
        if (message.mentions) {
            member = message.mentions.members.first();
        };
        if (!member) return sendMessage(client, message, `Please use a proper mention if you want to mute someone.`);
        const role = member.guild.roles.cache.find(role => role.name.toLowerCase() == muteRoleName);
        if (!role) return sendMessage(client, message, `There is no mute role. In order to mute someone, you need to create a role called "Muted".`);

        let isMuted = member.roles.cache.find(r => r.name.toLowerCase() == muteRoleName);
        if (isMuted) {
            await member.roles.remove(role);
            return sendMessage(client, message, `${member.user.tag} has been unmuted.`);
        } else {
            await member.roles.add(role);
            sendMessage(client, message, `${member.user.tag} has been muted for ${muteTime} minute(s).`);
            // sets a timeout to unmute the user.
            setTimeout(async () => { await member.roles.remove(role) }, muteTime * 60 * 1000);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "mute",
    aliases: ["unmute"],
    description: "Mute a specific user.",
    options: [{
        name: "user-mention",
        type: "MENTIONABLE",
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID."
    }]
};