const express = require('express')
const UserController = require('../controller/user')
const {isAdmin} = require('../middleware/auth')

const router = express.Router()

router.use(isAdmin)

router.route('/user/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let user = await UserController.findById(id)        
        if(!user || user.err) return res.json({status: false, message: "user not found"})            
        res.json({status: true, data: user})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let user = await UserController.updateOne(id,data)
        if(user.err) return res.json({status: false, message: user.err})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let user = await UserController.deleteById(id)
        if(!user) return res.json({status: false, message: "user not found"})
        res.json({status: true})
    })

router.route('/user')
    .get(async (req,res)=>{
        try {            
            let query = req.query
            // query.limit = query.limit ? query.limit : query.take
            // delete query.take      
            query.filter = query.filter ? JSON.parse(query.filter): {}  
            let users = await UserController.getMany(query)
            res.json({status: true, data: users})
        } catch (error) {
            console.log("err", error)
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(async (req,res)=>{
        let data = req.body                                    
        let result = await UserController.insertOne(data)
        if(result.err) return res.json({status: false, message: result.err})
        return res.json({status: true, data: result})

    })

 module.exports = router