"use strict";
const CowBreedModel = require('../model/cowBreedModel')
const PeriodModel = require('../model/periodModel')
const PeriodController = require('./period')

const CowBreed = {
    insertOne: async (data)=>{
        try {
            // //check null
            // if(!data.name) return {err: "name null"}
            // if(!data.farmingTime) return {err: "farmingTime null"}

            // //check farmingTime
            // data.farmingTime = parseInt(data.farmingTime)
            // if(Number.isInteger(data.farmingTime) == false)
            //     return {err: "farming time invalid"}

            //insert db
            let cowBreed = await CowBreedModel.insertOne(data)
            if(cowBreed.insertedId){                
                return data
            }else{
                return {err: cowBreed}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let cowBreed = await CowBreedModel.findOne(id)
            if(!cowBreed) return {err: "cow breed not found"}
            let periods = await PeriodModel.getMany(100,0,{serial:1},{idCowBreed:cowBreed._id})            
            if(periods.length>0) cowBreed.periods = periods
            return cowBreed
        } catch (error) {
            return {err: error}
        }
    },
    deleteById: (id)=>{
        return CowBreedModel.deleteOne(id)
    },
    updateOne: async (id,data)=>{
        try {
            // //check formingTime
            // if(data.farmingTime){
            //     data.farmingTime = parseInt(data.farmingTime)
            //     if(Number.isInteger(data.farmingTime) == false)
            //         return {err: "farming time invalid"}
            // }
            
            //update db
            let cowBreed = await CowBreedModel.updateOne(id,data)            
            if(!cowBreed) return {err: "update false"}
            return true
        } catch (error) {
            return {err: error}
        }
        
    },
    getMany: async (query)=>{
        try {
            let { limit, skip, filter, sort, search} = query
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

            let items = await CowBreedModel.getMany(limit, skip, sortOption, filter, search)
            if(items.length > 0){
                for(let i=0; i<items.length; i++) {
                    let periods = await PeriodModel.getMany(100,0,{serial:1},{idCowBreed:items[i]._id})
                    if(periods.length>0){
                        items[i].periods = periods
                    }
                    else{
                        items[i].periods = []
                    }
                }
            }
            let totalCount = await CowBreedModel.count(filter)
            return {totalCount,items}    
        } catch (error) {
            return {err: "error query data"}
        }
        
    },

    count: (filter) =>{
        CowBreedModel.count(filter)
    },
    
    insertCowBreedAndPeriods: async(data)=>{
        try {
            if(!data.name) return {err: "name not null"}
            if(!data.farmingTime || !Number.isInteger(parseInt(farmingTime)))
                return {err: "farmingTime invalid"}

            let periods = data.periods
            delete data.periods
            let cowBreed = await CowBreedModel.insertOne(data)
            if(!cowBreed.insertedId) return {err: cowBreed}
            if(periods.length > 0){
                for(let i = 0; i < periods.length; i++){
                    periods[i].idCowBreed = cowBreed.insertedId
                    // await PeriodModel.insertOne(periods[i])
                    let period =  await PeriodController.insertOne(periods[i])
                    if(period.err) return {err: period.err}
                }
            }
            return data
        } catch (error) {
            return {err: error}
        }
    },

    updateCowBreedAndPeriods: async(id, data)=>{
        try {

            if(data.farmingTime && !Number.isInteger(parseInt(farmingTime)))
                return {err: "farmingTime invalid"}

            let periods = data.periods
            delete data.periods
            let cowBreed = await CowBreedModel.updateOne(id,data)
            if(!cowBreed) return {err: "update cow breed fail"}
            if(periods.length > 0){
                for(let i = 0; i < periods.length; i++){   
                    delete periods[i].idCowBreed
                    // let period = await PeriodModel.updateOne(periods[i]._id,periods[i])
                    let period = await PeriodController.updateOne(periods[i]._id, periods[i])
                    if(!period) return {err: "update period fail"}
                }
            }
            return true
        } catch (error) {
            return {err: error}
        }
    },

    deleteCowBreed: async(id)=>{
        await PeriodModel.removeMany({idCowBreed:id})
        return CowBreedModel.deleteOne(id)
    },

    getNutrition: async(id)=>{
        try {
            let result = []
            let periods = await PeriodModel.queryByFields({idCowBreed: id})
            if(periods.length==0) return []            
            periods.forEach((period)=>{
                result.push({
                    _id: period._id,
                    name : period.name,
                    serial: period.serial,
                    nutrition: period.nutrition ? period.nutrition : []
                })
            })
            return result
        } catch (error) {
            console.log("err cowBreed getNutrition",error)
            return {err: error}
        }
        
    },

    getFood: async(id)=>{
        try {
            let result = []
            let periods = await PeriodModel.queryByFields({idCowBreed: id})
            if(periods.length==0) return []            
            periods.forEach((period)=>{
                result.push({
                    _id: period._id,
                    name : period.name,
                    serial: period.serial,
                    foods: period.foods ? period.foods : []
                })
            })
            return result
        } catch (error) {
            console.log("err cowBreed getFood",error)
            return {err: error}
        }
        
    }
}

module.exports = CowBreed;