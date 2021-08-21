const express = require('express')
const FoodController = require('../controller/food')


const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let food = await FoodController.findById(id)        
        if(!food) return res.json({status: false, message: "food not found"})            
        res.json({status: true, data: food})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let food = await FoodController.updateOne(id,data)
        if(food.err) return res.json({status: false, message: food.err})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let food = await FoodController.deleteById(id)
        if(!food) return res.json({status: false, message: "food not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {
            let query = req.query
            query.limit = query.limit ? query.limit : query.take
            delete query.take        
            let foods = await FoodController.getMany(query)
            res.json({status: true, data: foods})
        } catch (error) {
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(async (req,res)=>{
        let data = req.body                                    
        let result = await FoodController.insertOne(data)        
        if(result.err) return res.json({status: false, message: result.err}) 
        return res.json({status: true, data: result})

    })

 module.exports = router