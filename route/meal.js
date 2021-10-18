const express = require('express')
const MealController = require('../controller/meal')
const {isManager} = require('../middleware/auth')

const router = express.Router()    

router.use(isManager)

router.route('/file')
    .get(async (req,res)=>{        
        let query = req.query        
        query.filter = query.filter ? JSON.parse(query.filter): {}          
        let result = await MealController.printMeal(query.filter)
        if(result.err) return res.status(400).json({status: false, message: result.err})
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=food.pdf');
        result.pipe(res);
        result.end();
    })
    .post(async (req,res)=>{
        let data = req.body
        let result = await MealController.printMealClient(data)
        if(result.err) return res.status(400).json({status: false, message: result.err})
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=food.pdf');
        result.pipe(res);
        result.end();
    })

router.route('/create')
    .post(async (req,res)=>{
        let data = req.body        
        let result = await MealController.cerateMeal(data)
        if(result.err) return res.status(400).json({status: false, message: result.err})
        return res.json({status: true, data: result})
    })

router.route('/:id')
    .get(async (req,res)=>{        
        let id = req.params.id
        let meal = await MealController.getDetailById(id)         
        if(!meal) return res.status(400).json({status: false, message: "meal not found"})            
        res.json({status: true, data: meal})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let meal = await MealController.updateOne(id,data)
        if(meal.err) return res.status(400).json({status: false, message: meal.err})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let meal = await MealController.deleteById(id)
        if(!meal) return res.status(400).json({status: false, message: "meal not found"})
        res.json({status: true})
    })

router.route('/:idMeal/food/:idFood')
    .put(async (req,res)=>{
        let {idMeal, idFood} = req.params
        let {amount} = req.body
        if(!amount) return res.status(400).json({status: false, message: "amount invalid"})        
        let result = await MealController.updateFood(idMeal,idFood, {amount})
        if(!result || result.err) return res.status(400).json({status: false})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let {idMeal, idFood} = req.params
        let result = await MealController.deleteFood(idMeal,idFood)
        if(!result || result.err) return res.status().json({status: false})
        res.json({status: true})
    })

router.route('/:idMeal/food')
    .post(async (req,res)=>{
        let {idMeal} = req.params
        let data = req.body

        let result = await MealController.pushFood(idMeal, data)
        if(!result || result.err) return res.status(400).json({status: false})
        res.json({status: true})
    })

// router.route('/:id/file')
//     .get(async (req,res)=>{
//         let id = req.params.id
//     })

router.route('/')
    .get(async (req,res)=>{        
        let query = req.query        
        query.filter = query.filter ? JSON.parse(query.filter): {}          
        let meals = await MealController.getMany(query)
        if(meals.err) return res.status(400).json({status: false, message: meals.err})
        res.json({status: true, data: meals})        
    })    
    .post(async (req,res)=>{
        let data = req.body        
        let result = await MealController.insertOne(data)
        if(result.err) return res.status(400).json({status: false, message: result.err})
        return res.json({status: true, data: result})
    })



 module.exports = router