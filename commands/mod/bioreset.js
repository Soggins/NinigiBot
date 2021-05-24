module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_MEMBERS") && !adminBool && message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const { bank } = require('../../database/bank');
        let user;
        if (message.mentions) {
            user = message.mentions.users.first();
        };

        if (!user) {
            let userID = args[0];
            user = client.users.cache.get(userID);
        };

        if (!user) return sendMessage(client, message, `Please use a proper mention if you want to reset someones bio.`);

        bank.currency.biography(user.id, "None");

        return sendMessage(client, message, `Successfully reset ${user.tag}'s bio.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "bioreset",
    aliases: [],
    description: "Reset the target user's biography.",
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