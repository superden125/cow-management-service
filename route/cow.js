const express = require('express')
const CowController = require('../controller/cow')


const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let cow = await CowController.findById(id)        
        if(!cow) return res.json({status: false, message: "cow not found"})            
        res.json({status: true, data: cow})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let cow = await CowController.updateOne(id,data)
        if(cow.err) return res.json({status: false, message: cow.err})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let cow = await CowController.deleteById(id)
        if(!cow) return res.json({status: false, message: "cow not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {
            let query = req.query
            // query.limit = query.limit ? query.limit : query.take
            // delete query.take        
            query.filter = query.filter ? JSON.parse(query.filter): {} 
            let cows = await CowController.getMany(query)
            res.json({status: true, data: cows})
        } catch (error) {
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(async (req,res)=>{
        let data = req.body                                    
        let result = await CowController.insertOne(data)
        if(result.err) return res.json({status: false, message: result.err})        
        return res.json({status: true, data: result})

    })



 module.exports = router