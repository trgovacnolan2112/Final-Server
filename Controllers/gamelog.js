const { AccessControl } = require('accesscontrol');
const Express = require('express');
const router = Express.Router();
let validateJWT = require('../Middleware/validate-jwt');
const GameModel = require('../Models/gamelog')
const ac= new AccessControl();
ac.grant('Admin').readAny('forum').deleteAny('gamelog')
ac.grant('User').deleteOwn('gamelog')

router.get('/test', (req,res) => {
    res.send('this is a test')
});

router.post('/create',validateJWT, async (req,res) => {
    const {title, hoursplayed, difficulty, rating, comments} = req.body.gamelog;
    const {id} = req.user;
    const gamelogEntry = {
        title,
        hoursplayed,
        difficulty,
        rating,
        comments,
        owner: id
    }
    try {
        const newGamelog = await GameModel.create(gamelogEntry);
        res.status(200).json(newGamelog)
    }catch (err){
        res.status(500).json({error: err});
    }
});

router.get('/mine',validateJWT,async(req,res) => {
    let {id} = req.user;
    try {
        const userGamelog = await GameModel.findAll({
            where: {
                owner: id
            }
        });
        res.status(200).json(userGamelog);
    } catch (err) {
        res.status(500).json({error: err})
    }
});

router.get('/:rating',async(req,res) => {
    const {rating} = req.params;
    try{
        const results = await GameModel.findAll({
            where: {rating: rating}
        });
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({error: err})
    }
});

router.put('/update/:id',validateJWT, async (req, res)=>{
     const {title, hoursplayed, difficulty, rating, comments} = req.body.gamelog;
     const gamelogId = req.params.id;
     const userId = req.user.id;
     const query = {
         where: {
             id: gamelogId,
             owner: userId
         }
     };
     const updatedGamelog ={
         title: title,
         hoursplayed: hoursplayed,
         difficulty: difficulty,
         rating: rating,
         comments: comments
     };
    try {
        await GameModel.update(updatedGamelog, query);
        res.status(200).json({
            message: "Gamelog Updated",updatedGamelog
        });
    } catch (err) {
        res.status(500).json({error: err})
    }
});

router.delete('/:id',validateJWT, async(req, res) => {
    const permission= ac.can(req.user.role).deleteOwn('gamelog')
    if(permission.granted){
    const gamelogId = req.params.id;
    const {id} = req.user
    try{
        const query ={
            where: {
                id: gamelogId,
            }
        };
        await GameModel.destroy(query);
        res.status(200).json({message: 'Game Log Destroyed'})
    } catch (err) {
        res.status(500).json({ error: err})
    }
}else{
    res.status(403).json({message: 'Talk To Admin'})
}
})
//ADMIN SECTION

router.get('/forum',validateJWT, async (req,res) => {
    const permission = ac.can(req.user.role).readAny('all')
    if(permission.granted){
    try{
        const entries = await GameModel.findAll();
        res.status(200).json(entries);
    }catch (err){
        res.status(500).json({error: err});
    }
}else{
    res.status(403).json({message: 'No User Allowed'})
}
});
router.delete('/:id',validateJWT, async(req, res) => {
    const permission = ac.can(req.user.role).deleteAny('gamelog')
    if(permission.granted){
        const gamelogId = req.params.id
    try{
        const query ={
            where: {
                id: gamelogId
            }
        }
        await CodeModel.destroy(query);
        res.status(200).json({message: 'Game Log Destroyed'})
    } catch (err) {
        res.status(500).json({message: 'Failed to Yeet Log'})
    }
    } else {
        res.status(403).json({message: 'Not an Admin'})
    }
})

module.exports = router;