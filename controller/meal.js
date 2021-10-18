"use strict";
const MealModel = require('../model/mealModel')
const AreaModel = require('../model/areaModel')
const CowBreedModel = require('../model/cowBreedModel')
const PeriodModel = require('../model/periodModel')
const FoodModel = require('../model/foodModel')
const {convertJsonToPDF} = require('../lib/utils')
const Meal = {
    insertOne: async (data)=>{
        try {
            if(!data.idArea) return {err: "idArea null"}
            if(!data.idPeriod) return {err: "idPeriod null"}
            if(!data.foods || !data.foods.length || data.foods.length == 0)
                return {err: "foods null"}

            let area = await AreaModel.findOne(data.idArea)
            if(!area || area.err) return {err: "idArea not found"}

            let period = await PeriodModel.findOne(data.idPeriod)
            if(!period || period.err) return {err: "idPeriod not found"}

            for(let i = 0; i < data.foods.length; i++){
                let food = await FoodModel.findOne(data.foods[i].idFood)                
                if(!food || food.err) return {err: "food not found"}
                if(food.idArea !== data.idArea) return {err: `food not in area ${area.name}`}
            }

            let meal = await MealModel.insertOne(data)
            if(meal.insertedId){                
                return data
            }else{
                return {err: meal}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let meal = await MealModel.findOne(id)                   
            return meal
        } catch (error) {
            return {err: error}
        }
    },
    deleteById: (id)=>{
        return MealModel.deleteOne(id)
    },
    updateOne: async (id,data)=>{
        try {
            
            if(!data.idArea) return {err: "idArea null"}
            if(!data.idPeriod) return {err: "idPeriod null"}
            if(!data.foods || !data.foods.length || data.foods.length == 0)
                return {err: "foods null"}

            let area = await AreaModel.findOne(data.idArea)
            if(!area || area.err) return {err: "idArea not found"}

            let period = await PeriodModel.findOne(data.idPeriod)
            if(!period || period.err) return {err: "idPeriod not found"}

            for(let i = 0; i < data.foods.length; i++){
                let food = await FoodModel.findOne(data.foods[i].idFood)                
                if(!food || food.err) return {err: "food not found"}
                if(food.idArea !== data.idArea) return {err: `food not in area ${area.name}`}
            }

            let meal = await MealModel.updateOne(id,data)            
            if(!meal) return {err: "update false"}
            return true
        } catch (error) {
            return {err: error}
        }
        
    },
    getMany: async (query)=>{
       try {
            let {limit, skip, filter,sort} = query            
            let sortOption = {}
            skip = skip ? parseInt(skip) : 0
            
            limit = limit ?  parseInt(limit) : 10        
            if(limit > 100) limit = 100

            filter = filter ? filter : {}
            
            if(sort){
                let s = sort.split(' ')[0]
                let v = sort.split(' ')[1]
                v = v == 'desc' ? -1 : 1            
                sortOption[s]=v
            }

            if(filter.idCowBreed){
                //let cowBreed = await CowBreedModel.findOne(filter.idCowBreed)
                // if(!cowBreed || cowBreed.err) return {err: "cow breed not found"}
                let periods = await PeriodModel.queryByFields({idCowBreed : filter.idCowBreed})
                if(periods.length == 0 || periods.err) return {err: "cow breed not found period"}            
                let periodsId = periods.map(period => period._id)
                filter.idPeriod = { $in : periodsId}
            }            
            delete filter.idCowBreed
            
            let items = await MealModel.getMany(limit, skip, sortOption, filter)
            let totalCount = await MealModel.count(filter)            
            return {totalCount,items}
       } catch (error) {
           console.log("error", error)
           return {err: error}
       }
    },

    count: (filter) =>{
        MealModel.count(filter)
    },
    
    getDetailById: async (id)=>{
        try {
            let result = await MealModel.getDetailMeal({_id: id})                        
            if(result.length == 0) return {err: "data not found"}
            let data = result[0]
            for( let i = 0; i < data.foods.length; i++){
                let food = data.foods[i]
                let dataFood = await FoodModel.findOne(food.idFood)
                if(dataFood){
                    food.name = dataFood.name
                }
            }
            return data
        } catch (error) {            
            return {err: error}
        }
    },

    printMeal: async (data) =>{
        try {
            let {idArea, idCowBreed, idPeriod} = data            
            if(!idArea) return {err: "idArea null"} 
            //only print with idCowBreed
            if(!idCowBreed) return {err: "idCowBreed null"}
            // if(!idCowBreed && !idPeriod) return {err: "idCowBreed or idPeriod null"}        
            let filter = { idArea }
            if(idCowBreed){
                let periods = await PeriodModel.queryByFields({idCowBreed})
                if(periods.length == 0 || periods.err) return {err: "cow breed not found period"}            
                let periodsId = periods.map(period => period._id)
                filter.idPeriod = { $in : periodsId}
            }else{
                filter.idPeriod = idPeriod
            }            
            let meal = await MealModel.getLaterMeal(filter)
            if(meal.length == 0) return {err: "meal not found"}
            let docs = {
                cowBreedName: meal[0].cowBreedName,
                areaName: meal[0].areaName,
                items: meal
            }
            let result = await convertJsonToPDF(docs, true)
            return result
        } catch (error) {            
            return {err: error}
        }
    },

    printMealClient: async (data) =>{
        try {            
            let result = await convertJsonToPDF(data, false)
            return result
        } catch (error) {            
            return {err: error}
        }
    },

    cerateMeal: async (data) =>{
        let {idArea, idCowBreed, idPeriod} = data
        if(!idArea) return {err: "idArea null"}  
        //only cow breed
        if(!idCowBreed) return {err: "idCowBreed null"}
        // if(!idCowBreed && !idPeriod) return {err: "idCowBreed or idPeriod null"}
        let area = await AreaModel.findOne(idArea)
        if(!area) return {err: "area not found"}
        let foods = await FoodModel.queryByFields({idArea})
        if(foods.length == 0) return {err: "area not have foods"}
        
        if(idCowBreed){
            let cowBreed = await CowBreedModel.findOne(idCowBreed)
            let periods = await PeriodModel.queryByFields({idCowBreed})
            if(periods.length == 0 || periods.err) return {err: "cow breed not found period"}
            let meals = []
            for(let i = 0; i < periods.length; i++){
                let period = periods[i]
                if(period.nutrition){
                    let meal = calculateMeal(foods,period.nutrition)
                    let doc = {
                        idArea: idArea,
                        idPeriod: period._id,
                        foods: meal
                    }                    
                    // await MealModel.insertOne(doc)
                    doc.periodName = period.name
                    doc.startDay = period.startDay
                    doc.endDay = period.endDay
                    doc.createdAt = Date.now()            
                    meals.push(doc)
                }                
            }
            return { 
                idCowBreed, 
                idArea,
                cowBreedName: cowBreed.name,
                areaName: area.name,
                items: meals
            }
        }else{
            let period = await PeriodModel.findOne(idPeriod)
            if(!period || period.err) return {err: "period not found"}            
            if(!period.nutrition) return {err: "period not have nutrition"}

            //function calculateMeal(foods,period.nutrition)
            let meal = calculateMeal(foods,period.nutrition)

            let doc = {
                idArea: idArea,
                idPeriod: idPeriod,
                foods: meal
            }
            await MealModel.insertOne(doc)
            return meal
        }
    },

    deleteFood: async (idMeal, idFood)=>{
        try {
            let result = await MealModel.removeItem(idMeal, {foods:{idFood}})            
            return result
        }catch (error) {
            return {err: error}
        }
    },

    updateFood: async (idMeal, idFood, data)=>{
        try {
            let filter = {_id: idMeal, "foods.idFood": idFood}
            let newData = {"foods.$.amount": data.amount}
            console.log("filter - data", filter, data)
            let result = await MealModel.updateItem(filter, newData)            
            return result
        } catch (error) {
            return {err: error}
        }
    },

    pushFood: async (_id, data)=>{
        try {
            let meal = await MealModel.findOne(_id)
            if(!meal) return {err: "meal not found"}
            //check foods
            if(Array.isArray(data)==true){
                let i = 0
                while(i<data.length){

                    if(!data[i].idFood) return {err: `idFood null at ${i}`}
                    if(!data[i].amount) return {err: `amount null at ${i}`}
                    data[i].amount = parseFloat(data[i].amount)                                   
                    if(isNaN(data[i].amount) || data[i].amount <= 0)
                        return {err: `amount must > 0 at ${i}`}
                        
                    let food = await FoodModel.findOne(data[i].idFood)                    
                    if(!food) return {err: `food not found at ${i}`}
                    if(food.idArea !== meal.idArea) return {err: "food not in area"}                    
                    i++
                }
            }

            let result = await MealModel.pushItem(_id, {foods: { $each: data}})
            console.log("result", result)
            return result
        } catch (error) {
            return {err: error}
        }
    }
}

function calculateMeal(foods,nutrition){
    return [
        {idFood: "612267b8596319f4761a2bca", name: "Đậu Xanh", "unit": "g", amount: 12},
        {idFood: "612267c5596319f4761a2bcb", name: "Cỏ mỹ", "unit": "g", amount: 50},
        {idFood: "612b45240af7eb272c8d9eda", name: "Khoai lang", "unit": "g", amount: 23}
    ]    
}

module.exports = Meal;