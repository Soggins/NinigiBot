exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        if (!args[1]) return sendMessage(client, message, `You need to provide a message to send.`);

        // Split off command
        let textMessage = args.slice(1).join(" ");
        const userID = args[0];

        let targetUser;
        try {
            targetUser = await client.users.fetch(userID);
        } catch (e) {
            // console.log(e);
        };

        if (!targetUser) return sendMessage(client, message, `I could not find that ID, it's likely I don't share a server with them or they don't exist.`);

        try {
            await targetUser.send({ content: textMessage });
            return sendMessage(client, message, `Message succesfully sent to **${targetUser.tag}** (${targetUser.id}).`);
        } catch (e) {
            // console.log(e);
            return sendMessage(client, message, `Failed to message **${targetUser.tag}**. They probably have their DMs closed.`);
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "dm",
    description: "DMs a user.",
    defaultPermission: false,
    permission: "owner",
    options: [{
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID.",
        required: true
    }, {
        name: "input",
        type: "STRING",
        description: "Text message to DM.",
        required: true
    }]
};
