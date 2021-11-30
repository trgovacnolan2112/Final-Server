const UserModel = require('./user');
const GameModel = require('./gamelog')
const CodeModel = require('./codelog');
const User = require('./user');

GameModel.belongsTo(User)
CodeModel.belongsTo(User)

User.hasMany(GameModel)
User.hasMany(CodeModel)

module.exports = {
    UserModel,
    GameModel,
    CodeModel
};
