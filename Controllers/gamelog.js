const Express = require('express');
const router = Express.Router();
const GameModel = require('../Models/gamelog')

router.get('/test', (req,res) => {
    res.send('this is a test')
});

router.post('/create', async (req,res) => {
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

router.get('/', async (req,res) => {
    try{
        const entries = await GameModel.findAll();
        res.status(200).json(entries);
    }catch (err){
        res.status(500).json({error: err});
    }
});

router.get('/mine',async(req,res) => {
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

router.put('/update/:entryId', async (req, res)=>{
     const {title, hoursplayed, difficulty, rating, comments} = req.body.gamelog;
     const gamelogId = req.params.entryId;
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
        const update = await GameModel.update(updatedGamelog, query);
        res.status(200).json(update);
    } catch (err) {
        res.status(500).json({error: err})
    }
});

router.delete('/:id', async(req, res) => {
    const ownerId = req.user.id;
    const gamelogId = req.params.id;

    try{
        const query ={
            where: {
                id: gamelogId,
                owner: ownerId
            }
        };

        await GameModel.destroy(query);
        res.status(200).json({message: 'Game Log Destroyed'})
    } catch (err) {
        res.status(500).json({ error: err})
    }
})

module.exports = router;