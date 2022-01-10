exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);

        // Split off command
        if (!args[0]) return sendMessage(client, message, `Please provide text to say.`);
        let channelID = args[0];
        let textMessage = args.join(" ");
        let remoteMessage = textMessage.slice(channelID.length + 1);

        // Catch empty argument
        if (textMessage.length < 1) {
            return sendMessage(client, message, `You need to specify text for me to say.`);
        };

        return message.channel.send({ content: textMessage });


    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "say",
    aliases: [],
    description: "Makes the bot repeat text.",
    options: [{
        name: "input",
        type: "STRING",
        description: "Text to make the bot say."
    }]
};