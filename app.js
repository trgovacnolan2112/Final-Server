require('dotenv').config();
const Express = require('express');
const app = Express ();
const controllers = require('./Controllers')
const dbConnection = require('./db')
app.use(require('./Middleware/headers'));
app.use(Express.json());
app.use('/user', controllers.userC);
app.use('/gamelog', controllers.gameLog);
app.use('/codelog', controllers.codeLog)

dbConnection.authenticate()
 .then(() => dbConnection.sync())
 .then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`[Server]: App is listening on ${process.env.PORT}`)
    });
 })
 .catch((err) => {
     console.log(`[Server]: Crashed. Error=${err}`)
 })