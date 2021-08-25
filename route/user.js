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
        if(result.err) return res.json({status: false, message: result.err})
        return res.json({status: true, data: result})
    })

router.route('/info')
    .get(async (req,res)=>{
        let user = req.session.user
        let result = await UserController.findById(user._id)        
        if(!result || result.err) return res.json({status: false, message: "user not found"})            
        res.json({status: true, data: result})
    })    
router.route('/update')
    .put(async (req,res)=>{
        let user = req.session.user
        let data = req.body
        let result = await UserController.updateOne(user._id, data)
        if(result.err) return res.json({status: false, message: result.err})
        res.json({status: true})
    })

router.route('/getAllBreeder')
    .get(isManager, async (req,res)=>{
        try {
            let user = req.session.user        
            let query = req.query
            query.limit = query.limit ? query.limit : query.take
            delete query.take
            query.filter = query.filter ? query.filter: {}
            query.filter.idManager = user._id            
            let users = await UserController.getMany(query)
            res.json({status: true, data: users})
        } catch (error) {
            console.log("err",error)
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })

router.route('/search')
    .get(isManager, async (req,res)=>{
        try {            
            let {s} = req.query
            let result = await UserController.search(s)
            res.json({status: true, data: result})
        } catch (error) {
            console.log("ers",error)
            res.json({status: false})
        }
    })

router.route('/:id')
    .get(isManager, async (req,res)=>{
        let user = req.session.user
        let id = req.params.id
        let result = await UserController.queryByFields({idManager: user._id, _id: id})
        if(result.err || result.length == 0) return res.json({status: false, message: "user not found"})
        res.json({status: true, data: result[0]})
    })
    .put(isManager, async (req,res)=>{
        let user = req.session.user
        let id = req.params.id        
        let data = req.body
        
        let result = await UserController.updateBreeder(user._id, id, data)
        console.log("upate", result)
        if(result.err) return res.json({status: false, message: result.err})
        res.json({status: true})
    })
    .delete(isManager, async (req,res)=>{
        let id = req.params.id
        let user = await UserController.deleteBreeder(id)        
        if(user.err) return res.json({status: false, message: user.err})
        res.json({status: true})
    })

 module.exports = router