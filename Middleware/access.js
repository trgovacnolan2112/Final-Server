const {Roles} = require('./roles')

const Access = (action, resource) => {
    return async (req, res, next) => {
        try {
            console.log(req.user.role)
            const permission = Roles.can(req.user.role)[action](resource);
            if(!permission.granted){
                return res.status(401).json({
                    error: "Permission Denied"
                });
            }
            next()
        }catch (err) {
            next(err)
        }
    }
}

module.exports= Access