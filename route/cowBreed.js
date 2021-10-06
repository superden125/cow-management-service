const express = require('express')
const fs = require('fs')
const CowBreedController = require('../controller/cowBreed')
const PeriodController = require('../controller/period')
const {isManager} = require('../middleware/auth')

const router = express.Router()


router.route('/:id/nutrition')
    .get(async (req,res)=>{        
        let id = req.params.id
        let nutrition = await CowBreedController.getNutrition(id)          
        if(nutrition.err) return res.status(400).json({status: false, message: "error get data"})
        res.json({status: true, data: nutrition})        
    })

router.route('/:id/food')
    .get(async (req,res)=>{        
        let id = req.params.id
        let result = await CowBreedController.getFood(id)         
        if(result.err) return res.status(400).json({status: false, message: "error get data"})
        
        
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=food.pdf');
        result.pipe(res);
        result.end();
        // res.json({status: true, data: result})        
    })

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let cowBreed = await CowBreedController.findById(id)        
        if(cowBreed.err) return res.status(400).json({status: false, message: "cowBreed not found"})            
        res.json({status: true, data: cowBreed})
    })
    .put(isManager,async (req,res)=>{
        let id = req.params.id
        let data = req.body
        // let cowBreed = await CowBreedController.updateOne(id,data)
        let cowBreed = await CowBreedController.updateCowBreedAndPeriods(id,data)
        if(cowBreed.err) return res.status(400).json({status: false, message: cowBreed.err})
        res.json({status: true})
    })
    .delete(isManager,async (req,res)=>{
        let id = req.params.id
        let cowBreed = await CowBreedController.deleteCowBreed(id)
        if(!cowBreed) return res.status(400).json({status: false, message: "cowBreed not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{        
        let query = req.query
        query.filter = query.filter ? JSON.parse(query.filter): {}
        let cowBreeds = await CowBreedController.getMany(query)
        if(cowBreeds.err) return res.status(400).json({status: false, message: cowBreeds.err})
        res.json({status: true, data: cowBreeds})
    })
    .post(isManager, async (req,res)=>{        
        let data = req.body            
        // let result = await CowBreedController.insertOne(data)      
        // query.filter = query.filter ? JSON.parse(query.filter): {}
        let result = await CowBreedController.insertCowBreedAndPeriods(data)        
        if(result.err) return res.status(400).json({status: false, message: result.err}) 
        return res.json({status: true, data: result})        
    })

 module.exports = router