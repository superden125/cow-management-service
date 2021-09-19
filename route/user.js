const express = require('express')
const UserController = require('../controller/user')
const { isManager } = require('../middleware/auth')

const router = express.Router()


router.route('/')
    .post(isManager, async (req,res)=>{
        let user = req.session.user
        let data = req.body
        data.idManager = user._id
        let result = await UserController.insertOne(data)
        if(result.err) return res.status(400).json({status: false, message: result.err})
        return res.json({status: true, data: result})
    })

router.route('/info')
    .get(async (req,res)=>{
        let user = req.session.user
        let result = await UserController.findById(user._id)        
        if(!result || result.err) return res.status(400).json({status: false, message: "user not found"})            
        res.json({status: true, data: result})
    })    
router.route('/update')
    .put(async (req,res)=>{
        let user = req.session.user
        let data = req.body
        let result = await UserController.updateOne(user._id, data)
        if(result.err) return res.status(400).json({status: false, message: result.err})
        res.json({status: true})
    })

router.route('/getAllBreeder')
    .get(isManager, async (req,res)=>{        
        let user = req.session.user        
        let query = req.query            
        query.filter = query.filter ? JSON.parse(query.filter): {}
        query.filter.idManager = user._id
        query.filter.role = 'breeder'         
        let users = await UserController.getMany(query)
        if(users.err) return res.status(400).json({status: false, message: users.err})
        res.json({status: true, data: users})        
    })

router.route('/search')
    .get(isManager, async (req,res)=>{        
        let {s} = req.query
        let result = await UserController.search(s)
        if(result.err) return res.status(400).json({status: false, message: result.err})
        res.json({status: true, data: result})        
    })

router.route('/:id')
    .get(isManager, async (req,res)=>{
        let user = req.session.user
        let id = req.params.id
        let result = await UserController.queryByFields({idManager: user._id, _id: id})        
        if(result.err || result.length == 0) return res.status(400).json({status: false, message: "user not found"})
        res.json({status: true, data: result[0]})
    })
    .put(isManager, async (req,res)=>{
        let user = req.session.user
        let id = req.params.id        
        let data = req.body
        
        let result = await UserController.updateBreeder(user._id, id, data)        
        if(result.err) return res.status(400).json({status: false, message: result.err})
        res.json({status: true})
    })
    .delete(isManager, async (req,res)=>{
        let id = req.params.id
        let user = await UserController.deleteBreeder(id)        
        if(user.err) return res.status(400).json({status: false, message: user.err})
        res.json({status: true})
    })

 module.exports = router