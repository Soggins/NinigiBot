exports.run = (client, message, args) => {
    try {
        const Discord = require("discord.js");

        let bot = client.users.find("id", client.config.botID);

        // Name presence type
        let presenceType = "Playing";
        if (bot.presence.game) {
            switch (bot.presence.game.type) {
                case 0:
                    presenceType = "Playing";
                    break;
                case 1:
                    presenceType = "Streaming";
                    break;
                case 2:
                    presenceType = "Listening to";
                    break;
                case 3:
                    presenceType = "Watching";
                    break;
                default:
                    presenceType = "Playing";
                    break;
            };
        } else {
            presenceType = "Playing";
        };

        // Define presence name
        let presenceName = "";
        if (!bot.presence.game) {
            presenceName = "nothing";
        } else {
            presenceName = bot.presence.game;
        };

        // Calculate the uptime in days, hours, minutes, seconds
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        // Figure out if the numbers given is different than 1
        let multiDays = "";
        if (days !== 1) { multiDays = "s" };
        let multiHours = "";
        if (hours !== 1) { multiHours = "s" };
        let multiMinutes = "";
        if (minutes !== 1) { multiMinutes = "s" };
        let multiSeconds = "";
        if (seconds !== 1) { multiSeconds = "s" };

        // Import totals
        let globalVars = require('../events/ready');

        // Reset hours
        if (hours >= 24) {
            hours = hours - 24;
        };

        // Bind variables together into a string
        let uptime = `${hours} hour${multiHours}, ${minutes} minute${multiMinutes} and ${seconds} second${multiSeconds}`;

        // Add day count if there are days
        if (days != 0) {
            uptime = `${days} day${multiDays}, ${uptime}`;
        };

        const profileEmbed = new Discord.RichEmbed()
            .setColor(0x219dcd)
            .setAuthor(client.config.botName, bot.avatarURL)
            .setThumbnail(bot.avatarURL)
            .addField("Activity:", `${presenceType} ${presenceName}`, true)
            .addField("Owner:", `<@${client.config.ownerID}>`, true)
            .addField("Full account:", client.config.botAccount, true)
            .addField("Bot ID:", client.config.botID, true)
            .addField("Prefix:", client.config.prefix, true)
            .addField("Users:", client.users.size, true)
            .addField("Servers:", client.guilds.size, true)
            .addField("Channels:", client.channels.size, true)
            .addField("Messages read:", globalVars.totalMessages, true)
            .addField("Commands used:", globalVars.totalCommands, true)
            .addField("Code:", "[Github](https://github.com/Glazelf/NinigiBot 'NinigiBot')", true)
            .addField("Language:", `Javascript`, true)
            .addField("Uptime:", uptime)
            .addField("Contributors:", `<@${client.config.contributorZoraID}>, <@${client.config.contributorSkinnixID}>`)
            .addField("Created at:", bot.createdAt)
            .setFooter(`Requested by ${message.author.tag} at:`)
            .setTimestamp();

        return message.channel.send(profileEmbed);

    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);

        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, <@${message.author.id}>, please use "${client.config.prefix}report" to report the issue.`);
    };
};

module.exports.help = {
    name: "Info",
    description: "Returns some information about this bot.",
    usage: `info`
};
