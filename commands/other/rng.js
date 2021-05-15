exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const input = message.content.slice(1).trim();
        const [, , inputValues] = input.match(/(\w+)\s*([\s\S]*)/);
        let inputNumbers = inputValues.replace(", ", " ").split(" ");

        if (!inputNumbers[1]) return message.reply(`You need to provide 2 numbers.`);
        let lowNumber = inputNumbers[0];
        let highNumber = inputNumbers[1];
        if (lowNumber.startsWith("-")) lowNumber = lowNumber.substring(1, lowNumber.length + 1) * -1;
        if (highNumber.startsWith("-")) highNumber = highNumber.substring(1, highNumber.length + 1) * -1;

        if (isNaN(lowNumber) || isNaN(highNumber)) return message.reply(`Make sure both values provided are numbers.`);
        lowNumber = parseInt(lowNumber);
        highNumber = parseInt(highNumber);
        if (lowNumber > highNumber) return message.reply(`Make sure the first number is lower than the second number.`);

        let randomValue = randomIntFromInterval(lowNumber, highNumber);

        return message.reply(`Your random number is \`${randomValue}\`.`);

        function randomIntFromInterval(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "rng",
    aliases: ["random", "number"],
    description: "Generate a random number.",
    options: [{
        name: "numbers",
        type: "STRING",
        description: "Two numbers seperated by a comma.",
        required: true
    }]
};