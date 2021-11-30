const router = require('express').Router();
const { UniqueConstraintError } = require('sequelize/lib/errors');
const {UserModel} = require('../Models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { AccessControl } = require('accesscontrol');
const validateJWT = require('../Middleware/validate-jwt');
const ac= new AccessControl()
ac.grant('Admin').createOwn('admin').deleteAny('delete').readAny('user')
ac.grant('User').createOwn('user').readOwn('user')

router.post('/register', async (req,res) => {
    let {username, email, password} = req.body.user;
    try{
    let User = await UserModel.create({
        username,
        email,
        password: bcrypt.hashSync(password, 13),
        role: "User"
    });
    let token = jwt.sign({id: User.id}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
    res.status(201).json({
        message: 'Register Completed',
        user: User,
        sessionToken: token,
    });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            res.status(409).json({
                message: 'Email Claimed'
            });
        } else {
        res.status(500).json({
            message: 'Register Failed',
        });
    }
}
});
router.get('/user',validateJWT, async (req,res) => {
    const permission = ac.can(req.user.role).readOwn('user')
    if(permission.granted){
    try{
        const entries = await UserModel.findOne();
        res.status(200).json(entries);
    }catch (err){
        res.status(500).json({error: err});
    }
}else{
    res.status(403).json({message: 'No User Allowed'})
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
//ADMIN

router.post('/register/Admin',validateJWT,async(req,res)=>{
    const permission = ac.can(req.user.role).createOwn('admin')
    if(permission.granted) {
        let {username, email, password, role}= req.body.user
        try{
           let User = await UserModel.create({
           username,
           email,
           password: bcrypt.hashSync(password, 13),
           role
           })
           let token = jwt.sign({id: User.id}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
            res.status(200).json({
                message: 'Admin Register Complete',
                user: User,
                sessionToken: token,
                role
            })
        } catch (err) {
            if(err instanceof UniqueConstraintError){
                res.status(409).json({
                    message: "Email Claimed"
                })
            }
            res.status(500).json({error: err})
        }
    } else {
        res.status(403).json({message: 'Ask Dev to Create Admin Manually'})
    }
});
router.delete('/:id',validateJWT, async(req, res) => {
    const permission = ac.can(req.user.role).deleteAny('delete')
    if (permission.granted){
        const id = req.params.id
        try {
            const query ={
                where: {
                    id: id
                }
            }
            await UserModel.destroy(query);
            res.status(200).json({message: 'User Ejected'})
        } catch(err) {
            res.status(500).json({message: 'Failed to Eject'})
        }
    } else {
        res.status(403).json({message: 'Not an Admin'})
    }
})
router.get('/user',validateJWT, async (req,res) => {
    const permission = ac.can(req.user.role).readAny('user')
    if(permission.granted){
    try{
        const entries = await UserModel.findAll();
        res.status(200).json(entries);
    }catch (err){
        res.status(500).json({error: err});
    }
}else{
    res.status(403).json({message: 'No User Allowed'})
}
});
module.exports = router;