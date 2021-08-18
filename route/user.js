const express = require('express')
const UserController = require('../controller/user')

module.exports = (app) =>{
    const router = express.Router()    

    router.route('/:id')
        .get(async (req,res)=>{
            let id = req.params.id
            let user = await UserController.read(id)
            console.log("user", user)
            if(!user) return res.json({success: false, msg: "user not found"})            
            res.json({success: true, data: user})
        })
        .put(async (req,res)=>{
            let id = req.params.id
            let data = req.body
            let user = await UserController.update(id,data)
            if(!user) return res.json({success: false, msg: "something wrong"})
            res.json({success: true, data: user})
        })
        .delete(async (req,res)=>{
            let id = req.params.id
            let user = await UserController.delete(id)
            if(!user) return res.json({success: false, msg: "user not found"})
            res.json({success: true})
        })

    router.route('/')
        .get(async (req,res)=>{
            let users = await UserController.queryByFields({})
            res.json(users)
        })
        .post(async (req,res)=>{
            let data = req.body                                    
            let result = await UserController.create(data)            
            res.json(result)

        })

    app.use('/user', router)
}