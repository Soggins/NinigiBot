module.exports = async (client) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        let currentdate = new Date();
        let datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
        return datetime;

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};