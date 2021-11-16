const {DataTypes} = require('sequelize');
const db = require('../db');

const Gamelog = db.define('gamelog', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hoursplayed: {
        type: DataTypes.TIME,
        allowNull: false
    },
    difficulty: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comments: {
        type: DataTypes.STRING,
        allowNull: false
    },
    owner: {
        type: DataTypes.INTEGER
    }
})

module.exports = Gamelog