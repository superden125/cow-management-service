"use strict";
const MealModel = require('../model/mealModel')
const AreaModel = require('../model/areaModel')
const CowBreedModel = require('../model/cowBreedModel')
const PeriodModel = require('../model/periodModel')
const FoodModel = require('../model/foodModel')

const Meal = {
    insertOne: async (data)=>{
        try {
            if(!data.name) return {err: "name null"}
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
            if(!data.name) return {err: "name null"}
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
            console.log("data", data)
            if(!idArea) return {err: "idArea null"}  
            if(!idCowBreed && !idPeriod) return {err: "idCowBreed or idPeriod null"}        
            let filter = { idArea }
            if(idCowBreed){
                let periods = await PeriodModel.queryByFields({idCowBreed})
                if(periods.length == 0 || periods.err) return {err: "cow breed not found period"}            
                let periodsId = periods.map(period => period._id)
                filter.idPeriod = { $in : periodsId}
            }else{
                filter.idPeriod = idPeriod
            }
            console.log("filter", filter)
            let meal = await MealModel.getLaterMeal(filter)
            return meal
        } catch (error) {
            console.log("error", error)
            return {err: error}
        }
    },

    cerateMeal: async (data) =>{
        let {idArea, idCowBreed, idPeriod} = data
        if(!idArea) return {err: "idArea null"}  
        if(!idCowBreed && !idPeriod) return {err: "idCowBreed or idPeriod null"}

        let foods = await FoodModel.queryByFields({idArea})
        if(foods.length == 0) return {err: "area not have foods"}

        if(idCowBreed){
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
                    await MealModel.insertOne(doc)
                    doc.periodName = period.name                    
                    meals.push(doc)
                }                
            }
            return meals
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
    }
}

function calculateMeal(foods,nutrition){
    return [
        {idFood: "612267b8596319f4761a2bca", amount: 12},
        {idFood: "612267c5596319f4761a2bcb", amount: 50},
        {idFood: "612b45240af7eb272c8d9eda", amount: 23}
    ]    
}

module.exports = Meal;