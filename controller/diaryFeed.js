"use strict";
const DiaryFeedModel = require('../model/diaryFeedModel')
const CowModel = require('../model/cowModel')
const FoodModel = require('../model/foodModel')

const DiaryFeed = {
    insertOne: async (data)=>{
        try {        

            //check cow
            if(!data.idCow) return {err: "idCow null"}
            let cow = await CowModel.findOne(data.idCow)
            if(!cow) return {err: "cow not found"}

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

            //insert db
            let diaryFeed = await DiaryFeedModel.insertOne(data)
            if(diaryFeed.insertedId){                
                return data
            }else{
                return {err: diaryFeed}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let diaryFeed = await DiaryFeedModel.findOne(id)            
            return diaryFeed
        } catch (error) {
            return {err: error}
        }
    },
    deleteById: (id)=>{
        return DiaryFeedModel.deleteOne(id)
    },
    updateOne: async (id,data)=>{
        try {

            //check cow
            if(data.idCow){
                let cow = await CowModel.findOne(data.idCow)
                if(!cow) return {err: "cow not found"}
            }            

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

            //update db
            let diaryFeed = await DiaryFeedModel.updateOne(id,data)            
            if(!diaryFeed) return {err: "update false"}
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

        let items = await DiaryFeedModel.getMany(limit, skip, sortOption, filter)
        let totalCount = await DiaryFeedModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        DiaryFeedModel.count(filter)
    }    
}

module.exports = DiaryFeed;