module.exports.run = async (client, message, args) => {
    try {
        let pizzapi = require('domino');
        const { DMAllowed } = require('../../database/dbObjects');

        let DMAllowedUser = await DMAllowed.findOne({ where: { user_id: message.author.id } });
        if (!DMAllowedUser) await DMAllowed.upsert({ user_id: message.author.id });
        DMAllowedUser = DMAllowed.findOne({ where: { user_id: message.author.id } });

        message.channel.send(`> Okay, I will try to DM you now to take care of your order, ${message.author}.`);
        message.author.send("epic dm momento");

        // pizzapi.Util.findNearbyStores(
        //     '63102',
        //     'Delivery',
        //     function (storeData) {
        //         console.log(storeData);
        //     }
        // );

        await channelID.destroy();
        return message.channel.send(`> Successfully completed your order, ${message.author}. I will DM you updates:tm:.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "dominos",
    aliases: ["domino"]
};