"use strict";
const FoodModel = require('../model/foodModel')
const AreaModel = require('../model/areaModel')
const Food = {
    insertOne: async (data)=>{
        try {        
            //check data
            if(!data.name) return {err: "name null"}
            if(!data.unit) return {err: "unit null"}

            if(!data.idArea) return {err: "idArea null"}
            let area = await AreaModel.findOne(data.idArea)
            if(!area) return {err: "idArea not found"}

            //insert db
            let food = await FoodModel.insertOne(data)
            if(food.insertedId){                
                return data
            }else{
                return {err: food}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let food = await FoodModel.findOne(id)            
            return food
        } catch (error) {
            return {err: error}
        }
    },
    deleteById: (id)=>{
        return FoodModel.deleteOne(id)
    },
    updateOne: async (id,data)=>{
        try {
            //check data            
            if(data.idArea){
                let area = await AreaModel.findOne(data.idArea)
                if(!area) return {err: "idArea not found"}
            }            

            //update db
            let food = await FoodModel.updateOne(id,data)            
            if(!food) return {err: "update false"}
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

        let items = await FoodModel.getMany(limit, skip, sortOption, filter)
        let totalCount = await FoodModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        FoodModel.count(filter)
    }    
}

module.exports = Food;