"use strict";
const PeriodModel = require('../model/periodModel')
const CowBreedModel = require('../model/cowBreedModel')
const FoodModel = require('../model/foodModel')

const Period = {
    insertOne: async (data)=>{
        try {
            
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
            if(!data.foods || Array.isArray(data.foods)==false)
                return {err: "list foods invalid"}
            
            let i = 0
            while(i<data.foods.length){

                if(!data.foods[i].idFood) return {err: `idFood null at ${i}`}            
                if(!data.foods[i].amount) return {err: `amount null at ${i}`}

                data.foods[i].amount = parseInt(data.foods[i].amount)                
                if(Number.isInteger(data.foods[i].amount)==false || data.foods[i].amount <= 0)
                    return {err: `amount must > 0 at ${i}`}

                let food = await FoodModel.findOne(data.foods[i].idFood)
                if(!food) return {err: `food not found at ${i}`}
                i++
            }

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
            if(data.foods && Array.isArray(data.foods)==true){
                let i = 0
                while(i<data.foods.length){

                    if(!data.foods[i].idFood) return {err: `idFood null at ${i}`}
                    if(!data.foods[i].amount) return {err: `amount null at ${i}`}
                    data.foods[i].amount = parseInt(data.foods[i].amount)                    
                    if(Number.isInteger(data.foods[i].amount)==false || data.foods[i].amount <= 0)
                        return {err: `amount must > 0 at ${i}`}
                        
                    let food = await FoodModel.findOne(data.foods[i].idFood)
                    if(!food) return {err: `food not found at ${i}`}
                    i++
                }
            }

            let period = await PeriodModel.updateOne(id,data)            
            if(!period) return {err: "update false"}
            return true
        } catch (error) {
            return {err: error}
        }
        
    },
    getMany: async (query)=>{
        let {limit, skip, filter,sort} = query
        let sortOption = {}
        skip = skip ? parseInt(skip) : 0

        limit = limit ?  parseInt(limit) : 10        
        if(limit > 100) limit = 100

        filter = filter ? filter : {}
        console.log(sort)
        if(sort){
            let s = sort.split(' ')[0]
            let v = sort.split(' ')[1]
            v = v == 'desc' ? -1 : 1            
            sortOption[s]=v
        }

        let items = await PeriodModel.getMany(limit, skip, sortOption, filter)
        let totalCount = await PeriodModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        PeriodModel.count(filter)
    }    
}

module.exports = Period;