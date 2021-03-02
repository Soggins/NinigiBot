module.exports = (sequelize, DataTypes) => {
    return sequelize.define('dm_allowed', {
        user_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};