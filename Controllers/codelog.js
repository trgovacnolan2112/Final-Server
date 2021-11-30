const Express = require('express');
const router = Express.Router();
let validateJWT = require('../Middleware/validate-jwt');
const { AccessControl } = require('accesscontrol');
const CodeModel = require('../Models/codelog')
const ac= new AccessControl();
ac.grant('Admin').readAny('forum').deleteAny('codelog')
ac.grant('User').deleteOwn('codelog')

router.get('/test', (req,res) => {
    res.send('this is a test')
});
router.post('/create',validateJWT, async (req,res) => {
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
})
router.delete('/:id',validateJWT, async(req, res) => {
    const permission= ac.can(req.user.role).deleteOwn('codelog')
    if(permission.granted){
        const codelog = req.params.id
        const {id} = req.user
    try{
        const query ={
            where: {
                id: codelog,
            }
        };
        await CodeModel.destroy(query);
        res.status(200).json({message: 'Code Log Destroyed'})
    } catch (err) {
        res.status(500).json({ error: err})
    }
}else{
    res.status(403).json({message: "Incorrect User Go Away"})
}
})


module.exports = router


router.get('/mine',validateJWT, async(req,res) => {
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

router.put('/update/:id',validateJWT, async (req, res)=>{
     const {cheat, code, enables, effects} = req.body.codelog;
     const codelogId = req.params.id;
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
        await CodeModel.update(updatedCodelog, query);
        res.status(200).json({
            message: "Codelog Updated",updatedCodelog
        });
    } catch (err) {
        res.status(500).json({error: err})
    }
});
//ADMIN SECTION

router.get('/forum',validateJWT, async (req,res) => {
    const permission= ac.can(req.user.role).readAny('forum')
    if(permission.granted){
    try{
        const entries = await CodeModel.findAll();
        res.status(200).json(entries);
    }catch (err){
        res.status(500).json({error: err});
    }
}else{
    res.status(403).json({message: 'No User Allowed'})
}
});
router.delete('/:id',validateJWT, async(req, res) => {
    const permission = ac.can(req.user.role).deleteAny('codelog')
    if(permission.granted){
        const codelogId = req.params.id
    try{
        const query ={
            where: {
                id: codelogId
            }
        }
        await CodeModel.destroy(query);
        res.status(200).json({message: 'Code Log Destroyed'})
    } catch (err) {
        res.status(500).json({message: 'Failed to Yeet Log'})
    }
    } else {
        res.status(403).json({message: 'Not an Admin'})
    }
})
module.exports = router