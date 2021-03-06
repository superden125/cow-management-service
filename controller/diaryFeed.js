"use strict";
const DiaryFeedModel = require('../model/diaryFeedModel')
const CowModel = require('../model/cowModel')
const FoodModel = require('../model/foodModel')
const UserModel = require('../model/userModel')
const MealModel = require('../model/mealModel')
const CowController = require('./cow');
const PeriodModel = require('../model/periodModel');
const GroupCowModel = require('../model/groupCowModel');

const { compareNutrition, calcNutrition } = require('../lib/nutrition');
const { convertArrayToObject } = require('../lib/utils');

const DiaryFeed = {
    insertOne: async (data)=>{
        try {
            data.isCorrect = true
            let listFoods = []
            //check cow
            if(!data.idCow) return {err: "idCow null"}
            // let cow = await CowModel.findOne(data.idCow)
            let cow = await CowController.findById(data.idCow)
            if(!cow) return {err: "cow not found"}

            //check foods
            if(!data.foods || Array.isArray(data.foods)==false)
                return {err: "list foods invalid"}                            
            
            let i = 0
            while(i<data.foods.length){

                if(!data.foods[i].idFood) return {err: `idFood null at ${i}`}            
                if(!data.foods[i].amount) return {err: `amount null at ${i}`}

                data.foods[i].amount = parseFloat(data.foods[i].amount) 
                console.log("data", data.foods[i])               
                if(Number.isNaN(data.foods[i].amount)==true || data.foods[i].amount <= 0)
                    return {err: `amount must > 0 at ${i}`}

                let food = await FoodModel.findOne(data.foods[i].idFood)
                if(!food) return {err: `food not found at ${i}`}
                food.amount = data.foods[i].amount
                listFoods.push(food)
                i++
            }            
            //check dairy food correct here            
            // let meals = await MealModel.queryByFields({ idArea : data.idArea, idPeriod : cow.currentPeriodId})            
            // if(meals.length == 0 || meals.err) data.isCorrect = false
            // else {
            //     let arr1 = meals[0].foods.sort( (a,b)=> a.idFood < b.idFood ? 1 : -1)
            //     let arr2 = data.foods.sort( (a,b) => a.idFood < b.idFood ? 1 : -1)                
            //     if(JSON.stringify(arr1)!=JSON.stringify(arr2)) data.isCorrect = false
            // }                      
            
            //new check correct diary feed
            let period = await PeriodModel.findOne(cow.currentPeriodId)
            if(period){
                let periodNutrition = convertArrayToObject(period.nutrition)
                let foodNutrition = calcNutrition(listFoods)
                console.log("food nutri", foodNutrition)
                console.log("period nutri", periodNutrition)
                let result = compareNutrition(foodNutrition, periodNutrition)
                data.isCorrect = result
            }else{
                data.idCorrect = false
            }
            
            delete data.idArea
            //insert db
            let diaryFeed = await DiaryFeedModel.insertOne(data)
            if(diaryFeed.insertedId){                
                return data
            }else{
                return {err: diaryFeed}
            }
        } catch (error) {
            console.log("error", error)
            return {err: error}
        }
    },

    insertMany: async (data)=>{
        try {

            if(!data.idGroupCow) return {err: "group cow invalid"}
            let groupCow = await GroupCowModel.findOne(data.idGroupCow)
            if(!groupCow || groupCow.err) return {err: "group cow not found"}
            let cows = await CowModel.queryByFields({idGroupCow: data.idGroupCow})
            if(cows.length == 0 || cows.err) return {err: "group empty cow"}

            //check foods            
            if(!data.foods || Array.isArray(data.foods)==false)
            return {err: "list foods invalid"} 
            let listFoods = []
            let i = 0
            while(i<data.foods.length){

                if(!data.foods[i].idFood) return {err: `idFood null at ${i}`}            
                if(!data.foods[i].amount) return {err: `amount null at ${i}`}

                data.foods[i].amount = parseFloat(data.foods[i].amount) 
                // console.log("data", data.foods[i])               
                if(Number.isNaN(data.foods[i].amount)==true || data.foods[i].amount <= 0)
                    return {err: `amount must > 0 at ${i}`}

                let food = await FoodModel.findOne(data.foods[i].idFood)
                if(!food) return {err: `food not found at ${i}`}
                food.amount = data.foods[i].amount
                listFoods.push(food)
                i++
            }
            
            let countSuccess = 0
            for(let i = 0; i < cows.length; i++){
                let meal = {
                    idCow: cows[i]._id,
                    foods: data.foods,                    
                    isCorrect: true
                }
                
                let cow = await CowController.findById(cows[i]._id)
                if(!cow) return {err: "cow not found"}
                console.log("cow", cow)
                //new check correct diary feed
                let period = await PeriodModel.findOne(cow.currentPeriodId)
                console.log("period", period)
                if(period){
                    let periodNutrition = convertArrayToObject(period.nutrition)
                    console.log("period nutrition", periodNutrition)
                    let foodNutrition = calcNutrition(listFoods)
                    console.log("food nutri", foodNutrition)
                    console.log("period nutri", periodNutrition)
                    let result = compareNutrition(foodNutrition, periodNutrition)
                    meal.isCorrect = result
                }else{
                    meal.isCorrect = false
                }
                
                // delete meal.idArea
                //insert db
                let diaryFeed = await DiaryFeedModel.insertOne(meal)
                if(diaryFeed.insertedId){
                    countSuccess++
                }else{
                    return {err: diaryFeed}
                }
            }
            return {totalSuccess: countSuccess}
        } catch (error) {
            console.log("error", error)
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
            let {limit, skip, filter, sort, from, to, group, search} = query
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
            
            if(filter.idManager){
                // let cows = await CowModel.getMany(999,0,{},{idUser:filter.idUser})
                let filterUser = {idManager: filter.idManager}
                if(search){
                    let re = new RegExp(search,'i')
                    Object.assign(filterUser,{$or: [{ username: { $regex: re } },  { name: { $regex: re }}, { email: { $regex: re }} ] })
                }
                
                let users = await UserModel.queryByFields(filterUser)
                console.log("users", users)
                if(users.length > 0){
                    let userIds = users.map(user => user._id)                    
                    let cows = await CowModel.queryByFields({idUser : { $in : userIds}})                    
                    let cowIds = cows.map(cow => cow._id)                    
                    Object.assign(filter, {idCow: { $in: cowIds }})
                    // for(let i=0; i<users.length; i++){
                    //     let cows = await CowModel.queryByFields({idUser:users[i]._id})
                    //     console.log("cows", cows)
                    //     if(cows.length>0){
                    //         let cowsId = []
                    //         cows.forEach((cow)=>{
                    //             cowsId.push(cow._id)
                    //         })
                    //         Object.assign(filter, {idCow: { $in: cowsId }})
                    //     }else{
                    //         return []
                    //     }
                    // }                    
                }else{
                    return []
                }                
            }
            
            if(!filter.idManager && filter.idUser){
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

            if(filter.idGroupCow){                
                let cows = await CowModel.queryByFields({idGroupCow: filter.idGroupCow})
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
            delete filter.idManager
            delete filter.idGroupCow
            let items = []
            console.log("group", group)
            if(group == "breeder"){
                items = await DiaryFeedModel.getMany(limit, skip, sortOption, filter, true)
            }else{
                items = await DiaryFeedModel.getMany(limit, skip, sortOption, filter)  
            }
            
            // if(items.length>0){
            //     for(let i=0; i<items.length; i++){                    
            //         for(let j=0; j<items[i].foods.length; j++){
            //             let food = await FoodModel.findOne(items[i].foods[j].idFood)                        
            //             if(food && !food.err){
            //                 items[i].foods[j].name = food.name
            //                 items[i].foods[j].unit = food.unit
            //             } 
            //         }                    
            //     }
            // }

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