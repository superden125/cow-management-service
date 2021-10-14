"use strict";
const shortid = require('shortid')
const PeriodModel = require('../model/periodModel')
const CowBreedModel = require('../model/cowBreedModel')
const FoodModel = require('../model/foodModel')

const Period = {
    insertOne: async (data)=>{
        try {
            console.log("data", data)
            //check cow breed
            if(!data.idCowBreed) return {err: "idCowBreed null"}
            let cowBreed = await CowBreedModel.findOne(data.idCowBreed)
            if(!cowBreed) return {err: "cow breed not found"}

            //check serial, startDay, weight,name
            if(!data.name) return {err: "name null"}
            if(!data.serial) return {err: "serial null"}
            if(!data.startDay) return {err: "startDay null"}
            if(!data.endDay) return {err: "endDay null"}
            if(!data.weight) return {err: "weight null"}

            //serial > 0
            data.serial = parseInt(data.serial)
            if(Number.isInteger(data.serial)==false|| data.serial <= 0)
                return {err: "serial must > 0"}
            
            //weight > 0
            data.weight = parseFloat(data.weight)
            if(Number.isInteger(data.weight)==false|| data.weight <= 0)
                return {err: "weight must > 0"}
            
            //check startDay
            data.startDay = parseFloat(data.startDay)
            if(Number.isInteger(data.startDay)==false|| data.startDay <= 0)
                return {err: "startDay must > 0"}

            //check endDay
            data.endDay = parseFloat(data.endDay)
            if(Number.isInteger(data.endDay)==false|| data.endDay <= 0)
                return {err: "endDay must > 0"}
            if(data.endDay <= data.startDay ) return {err: "endDay must greater than startDay"}
            

            //check foods
            // if(!data.foods || Array.isArray(data.foods)==false)
            //     return {err: "list foods invalid"}
            
            // let i = 0
            // while(i<data.foods.length){

            //     if(!data.foods[i].idFood) return {err: `idFood null at ${i}`}            
            //     if(!data.foods[i].amount) return {err: `amount null at ${i}`}

            //     data.foods[i].amount = parseInt(data.foods[i].amount)                
            //     if(Number.isInteger(data.foods[i].amount)==false || data.foods[i].amount <= 0)
            //         return {err: `amount must > 0 at ${i}`}

            //     let food = await FoodModel.findOne(data.foods[i].idFood)
            //     if(!food) return {err: `food not found at ${i}`}
            //     i++
            // }

            if(data.nutrition && data.nutrition.length > 0){
                data.nutrition.map(item => item.idNutrition = shortid.generate())
            }

            delete data.foods

            let period = await PeriodModel.insertOne(data)
            if(period.insertedId){                
                return data
            }else{
                return {err: period}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let period = await PeriodModel.findOne(id)
            //disable foods
            // if(period.foods && period.foods.length > 0){
            //     for(let i = 0; i < period.foods.length; i++){
            //         let food = await FoodModel.findOne(period.foods[i].idFood)
            //         if(food){
            //             period.foods[i].name = food.name
            //             period.foods[i].unit = food.unit
            //         }
            //     }
            // }
            return period
        } catch (error) {
            return {err: error}
        }
    },
    deleteById: (id)=>{
        return PeriodModel.deleteOne(id)
    },
    updateOne: async (id,data)=>{
        try {

            //check cow breed
            if(data.idCowBreed){
                let cowBreed = await CowBreedModel.findOne(data.idCowBreed)
                if(!cowBreed) return {err: "cow breed not found"}
            }            

            //serial > 0
            if(data.serial){
                data.serial = parseInt(data.serial)
                if(Number.isInteger(data.serial)==false|| data.serial <= 0)
                    return {err: "serial must > 0"}
            }           
            
            //weight > 0
            if(data.weight){
                data.weight = parseFloat(data.weight)
                if(Number.isInteger(data.weight)==false|| data.weight <= 0)
                    return {err: "weight must > 0"}
            }           
            
            //check startDay
            if(data.startDay){
                data.startDay = parseFloat(data.startDay)
                if(Number.isInteger(data.startDay)==false|| data.startDay <= 0)
                    return {err: "startDay must > 0"}
            }

            //endDay
            if(data.endDay){
                data.endDay = parseFloat(data.endDay)
                if(Number.isInteger(data.endDay)==false|| data.endDay <= 0)
                    return {err: "endDay must > 0"}
            }
            if(data.endDay <= data.startDay) return {err: "endDay must greater than startDay"}


            //check foods
            // if(data.foods && Array.isArray(data.foods)==true){
            //     let i = 0
            //     while(i<data.foods.length){

            //         if(!data.foods[i].idFood) return {err: `idFood null at ${i}`}
            //         if(!data.foods[i].amount) return {err: `amount null at ${i}`}
            //         data.foods[i].amount = parseFloat(data.foods[i].amount)                    
            //         // if(Number.isInteger(data.foods[i].amount)==false || data.foods[i].amount <= 0)
            //         //     return {err: `amount must > 0 at ${i}`}
            //         if(isNaN(data.foods[i].amount) || data.foods[i].amount <= 0)
            //             return {err: `amount must > 0 at ${i}`}
                        
            //         let food = await FoodModel.findOne(data.foods[i].idFood)
            //         if(!food) return {err: `food not found at ${i}`}
            //         i++
            //     }
            // }

            if(data.nutrition && data.nutrition.length > 0){
                data.nutrition.map(item => item.idNutrition = item.idNutrition ? item.idNutrition : shortid.generate())
            }

            delete data.foods

            let period = await PeriodModel.updateOne(id,data)            
            if(!period) return {err: "update false"}
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

            let items = await PeriodModel.getMany(limit, skip, sortOption, filter)
            console.log("items", items)

            //disable foods in period
            // if(items.length > 0){
            //     for(let i = 1; i < items.length; i++){
            //         let period = items[i]
            //         if(period.foods.length > 0){
            //             for(let j = 0; j < period.foods.length; j++){
            //                 let food = await FoodModel.findOne(period.foods[j].idFood)
            //                 if(food){
            //                     period.foods[j].name = food.name
            //                     period.foods[j].unit = food.unit
            //                 }
            //             }
            //         }
            //     }                
            // }

            let totalCount = await PeriodModel.count(filter)
            return {totalCount,items}
        } catch (error) {
            console.log("error", error)
            return {err: error}
        }
    },

    count: (filter) =>{
        PeriodModel.count(filter)
    },

    deleteFood: async (idPeriod, idFood)=>{
        try {
            let result = await PeriodModel.removeItem(idPeriod, {foods:{idFood}})            
            return result
        }catch (error) {
            return {err: error}
        }
    },
    updateFood: async (idPeriod, idFood, data)=>{
        try {
            let filter = {_id: idPeriod, "foods.idFood": idFood}
            let newData = {"foods.$.amount": data.amount}
            console.log("filter - data", filter, data)
            let result = await PeriodModel.updateItem(filter, newData)            
            return result
        } catch (error) {
            return {err: error}
        }
    },
    pushFood: async (_id, data)=>{
        try {
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
                    i++
                }
            }

            let result = await PeriodModel.pushItem(_id, {foods: { $each: data}})
            console.log("result", result)
            return result
        } catch (error) {
            return {err: error}
        }
    },
    deleteNutrition: async (idPeriod, idNutrition)=>{
        try {
            let result = await PeriodModel.removeItem(idPeriod, {nutrition:{idNutrition}})            
            return result
        }catch (error) {
            return {err: error}
        }
    },
    updateNutrition: async (idPeriod, idNutrition, data)=>{
        try {
            let filter = {_id: idPeriod, "nutrition.idNutrition": idNutrition}            
            data.idNutrition = idNutrition
            let newData = {"nutrition.$": data}            
            let result = await PeriodModel.updateItem(filter, newData)                        
            return result
        } catch (error) {            
            return {err: error}
        }
    },
    pushNutrition: async (_id, data)=>{
        try {           
            data.map(item => item.idNutrition = shortid.generate()) 
            let result = await PeriodModel.pushItem(_id, {nutrition: { $each: data}})            
            return result
        } catch (error) {
            console.log("error", error)
            return {err: error}
        }
    }
}

module.exports = Period;