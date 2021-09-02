"use strict";
const dates = require('../lib/date')
const CowModel = require('../model/cowModel')
const UserModel = require('../model/userModel')
const CowBreedModel = require('../model/cowBreedModel')
const GroupCowModel = require('../model/groupCowModel')
const PeriodModel = require('../model/periodModel')

const Cow = {
    insertOne: async (data)=>{
        try {
            //check null
            if(!data.idUser) return {err: "idUser null"}
            if(!data.idCowBreed) return {err: "idCowBreed null"}
            if(!data.birthday) return {err: "birthday null"}
            
            //check user
            let user = await UserModel.findOne(data.idUser)
            if(!user) return {err: "user not found"}            

            //check cowBreed
            let cowBreed = await CowBreed.findOne(data.idCowBreed)
            if(!cowBreed) return {err: "cow breed not found"}

            //check group cow
            if(data.idGroupCow){
                let groupCow = await GroupCowModel.findOne(data.idGroupCow)
                if(!groupCow) return {err: "group cow not found"}
            }

            data.birthday = parseInt(data.birthday)
            if(Number.isInteger(data.birthday)==false)
                return {err: "birthday invalid"}            

            let cow = await CowModel.insertOne(data)
            if(cow.insertedId){                
                return data
            }else{
                return {err: cow}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let cow = await CowModel.findOne(id)
            if(cow){                
                let cowBreed = await CowBreedModel.findOne(cow.idCowBreed)
                cow.cowBreedName = cowBreed.name
                if(cow.idGroupCow){
                    let groupCow = await GroupCowModel.findOne(cow.idGroupCow)
                    cow.groupCowName = groupCow.name
                }
                cow.daysOld = dates.getDaysOld(cow.birthday)
                let currentPeriod = await PeriodModel.getMany(1,0,{endDay:1},{idCowBreed: cow.idCowBreed,startDay: {$gte: cow.daysOld}})
                
                if(currentPeriod[0]){
                    console.log("current period", currentPeriod)
                    cow.currentPeriodId = currentPeriod[0]._id
                    cow.currentPeriodName = currentPeriod[0].name
                }                    
            }
            return cow
        } catch (error) {
            console.log("eer",error)
            return {err: error}
        }
    },
    deleteById: (id)=>{
        return CowModel.deleteOne(id)
    },
    updateOne: async (id,data)=>{
        try {

            if(data.idUser){
                let user = await UserModel.findOne(data.idUser)
                if(!user) return {err: "user not found"}
            }

            if(data.idCowBreed){
                let cowBreed = await CowBreed.findOne(data.idCowBreed)
                if(!cowBreed) return {err: "cow breed not found"}
            }
            
            if(data.idGroupCow){
                let groupCow = await GroupCowModel.findOne(data.idGroupCow)
                if(!groupCow) return {err: "group cow not found"}
            }
            if(data.birthday){
                data.birthday = parseInt(data.birthday)
                if(Number.isInteger(data.birthday)==false)
                    return {err: "birthday invalid"}
            }            

            let cow = await CowModel.updateOne(id,data)            
            if(!cow) return {err: "update false"}
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
        
        if(sort){
            let s = sort.split(' ')[0]
            let v = sort.split(' ')[1]
            v = v == 'desc' ? -1 : 1            
            sortOption[s]=v
        }

        let items = await CowModel.getMany(limit, skip, sortOption, filter)
        let totalCount = await CowModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        CowModel.count(filter)
    },

    deleteWeight: async (idCow, week)=>{
        try {
            let result = await CowModel.removeItem(idCow, {weight:{week}})            
            return result
        }catch (error) {
            return {err: error}
        }
    },
    updateWeight: async (idCow, week, data)=>{
        try {
            let filter = {_id: idCow, "weight.week": week}
            let newData = {"weight.$.weight": data.weight}
            console.log("filter - data", filter, data)
            let result = await CowModel.updateItem(filter, newData)
            return result
        } catch (error) {
            return {err: error}
        }
    },
    pushWeight: async (_id, data)=>{
        try {
            data.map(item => item.createdAt = new Date().getTime())
            let result = await CowModel.pushItem(_id, {weight: { $each: data, $sort: {week: 1} }})
            console.log("result", result)
            return result
        } catch (error) {
            return {err: error}
        }
    }
}

module.exports = Cow;