const express = require('express')
const { restart } = require('nodemon')
const PeriodController = require('../controller/period')
const {isManager} = require('../middleware/auth')

const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{        
        let id = req.params.id
        let period = await PeriodController.findById(id)        
        if(!period) return res.status(400).json({status: false, message: "period not found"})            
        res.json({status: true, data: period})
    })
    .put(isManager, async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let period = await PeriodController.updateOne(id,data)
        if(period.err) return res.status(400).json({status: false, message: period.err})
        res.json({status: true})
    })
    .delete(isManager, async (req,res)=>{
        let id = req.params.id
        let period = await PeriodController.deleteById(id)
        if(!period) return res.status(400).json({status: false, message: "period not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{        
        let query = req.query        
        query.filter = query.filter ? JSON.parse(query.filter): {}  
        let periods = await PeriodController.getMany(query)
        if(periods.err) return res.status(400).json({status: false, message: periods.err})
        res.json({status: true, data: periods})        
    })
    .post(isManager, async (req,res)=>{        
        let data = req.body                                    
        let result = await PeriodController.insertOne(data)        
        if(result.err) return res.status(400).json({status: false, message: result.err}) 
        return res.json({status: true, data: result})
    })

//chua lam nutrition
router.route('/:idPeriod/nutrition')
    .post(async (req,res)=>{        
        let {idPeriod} = req.params
        let data = req.body
        let result = await PeriodController.pushNutrition(idPeriod, data)
        if(!result || result.err) return res.status(400).json({status: false})
        res.json({status: true})
    })

router.route('/:idPeriod/nutrition/:idNutrition')
    .put(async (req,res)=>{
        let {idPeriod, idNutrition} = req.params
        let data = req.body
        if(!data.amount) return res.status(400).json({status: false, message: "amount invalid"})
        
        let result = await PeriodController.updateNutrition(idPeriod,idNutrition, data)
        if(!result || result.err) return res.status(400).json({status: false})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let {idPeriod, idNutrition} = req.params
        let result = await PeriodController.deleteNutrition(idPeriod,idNutrition)
        if(!result || result.err) return res.status(400).json({status: false})
        res.json({status: true})
    })

router.route('/:idPeriod/food')
    .post(async (req,res)=>{
        let {idPeriod} = req.params
        let data = req.body

        let result = await PeriodController.pushFood(idPeriod, data)
        if(!result || result.err) return res.status(400).json({status: false})
        res.json({status: true})
    })

 module.exports = router