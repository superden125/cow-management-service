const express = require('express')
const AreaController = require('../controller/area')


const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let area = await AreaController.findById(id)        
        if(!area) return res.json({status: false, msg: "area not found"})            
        res.json({status: true, data: area})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let area = await AreaController.updateOne(id,data)
        if(area.err) return res.json({status: false, msg: "something wrong"})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let area = await AreaController.deleteById(id)
        if(!area) return res.json({status: false, msg: "area not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {
            let query = req.query
            query.limit = query.limit ? query.limit : query.take
            delete query.take        
            let areas = await AreaController.getMany(query)
            res.json({status: true, data: areas})
        } catch (error) {
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(async (req,res)=>{
        let data = req.body                                    
        let result = await AreaController.insertOne(data)        
        if(result.err) return res.json({status: false}) 
        return res.json({status: true, data: result})

    })



 module.exports = router