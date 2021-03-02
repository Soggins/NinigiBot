module.exports.run = async (client, message, args) => {
    try {
        let pizzapi = require('domino');
        const { DMAllowed } = require('../../database/dbObjects');

        var DMAllowedUser = await DMAllowed.findOne({ where: { user_id: message.author.id } });
        if (!DMAllowedUser) await DMAllowed.upsert({ user_id: message.author.id });

        message.channel.send(`> Okay, I will try to DM you now to take care of your order, ${message.author}.`);
        let initDM = await message.author.send(`> Please enter your postal code, ${message.author}.`);
        let filter = collected => collected.author.id === message.author.id;

        await initDM.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
            .then(async (collected) => {

                console.log(collected)
                pizzapi.Util.findNearbyStores(
                    '63102',
                    'Delivery',
                    function (storeData) {
                        console.log(storeData);
                    }
                );

            })
            .catch(async (error) => {
                console.log(error)
                await DMAllowedUser.destroy();
                return message.author.dmChannel.send(`> An error occurred or your order timed out, please try again, ${message.author}.`);
            });

        DMAllowedUser = await DMAllowed.findOne({ where: { user_id: message.author.id } });
        if (DMAllowedUser) await DMAllowedUser.destroy();
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