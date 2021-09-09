exports.run = async (client, message, args = [], language) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        let slowmodeMaxSeconds = 21600;

        // Toggle slowmode
        if (!args[0] || isNaN(args[0]) || args[0] < 0) return sendMessage(client, message, `You need to provide a valid number (seconds) to change the slowmode to.`);
        if (args[0] > slowmodeMaxSeconds) args[0] = slowmodeMaxSeconds;

        await message.channel.setRateLimitPerUser(args[0]);
        return sendMessage(client, message, `Slowmode changed to ${args[0]} seconds.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "slowmode",
    aliases: ["slow"],
    description: "Set slowmode in the current channel.",
    options: [{
        name: "seconds",
        type: "INTEGER",
        description: "The amount of slowmode in seconds."
    }]
};