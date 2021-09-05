exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const { bank } = require('../../database/bank');
        let target;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            target = message.mentions.users.first();
        };

        // Get user
        if (!target) {
            let userID = args[0];
            target = client.users.cache.get(userID);
        };


        if (!target) {
            if (message.type == 'DEFAULT') {
                target = message.author;
            } else {
                target = message.member.user;
            };
        };

        let member;
        try {
            member = await message.guild.members.fetch(target);
        } catch (e) {
            // console.log(e);
            return sendMessage(client, message, `No member information could be found for this user.`);
        };

        return sendMessage(client, message, `${target.tag} has ${Math.floor(bank.currency.getBalance(target.id))}${globalVars.currency}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "balance",
    aliases: ["bal", "money"],
    description: "Sends how much money you have."
};