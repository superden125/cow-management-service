const express = require('express')
const FoodController = require('../controller/food')
const {isManager} = require('../middleware/auth')

const router = express.Router()

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let food = await FoodController.findById(id)        
        if(!food) return res.json({status: false, message: "food not found"})            
        res.json({status: true, data: food})
    })
    .put(isManager, async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let food = await FoodController.updateOne(id,data)
        if(food.err) return res.json({status: false, message: food.err})
        res.json({status: true})
    })
    .delete(isManager, async (req,res)=>{
        let id = req.params.id
        let food = await FoodController.deleteById(id)
        if(!food) return res.json({status: false, message: "food not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {
            let user = req.session.user
            let query = req.query
            query.filter = query.filter ? JSON.parse(query.filter): {}
            if(user.role!='admin'){                 
                query.filter.idArea = user.idArea
            }            
            // query.limit = query.limit ? query.limit : query.take
            // delete query.take        
            let foods = await FoodController.getMany(query)
            res.json({status: true, data: foods})
        } catch (error) {
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(isManager, async (req,res)=>{
        let data = req.body
        let user = req.session.user
        
        if(user.role!='admin'){
            data.idArea = user.idArea
        }
        
        let result = await FoodController.insertOne(data)        
        if(result.err) return res.json({status: false, message: result.err}) 
        return res.json({status: true, data: result})

    })

router.route('/:idFood/ingredient/:idIngredient')
    .put(isManager, async (req,res)=>{
        let {idFood, idIngredient} = req.params
        let data = req.body
        // if(!data.amount) return res.json({status: false, message: "amount invalid"})
        
        let result = await FoodController.updateIngredient(idFood,idIngredient, data)
        if(!result || result.err) return res.json({status: false})
        res.json({status: true})
    })
    .delete(isManager, async (req,res)=>{
        let {idFood, idIngredient} = req.params
        let result = await FoodController.deleteIngredient(idFood,idIngredient)
        if(!result || result.err) return res.json({status: false})
        res.json({status: true})
    })

router.route('/:idFood/ingredient')
    .post(isManager, async (req,res)=>{
        let {idFood} = req.params
        let data = req.body

        let result = await FoodController.pushIngredient(idFood, data)
        if(!result || result.err) return res.json({status: false})
        res.json({status: true})
    })

 module.exports = router