const router = require('express').Router();
const { UniqueConstraintError } = require('sequelize/lib/errors');
const {UserModel} = require('../Models');
const User = require('../Models/user');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

router.post('/register', async (req,res) => {
    let {username, email, password} = req.body.user;
    try{
    let User = await UserModel.create({
        username,
        email,
        password: bcrypt.hashSync(password, 13),
    });
    let token = jwt.sign({id: User.id}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
    res.status(201).json({
        message: 'Register Completed',
        user: User,
        sessionToken: token
    });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            res.status(409).json({
                message: 'Email Used'
            });
        } else {
        res.status(500).json({
            message: 'Register Failed',
        });
    }
}
});
router.post('/login', async (req,res) => {
    let {username, password} = req.body.user;
    try {
    let loginUser = await UserModel.findOne({
        where: {
            username: username,
        }
    });
    if (loginUser){
        let passwordComparison = await bcrypt.compare(password, loginUser.password)
        if (passwordComparison){
        let token = jwt.sign({id: loginUser.id}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
    res.status(200).json({
        user: loginUser,
        message: 'User Logged In',
        sessionToken: token
    });
    }else {
        res.status(401).json({
            message: 'Incorrect Email/Password'
        })
    }
    } else {
        res.status(401).json({
            message: 'Incorrect Email/Password'
        }); 
    }
    } catch (err) {
        res.status(500).json({
            message: 'Failed Login'
        })
    }
})

module.exports = router;