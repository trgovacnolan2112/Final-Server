const {DataTypes} = require('sequelize');
const db = require('../db');

const Codelog = db.define('codelog', {
    cheat: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    enables: {
        type: DataTypes.STRING,
        allowNull: false
    },
    effects: {
        type: DataTypes.STRING,
        allowNull: false
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

module.exports = Codelog