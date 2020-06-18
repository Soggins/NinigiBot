module.exports = (client, message) => {
  try {
    const Discord = require("discord.js");
    let NinigiDMChannelID = "674371091006881832";

    // Import totals
    let globalVars = require('./ready');

    // Ignore all bots
    if (message.author.bot) return;

    // +1 messages count
    globalVars.totalMessages += 1;

    // Ignore commands in DMs
    if (message.channel.type == "dm") {
      if (message.content.indexOf(client.config.prefix) == 0) {
        message.author.send(`> Sorry <@${message.author.id}>, you're not allowed to use commands in private messages!`).catch(console.error);
      };

      let AttachmentString = `None`;
      var Attachment = (message.attachments).array();
      if (message.attachment) {
        let AttachmentString = ``;
        forEach(Attachment)
        AttachmentString = `${AttachmentString}
${Attachment.url}`;
      };

      if (!message.content) {
        message.content = `None`
      };

      // Send message contents to dm channel
      let DMChannel = client.channels.find('id', NinigiDMChannelID);

      const dmEmbed = new Discord.RichEmbed()
        .setColor("#219DCD")
        .setAuthor(`DM`, message.author.avatarURL)
        .setThumbnail(message.author.avatarURL)
        .addField(`Author account:`, message.author, false)
        .addField(`Author ID:`, message.author.id, false)
        .addField(`Message content:`, message.content, false)
        // .addField(`Attachment(s):`, AttachmentString, false)
        .setFooter(`DM passed through by ${client.config.botName}.`)
        .setTimestamp();

      return DMChannel.send(dmEmbed);
    };

    // Reply with checkthepinsemote if people mention the word bot lol
    let lowercaseContent = message.content.toLowerCase();
    let PokemonChannelID = "656557551755853844";
    if (lowercaseContent.includes("bot")) {
      switch (message.channel.id) {
        case client.config.botChannelID:
          sysbotMessage = `<a:checkthepins:712296040455471185>`;
          break;
        case PokemonChannelID:
          sysbotMessage = `<a:checkthepins:712296040455471185> in <#${client.config.botChannelID}>.`;
          break;
      };
      message.channel.send(sysbotMessage);
    };

    // Ignore messages not starting with the prefix
    if (message.content.indexOf(client.config.prefix) !== 0) return;

    // Ignore messages that are just prefix
    if (message.content === client.config.prefix) return;

    // Ignore messages that start with prefix double or prefix space
    let secondCharacter = message.content.charAt(1);
    if (secondCharacter == client.config.prefix || secondCharacter == ` `) return;

    // Standard definition
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Grab the command data from the client.commands Enmap
    const cmd = client.commands.get(command);

    // If that command doesn't exist, exit
    // if (!cmd) return message.channel.send(`> Sorry <@${message.author.id}>, that command doesn't exist.`);

    // +1 command count and drop message count
    globalVars.totalCommands += 1;
    globalVars.totalMessages -= 1;

    // Run the command
    cmd.run(client, message, args);

  } catch (e) {
    // log error
    console.log(e);
  };
};