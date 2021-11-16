const Express = require('express');
const router = Express.Router();
const CodeModel = require('../Models/codelog')

router.get('/test', (req,res) => {
    res.send('this is a test')
});

router.post('/create', async (req,res) => {
    const {cheat, code, enables, effects} = req.body.codelog;
    const {id} = req.user;
    const codelogEntry = {
        cheat,
        code,
        enables,
        effects,
        owner: id
    }
    try {
        const newCodelog = await CodeModel.create(codelogEntry);
        res.status(200).json(newCodelog)
    }catch (err){
        res.status(500).json({error: err});
    }
});

router.get('/', async (req,res) => {
    try{
        const entries = await CodeModel.findAll();
        res.status(200).json(entries);
    }catch (err){
        res.status(500).json({error: err});
    }
});

router.get('/mine',async(req,res) => {
    let {id} = req.user;
    try {
        const userCodelog = await CodeModel.findAll({
            where: {
                owner: id
            }
        });
        res.status(200).json(userCodelog);
    } catch (err) {
        res.status(500).json({error: err})
    }
});

router.put('/update/:entryId', async (req, res)=>{
     const {cheat, code, enables, effects} = req.body.gamelog;
     const codelogId = req.params.entryId;
     const userId = req.user.id;

     const query = {
         where: {
             id: codelogId,
             owner: userId
         }
     };

     const updatedCodelog ={
         cheat: cheat,
         code: code,
         enables: enables,
         effects: effects,
     };
    try {
        const update = await CodeModel.update(updatedCodelog, query);
        res.status(200).json(update);
    } catch (err) {
        res.status(500).json({error: err})
    }
});

router.delete('/:id', async(req, res) => {
    const ownerId = req.user.id;
    const codelogId = req.params.id;

    try{
        const query ={
            where: {
                id: codelogId,
                owner: ownerId
            }
        };

        await CodeModel.destroy(query);
        res.status(200).json({message: 'Code Log Destroyed'})
    } catch (err) {
        res.status(500).json({ error: err})
    }
})


module.exports = router