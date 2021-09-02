const express = require('express')
const PeriodController = require('../controller/period')
const {isManager} = require('../middleware/auth')

const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let period = await PeriodController.findById(id)        
        if(!period) return res.json({status: false, message: "period not found"})            
        res.json({status: true, data: period})
    })
    .put(isManager, async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let period = await PeriodController.updateOne(id,data)
        if(period.err) return res.json({status: false, message: period.err})
        res.json({status: true})
    })
    .delete(isManager, async (req,res)=>{
        let id = req.params.id
        let period = await PeriodController.deleteById(id)
        if(!period) return res.json({status: false, message: "period not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {
            let query = req.query
            // query.limit = query.limit ? query.limit : query.take
            // delete query.take       
            query.filter = query.filter ? JSON.parse(query.filter): {}  
            let periods = await PeriodController.getMany(query)
            res.json({status: true, data: periods})
        } catch (error) {
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(isManager, async (req,res)=>{
        let data = req.body                                    
        let result = await PeriodController.insertOne(data)        
        if(result.err) return res.json({status: false, message: result.err}) 
        return res.json({status: true, data: result})
    })


router.route('/:id/nutrition')
    .put(async (req,res)=>{
        try {
            let id = req.params.id
            let data = {}
            data.nutrition = req.body
            let period = await PeriodController.updateOne(id,data)
            if(period.err) return res.json({status: false, message: period.err})
            res.json({status: true})
        } catch (error) {
            console.log("err",error)
            res.json({status: false})
        }
    })

router.route('/:idPeriod/food/:idFood')
    .put(async (req,res)=>{
        let {idPeriod, idFood} = req.params
        let {amount} = req.body
        if(!amount) return res.json({status: false, message: "amount invalid"})
        
        let result = await PeriodController.updateFood(idPeriod,idFood, {amount})
        if(!result || result.err) return res.json({status: false})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let {idPeriod, idFood} = req.params
        let result = await PeriodController.deleteFood(idPeriod,idFood)
        if(!result || result.err) return res.json({status: false})
        res.json({status: true})
    })

router.route('/:idPeriod/food')
    .post(async (req,res)=>{
        let {idPeriod} = req.params
        let data = req.body

        let result = await PeriodController.pushFood(idPeriod, data)
        if(!result || result.err) return res.json({status: false})
        res.json({status: true})
    })

 module.exports = router