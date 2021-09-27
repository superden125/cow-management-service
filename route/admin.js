const express = require('express')
const shortid = require('shortid')
const UserController = require('../controller/user')
const {isAdmin} = require('../middleware/auth')

const router = express.Router()

router.use(isAdmin)

router.route('/user/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let user = await UserController.findById(id)        
        if(!user || user.err) return res.status(400).json({status: false, message: "user not found"})            
        res.json({status: true, data: user})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let user = await UserController.updateOne(id,data)
        if(user.err) return res.status(400).json({status: false, message: user.err})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let user = await UserController.deleteById(id)
        if(!user) return res.status(400).json({status: false, message: "user not found"})
        res.json({status: true})
    })

router.route('/user')
    .get(async (req,res)=>{        
        let query = req.query        
        query.filter = query.filter ? JSON.parse(query.filter): {}  
        let users = await UserController.getMany(query)
        if(users.err) return res.status(400).json({status: false, message: users.err})
        res.json({status: true, data: users})        
    })
    .post(async (req,res)=>{
        let data = req.body
        let roleTemplate = ['manager', 'breeder']
        if(!data.role || roleTemplate.indexOf(data.role) == -1) return res.status(400).json({status: false, message: "invalid role"})
        let result = await UserController.insertOne(data)
        if(result.err) return res.status(400).json({status: false, message: result.err})
        res.json({status: true, data: result})
    })

router.route('/user/:idUser/resetPassword')
    .put(async (req,res)=>{
        let idUser = req.params.idUser        
        let newPassword = shortid.generate()
        let result = await UserController.changePassword(idUser, newPassword)        
        if(result.err) return res.json({status: false, message: result.err})
        res.json({status: true, data: newPassword})
    })

 module.exports = router