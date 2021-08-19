const express = require('express')
const UserController = require('../controller/user')


const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let user = await UserController.findById(id)        
        if(!user) return res.json({status: false, msg: "user not found"})            
        res.json({status: true, data: user})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let user = await UserController.updateOne(id,data)
        if(user.err) return res.json({status: false, msg: "something wrong"})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let user = await UserController.deleteById(id)
        if(!user) return res.json({status: false, msg: "user not found"})
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
    .post(async (req,res)=>{
        let data = req.body                                    
        let result = await UserController.insertOne(data)
        if(result.err) return res.json({status: false})        
        return res.json({status: true, data: result})

    })

router.route('/signin')
    .post(async (req,res)=>{
        try {
            let {username, password} = req.body
            if(!username || !password) return res.json({status: false, message: "username or password null"})
            let result = await UserController.signin({username,password})
            if(result.err) return res.json({status: false, message: result.err})
            return res.json({status: true, data: result})
        } catch (error) {
            return res.json({status: false, message: "Login fail"})
        }
    })

 module.exports = router