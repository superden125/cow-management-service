const express = require('express')
const GroupCowController = require('../controller/groupCow')

const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let groupCow = await GroupCowController.findById(id)        
        if(!groupCow) return res.status(400).json({status: false, message: "groupCow not found"})            
        res.json({status: true, data: groupCow})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let groupCow = await GroupCowController.updateOne(id,data)
        if(groupCow.err) return res.status(400).json({status: false, message: groupCow.err})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let { deleteCow } = req.body
        let groupCow = await GroupCowController.deleteById(id, deleteCow)
        if(!groupCow) return res.status(400).json({status: false, message: "groupCow not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{        
        let query = req.query    
        query.filter = query.filter ? JSON.parse(query.filter): {}  
        let groupCows = await GroupCowController.getMany(query)
        if(groupCows.err) return res.status(400).json({status: false, message: groupCows.err})        
        res.json({status: true, data: groupCows})        
    })
    .post(async (req,res)=>{
        let data = req.body               
        let result = await GroupCowController.insertOne(data)        
        if(result.err) return res.status(400).json({status: false}) 
        return res.json({status: true, data: result})
    })



 module.exports = router