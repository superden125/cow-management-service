import jwt from '../lib/jwt'

module.exports = {
    isLogin: async (req,res,next)=>{
        try{
            const token = req.header("x-session-key").split(' ')[1]

            if(!token) return res.status(401).json({err: "invalid session"})

            let decode = await jwt.decode(token)            
            if(!decode) return res.status(401).json({err: "invalid session"})
            req.session.user = decode
            next()
        }catch(err){
            res.status(401).json({err: 'invalid session'})
        }        
    },
    isManager: async (req,res,next)=>{        
        let user = req.session.user        
        if(!user) return res.status(401).json({err: "invalid session"})
        if(['admin','manager'].findIndex(x=>x == user.role) == -1)
            return res.status(401).json({err: "invalid access permission"})
        next()        
    },
    isAdmin: async (req,res,next)=>{        
        let user = req.session.user        
        if(!user) return res.status(401).json({err: "invalid session"})
        if(user.role !== 'admin')
            return res.status(401).json({err: "invalid access permission"})
        next()
    },
}