"use strict";
const shortid = require('shortid')
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
            if(food){
                let area = await AreaModel.findOne(food.idArea)
                if(area)
                    food.areaName = area.name
            }        
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
        let {limit, skip, filter,sort, search} = query
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

        let items = await FoodModel.getMany(limit, skip, sortOption, filter, search)        
        if(items.length>0){
            for(let i=0; i<items.length; i++){
                let area = await AreaModel.findOne(items[i].idArea)
                if(area)
                    items[i].areaName = area.name
            }
        }
        let totalCount = await FoodModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        FoodModel.count(filter)
    },

    deleteIngredient: async (idFood, idIngredient)=>{
        try {
            let result = await FoodModel.removeItem(idFood, {ingredient:{idIngredient}})            
            return result
        }catch (error) {
            return {err: error}
        }
    },
    updateIngredient: async (idFood, idIngredient, data)=>{
        try {
            let filter = {_id: idFood, "ingredient.idIngredient": idIngredient}            
            data.idIngredient = idIngredient
            let newData = {"ingredient.$": data}            
            let result = await FoodModel.updateItem(filter, newData)                        
            return result
        } catch (error) {            
            return {err: error}
        }
    },
    pushIngredient: async (_id, data)=>{
        try {           
            data.map(item => item.idIngredient = shortid.generate()) 
            let result = await FoodModel.pushItem(_id, {ingredient: { $each: data}})            
            return result
        } catch (error) {
            return {err: error}
        }
    }
}

module.exports = Food;