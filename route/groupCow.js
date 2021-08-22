const express = require('express')
const GroupCowController = require('../controller/groupCow')

const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let groupCow = await GroupCowController.findById(id)        
        if(!groupCow) return res.json({status: false, message: "groupCow not found"})            
        res.json({status: true, data: groupCow})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let groupCow = await GroupCowController.updateOne(id,data)
        if(groupCow.err) return res.json({status: false, message: groupCow.err})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let groupCow = await GroupCowController.deleteById(id)
        if(!groupCow) return res.json({status: false, message: "groupCow not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {
            let query = req.query
            query.limit = query.limit ? query.limit : query.take
            delete query.take        
            let groupCows = await GroupCowController.getMany(query)
            res.json({status: true, data: groupCows})
        } catch (error) {
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(async (req,res)=>{
        let data = req.body                                    
        let result = await GroupCowController.insertOne(data)        
        if(result.err) return res.json({status: false}) 
        return res.json({status: true, data: result})

    })



 module.exports = router