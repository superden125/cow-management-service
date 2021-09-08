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
        try {
            let {limit, skip, filter, sort, from, to} = query
            let sortOption = {}
            skip = skip ? parseInt(skip) : 0

            limit = limit ?  parseInt(limit) : 10        
            if(limit > 100) limit = 100
            
            filter = filter ? filter : {}        
            if(!!from && !!to){
                from = new Date(`${from} 00:00`).getTime()
                to = new Date(`${to} 23:59`).getTime()            
                Object.assign(filter, {createdAt: { $gt : from , $lt : to }})         
            }
            
            if(filter.idUser){
                // let cows = await CowModel.getMany(999,0,{},{idUser:filter.idUser})
                let cows = await CowModel.queryByFields({idUser:filter.idUser})
                if(cows.length>0){
                    let cowsId = []
                    cows.forEach((cow)=>{
                        cowsId.push(cow._id)
                    })
                    Object.assign(filter, {idCow: { $in: cowsId }})
                }else{
                    return []
                }
                
            }
            
            if(sort){
                let s = sort.split(' ')[0]
                let v = sort.split(' ')[1]
                v = v == 'desc' ? -1 : 1            
                sortOption[s]=v
            }
            delete filter.idUser

            let items = await DiaryFeedModel.getMany(limit, skip, sortOption, filter)            
            if(items.length>0){
                for(let i=0; i<items.length; i++){                    
                    for(let j=0; j<items[i].foods.length; j++){
                        let food = await FoodModel.findOne(items[i].foods[j].idFood)                        
                        if(food && !food.err){
                            items[i].foods[j].name = food.name
                            items[i].foods[j].unit = food.unit
                        } 
                    }                    
                }
            }

            let totalCount = await DiaryFeedModel.count(filter)
            return {totalCount,items}
        } catch (error) {
            console.log("err",error)
            return {err: error}
        }
    },

    count: (filter) =>{
        DiaryFeedModel.count(filter)
    },
    
    deleteFood: async (idDiaryFeed, idFood)=>{
        try {
            let result = await DiaryFeedModel.removeItem(idDiaryFeed, {foods:{idFood}})            
            return result
        }catch (error) {
            return {err: error}
        }
    },

    updateFood: async (idDiaryFeed, idFood, data)=>{
        try {
            let filter = {_id: idDiaryFeed, "foods.idFood": idFood}
            let newData = {"foods.$.amount": data.amount}
            console.log("filter - data", filter, data)
            let result = await DiaryFeedModel.updateItem(filter, newData)            
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

            let result = await DiaryFeedModel.pushItem(_id, {foods: { $each: data}})
            console.log("result", result)
            return result
        } catch (error) {
            return {err: error}
        }
    }
}

module.exports = DiaryFeed;