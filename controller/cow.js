"use strict";
const dateUtil = require('../lib/date')
const CowModel = require('../model/cowModel')
const UserModel = require('../model/userModel')
const CowBreedModel = require('../model/cowBreedModel')
const GroupCowModel = require('../model/groupCowModel')
const PeriodModel = require('../model/periodModel')
const  {formatDate} = require('../lib/date')

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
            let cowBreed = await CowBreedModel.findOne(data.idCowBreed)
            if(!cowBreed) return {err: "cow breed not found"}

            //check group cow
            if(data.idGroupCow){
                let groupCow = await GroupCowModel.findOne(data.idGroupCow)
                if(!groupCow) return {err: "group cow not found"}
            }

            // data.birthday = parseInt(data.birthday)
            data.birthday = new Date(data.birthday).getTime()
            if(Number.isInteger(data.birthday)==false)
                return {err: "birthday invalid"}            

            let cow = await CowModel.insertOne(data)
            if(cow.insertedId){                
                return data
            }else{
                return {err: cow}
            }
        } catch (error) {
            console.log("error insert cow", error)
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let cow = await CowModel.findOne(id)
            if(cow){
                //get cow breed            
                let cowBreed = await CowBreedModel.findOne(cow.idCowBreed)
                cow.cowBreedName = cowBreed.name

                //get group cow
                if(cow.idGroupCow){
                    let groupCow = await GroupCowModel.findOne(cow.idGroupCow)
                    cow.groupCowName = groupCow.name
                }

                //get current period
                cow.daysOld = dateUtil.getDaysOld(cow.birthday)
                let currentPeriod = await PeriodModel.getMany(1,0,{endDay:1},{idCowBreed: cow.idCowBreed,startDay: {$gte: cow.daysOld}})
                
                if(currentPeriod[0]){                    
                    cow.currentPeriodId = currentPeriod[0]._id
                    cow.currentPeriodName = currentPeriod[0].name
                }
            }
            return cow
        } catch (error) {
            console.log("find cow",error)
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
                if((new Date(data.birthday))=='Invalid Date')
                    return {err: "birthday invalid"}
            }            

            let cow = await CowModel.updateOne(id,data)            
            if(!cow) return {err: "update false"}
            return true
        } catch (error) {
            console.log("error update cow", error)
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
            let cacheGroupCowList = []
            let cacheCowBreedList = []
            let cachePeriodList = []
            let items = await CowModel.getMany(limit, skip, sortOption, filter)
            if(items.length > 0){
                for(let i = 0; i < items.length; i++){
                    let cow = items[i]
                    if(cow){

                        //get cow breed name
                        let cacheCowBreed = cacheCowBreedList.find(x => x.id == cow.idCowBreed)
                        if(cacheCowBreed){
                            cow.cowBreedName = cacheCowBreed.name
                        }else{
                            let cowBreed = await CowBreedModel.findOne(cow.idCowBreed)
                            cow.cowBreedName = cowBreed.name
                            cacheCowBreedList.push({id: cowBreed._id, name: cowBreed.name})
                        }                        

                        //get cow group name                        
                        if(cow.idGroupCow){
                            let cacheGroupCow = cacheGroupCowList.find(x => x.id == cow.idGroupCow)
                            if(cacheGroupCow){
                                cow.groupCowName = cacheGroupCow.name
                            }else{
                                let groupCow = await GroupCowModel.findOne(cow.idGroupCow)
                                cow.groupCowName = groupCow.name
                                cacheGroupCowList.push({id: groupCow._id, name: groupCow.name})
                            }
                            
                        }

                        //format date
                        cow.daysOld = dateUtil.getDaysOld(cow.birthday)
                        cow.birthday = dateUtil.formatDate(cow.birthday)

                        //get current period
                        let cachePeriod = cachePeriodList.find(x=> x.startDay <= cow.daysOld && x.endDay >= cow.daysOld)
                        if(cachePeriod){
                            cow.currentPeriodId = cachePeriod.id
                            cow.currentPeriodName = cachePeriod.name
                        }else{
                            // let currentPeriod = await PeriodModel.getMany(10,0,{endDay:1},{idCowBreed: cow.idCowBreed,startDay: {$gte: cow.daysOld}})
                            let currentPeriod = await PeriodModel.getMany(1,0,{},{idCowBreed: cow.idCowBreed, $and:[{startDay: {$lte: cow.daysOld}}, {endDay: {$gte: cow.daysOld}}] })
                            console.log("current", currentPeriod, cow)
                            if(currentPeriod[0]){
                                cow.currentPeriodId = currentPeriod[0]._id
                                cow.currentPeriodName = currentPeriod[0].name
                                cachePeriodList.push({
                                    id: currentPeriod[0]._id,
                                    name: currentPeriod[0].name,
                                    startDay: currentPeriod[0].startDay,
                                    endDay: currentPeriod[0].endDay,
                                })
                            }
                        }                        
                    }
                }
            }

            let totalCount = await CowModel.count(filter)
            return {totalCount,items}
        } catch (error) {
            console.log("error get many cow", error)
            return {err: error}
        }
    },

    count: (filter) =>{
        CowModel.count(filter)
    },

    statistic: async (query) =>{
        let {from, to, filter, groupBy} = query
        let {idUser} = filter           
        let result = []     
        if(!idUser) return {err: "idUser null"}
        if(!from) from = formatDate()
        if(!to) to = formatDate()  
        if(!!from && !!to){
            from = new Date(`${from} 00:00`).getTime()
            to = new Date(`${to} 23:59`).getTime()                  
            Object.assign(filter, {createdAt: { $gt : from , $lt : to }})
        }
                 
        let cows = await CowModel.queryByFields(filter)        
        if(cows.length == 0) return cows
        
        //group period        
        if(groupBy=="period"){            
            let periodList = []
            for(let i = 0; i < cows.length; i++){
                let cow = cows[i]

                //get current period
                cow.daysOld = dateUtil.getDaysOld(cow.birthday)                
                let cachePeriod = periodList.find(x => x.startDay <= cow.daysOld && x.endDay >= cow.daysOld)
                if(!cachePeriod){
                    let currentPeriod = await PeriodModel.getMany(1,0,{},{idCowBreed: cow.idCowBreed, $and:[{startDay: {$lte: cow.daysOld}}, {endDay: {$gte: cow.daysOld}}] })
                    if(currentPeriod[0]){                        
                        periodList.push({
                            id: currentPeriod[0]._id, 
                            name: currentPeriod[0].name, 
                            startDay: currentPeriod[0].startDay, 
                            endDay: currentPeriod[0].endDay                           
                        })
                    }
                }                
            }

            for(let i = 0; i < periodList.length; i++){
                periodList[i].cows = []
                for(let j = 0; j < cows.length; j++){
                    let cow = cows[j]
                    if(cow.daysOld >= periodList[i].startDay){                        

                        periodList[i].cows.push({
                            _id: cow._id,
                            serial: cow.serial,
                            weight: cow.weight ? 
                                cow.weight.filter(x => parseInt(x.week)*7 <= periodList[i].endDay + 4 && parseInt(x.week)*7 >= periodList[i].startDay +4) : []
                        })
                    }
                }
            }
            return periodList.sort((a, b)=> parseInt(a.startDay)-parseInt(b.startDay))            
        }
        
        for(let i = 0; i < cows.length; i++){
            let cow = cows[i]
            let item = {_id: cow._id, serial: cow.serial, weight: []}            
            if(cow.weight && cow.weight.length > 0){                
                item.weight = cow.weight.filter(x=> x.createdAt >= from && x.createdAt <= to)                
            }
            result.push(item)
        }
        return result
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