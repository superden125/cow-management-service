const express = require('express')
const CowController = require('../controller/cow')
const CowModel = require('../model/cowModel')


const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{        
        let id = req.params.id
        let cow = await CowController.findById(id)        
        if(!cow) return res.status(400).json({status: false, message: "cow not found"})            
        res.json({status: true, data: cow})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let cow = await CowController.updateOne(id,data)
        if(cow.err) return res.status(400).json({status: false, message: cow.err})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let cow = await CowController.deleteById(id)
        if(!cow) return res.status(400).json({status: false, message: "cow not found"})
        res.json({status: true})
    })

router.route('/:idCow/weight/:week')
    .put(async (req,res)=>{
        let {idCow, week} = req.params
        let {weight} = req.body
        if(!weight) return res.status(400).json({status: false, message: "weight invalid"})
        
        let result = await CowController.updateWeight(idCow,week, {weight})
        if(!result || result.err) return res.status(400).json({status: false})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let {idCow, week} = req.params
        let result = await CowController.deleteWeight(idCow,week)
        if(!result || result.err) return res.status(400).json({status: false})
        res.json({status: true})
    })

router.route('/:idCow/weight')
    .get(async (req,res)=>{
        let {idCow} = req.params
        let result = await CowModel.findOne(idCow)
        if(!result) return res.status(400).json({status: false, message: "cow not found"})        
        res.json({status: true, data: result.weight})
    })
    .post(async (req,res)=>{
        let {idCow} = req.params
        let data = req.body
        let result = await CowController.pushWeight(idCow, data)
        if(!result || result.err) return res.status(400).json({status: false})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{        
        let query = req.query        
        query.filter = query.filter ? JSON.parse(query.filter): {} 
        let cows = await CowController.getMany(query)
        if(cows.err) return res.status(400).json({status: false, message: cows.err})
        res.json({status: true, data: cows})        
    })
    .post(async (req,res)=>{
        let data = req.body                                    
        let result = await CowController.insertOne(data)
        if(result.err) return res.status(400).json({status: false, message: result.err})        
        return res.json({status: true, data: result})
    })



 module.exports = router