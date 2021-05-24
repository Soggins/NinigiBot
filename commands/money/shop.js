const Sequelize = require('sequelize');
const { ne } = Sequelize.Op;

exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { Equipments, Foods, KeyItems, Room, CurrencyShop, Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        const [, , input] = args[0].match(/(\w+)\s*([\s\S]*)/);
        const condition = { where: { cost: { [ne]: 0 } } };
        // Lottery Tickets are messed up and temporarily removed, so items is empty
        /*if (input == 'items') {
            const items = await CurrencyShop.findAll(condition);
            return sendMessage(client, message,items.map(i => i.toString()).join('\n'), { code: true });
        }*/ if (input == 'equipment') {
            const items = await Equipments.findAll(condition);
            return sendMessage(client, message, items.map(i => i.toString()).join('\n'), { code: true });
        } if (input == 'food') {
            const items = await Foods.findAll(condition);
            return sendMessage(client, message, items.map(i => i.toString()).join('\n'), { code: true });
        } // Coming soon, maybe
        /* if(input == 'key'){
            const items = await KeyItems.findAll(condition);
            return sendMessage(client, message,items.map(i => i.toString()).join('\n'), { code: true });
        } *//* if(input == 'rooms'){
            const items = await Room.findAll(condition);
            return sendMessage(client, message,items.map(i => i.toString()).join('\n'), { code: true });
        } */
        return sendMessage(client, message, `That is not an existing shop. Please use \`${prefix}shop\` followed by a category: equipment, food.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "shop",
    aliases: ["store"],
    description: "Displays items in the shop.",
    options: [{
        name: "equipment",
        type: "SUB_COMMAND",
        description: "Equipment shop."
    }, {
        name: "food",
        type: "SUB_COMMAND",
        description: "Food shop."
    }]
};