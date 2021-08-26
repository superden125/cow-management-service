const express = require('express')
const CowBreedController = require('../controller/cowBreed')
const {isManager} = require('../middleware/auth')

const router = express.Router()

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let cowBreed = await CowBreedController.findById(id)        
        if(cowBreed.err) return res.json({status: false, message: "cowBreed not found"})            
        res.json({status: true, data: cowBreed})
    })
    .put(isManager,async (req,res)=>{
        let id = req.params.id
        let data = req.body
        // let cowBreed = await CowBreedController.updateOne(id,data)
        let cowBreed = await CowBreedController.updateCowBreedAndPeriods(id,data)
        if(cowBreed.err) return res.json({status: false, message: cowBreed.err})
        res.json({status: true})
    })
    .delete(isManager,async (req,res)=>{
        let id = req.params.id
        let cowBreed = await CowBreedController.deleteCowBreed(id)
        if(!cowBreed) return res.json({status: false, message: "cowBreed not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {
            let query = req.query
            // query.limit = query.limit ? query.limit : query.take
            // delete query.take     
            let cowBreeds = await CowBreedController.getMany(query)
            res.json({status: true, data: cowBreeds})
        } catch (error) {
            console.log("dee", error)
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(isManager, async (req,res)=>{
        try {
            let data = req.body                                    
            // let result = await CowBreedController.insertOne(data)        
            let result = await CowBreedController.insertCowBreedAndPeriods(data)        
            if(result.err) return res.json({status: false, message: result.err}) 
            return res.json({status: true, data: result})
        } catch (error) {
            return {status: false, message: "insert cow breed fail"}
        }

    })



 module.exports = router