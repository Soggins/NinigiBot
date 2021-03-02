const { config } = require('../commands/mod/purge');

const talkedRecently = new Set();

module.exports = async (client, message) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { bank } = require('../database/bank');
        let secondCharacter = message.content.charAt(1);

        const { DisabledChannels, StarboardChannels, Prefixes, DMAllowed } = require('../database/dbObjects');
        const dbChannels = await DisabledChannels.findAll();
        const channels = dbChannels.map(channel => channel.channel_id);
        const dbAllowedDMs = await DMAllowed.findAll();
        const allowedDMs = dbAllowedDMs.map(allowedDM => allowedDM.user_id);
        let prefix = false;
        if (message.guild) prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        const autoMod = require('../util/autoMod');

        // Call image
        let messageImage = null;
        let messageVideo = null;
        if (message.attachments.size > 0) {
            messageImage = message.attachments.first().url;
            if (messageImage.endsWith(".mp4")) {
                messageVideo = messageImage;
                messageImage = null;
            };
        };

        if (!allowedDMs.includes(message.author.id) && message.author.id !== client.config.ownerID) {
            // Ignore commands in DMs
            if (message.channel.type == "dm" || !message.guild) {
                if (message.author.bot) return;
                if (message.content.indexOf(prefix) == 0) {
                    message.author.send(`> Sorry ${message.author}, you're not allowed to use commands in private messages!`);
                };
                // Send message contents to dm channel
                let DMChannel = client.channels.cache.get(client.config.devChannelID);
                let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
                const dmEmbed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setAuthor(`DM Message`, avatar)
                    .setThumbnail(avatar)
                    .addField(`Author:`, message.author.tag, false)
                    .addField(`Author ID:`, message.author.id, false);
                if (message.content) dmEmbed.addField(`Message content:`, message.content, false);
                dmEmbed
                    .setImage(messageImage)
                    .setFooter(client.user.tag)
                    .setTimestamp();
                return DMChannel.send(dmEmbed);
            };
        };

        if (message.guild) {
            if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
        };

        // Starboard functionality
        message.awaitReactions(reaction => reaction.emoji.name == "⭐", { max: globalVars.starboardLimit, time: 3600000 }).then(async collected => {
            let starboardChannel = await StarboardChannels.findOne({ where: { server_id: message.guild.id } });
            // Check various permissions and channel existences
            if (starboardChannel) {
                let starboard = message.guild.channels.cache.find(channel => channel.id == starboardChannel.channel_id);
                if (starboard) {
                    if (message.channel !== starboard) {
                        if (!starboard.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I don't have permissions to send embedded message to your starboard, ${message.author}.`);
                        if (!collected.first()) return;
                        if (collected.first().count >= globalVars.starboardLimit) {
                            // Assemble embed
                            let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
                            const starEmbed = new Discord.MessageEmbed()
                                .setColor(globalVars.embedColor)
                                .setAuthor(`⭐ ${message.author.username}`, avatar)
                                .setDescription(message.content)
                                .addField(`Sent:`, `By ${message.author} in ${message.channel}`, false)
                                .addField(`Context:`, `[Link](${message.url})`, false)
                                .setImage(messageImage)
                                .setFooter(message.author.tag)
                                .setTimestamp(message.createdTimestamp);
                            // Sending logic
                            if (messageVideo) {
                                await starboard.send(starEmbed);
                                starboard.send({ files: [messageVideo] });
                            } else {
                                starboard.send(starEmbed);
                            };
                        };
                    };
                };
            };
        });

        // Ignore all bots and welcome messages
        if (message.author.bot) return;
        if (!message.member) return;

        // Automod
        autoMod(message);

        let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

        // Add currency if message doesn't start with prefix
        if (message.content.indexOf(prefix) !== 0 && !talkedRecently.has(message.author.id) && memberRoles.size !== 0) {
            bank.currency.add(message.author.id, 1);
            talkedRecently.add(message.author.id);
            setTimeout(() => {
                talkedRecently.delete(message.author.id);
            }, 60000);
        };

        // Ignore messages not starting with the prefix
        if (message.content.indexOf(prefix) !== 0) return;

        // Ignore messages that are just prefix
        if (message.content === prefix) return;

        // Ignore messages that start with prefix double or prefix space
        if (secondCharacter == prefix || secondCharacter == ` `) return;

        // Standard definition
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        // Grab the command data from the client.commands Enmap
        let cmd;
        if (client.commands.has(commandName)) {
            cmd = client.commands.get(commandName);
        } else if (client.aliases.has(commandName)) {
            cmd = client.commands.get(client.aliases.get(commandName));
        } else return;

        // Ignore messages sent in a disabled channel
        if (channels.includes(message.channel.id) && !message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send(`> Commands have been disabled in this channel, ${message.author}.`);

        // Run the command
        if (cmd) {
            message.channel.startTyping();
            await cmd.run(client, message, args);
            message.channel.stopTyping(true);
        } else return;

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, message);
    };
};
