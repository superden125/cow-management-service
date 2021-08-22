const express = require('express')
const UserController = require('../controller/user')
const {isAdmin, isManager} = require('../middleware/auth')

const router = express.Router()

router.use(isManager)

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let user = await UserController.findById(id)        
        if(!user || user.err) return res.json({status: false, message: "user not found"})            
        res.json({status: true, data: user})
    })
    .put(isAdmin, async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let user = await UserController.updateOne(id,data)
        if(user.err) return res.json({status: false, message: user.err})
        res.json({status: true})
    })
    .delete(isAdmin, async (req,res)=>{
        let id = req.params.id
        let user = await UserController.deleteById(id)
        if(!user) return res.json({status: false, message: "user not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {            
            let query = req.query
            query.limit = query.limit ? query.limit : query.take
            delete query.take        
            let users = await UserController.getMany(query)
            res.json({status: true, data: users})
        } catch (error) {
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(isAdmin, async (req,res)=>{
        let data = req.body                                    
        let result = await UserController.insertOne(data)
        if(result.err) return res.json({status: false, message: result.err})
        return res.json({status: true, data: result})

    })

 module.exports = router