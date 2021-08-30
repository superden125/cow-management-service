const express = require('express')
const AreaController = require('../controller/area')
const {isAdmin, isManager} = require('../middleware/auth')

const router = express.Router()    

router.use(isManager)

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let area = await AreaController.findById(id)        
        if(!area) return res.json({status: false, message: "area not found"})            
        res.json({status: true, data: area})
    })
    .put(isAdmin, async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let area = await AreaController.updateOne(id,data)
        if(area.err) return res.json({status: false, message: area.err})
        res.json({status: true})
    })
    .delete(isAdmin, async (req,res)=>{
        let id = req.params.id
        let area = await AreaController.deleteById(id)
        if(!area) return res.json({status: false, message: "area not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {
            let query = req.query
            // query.limit = query.limit ? query.limit : query.take
            // delete query.take       
            query.filter = query.filter ? JSON.parse(query.filter): {}  
            let areas = await AreaController.getMany(query)
            res.json({status: true, data: areas})
        } catch (error) {
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(isAdmin, async (req,res)=>{
        let data = req.body                                    
        let result = await AreaController.insertOne(data)        
        if(result.err) return res.json({status: false, message: result.err}) 
        return res.json({status: true, data: result})

    })



 module.exports = router