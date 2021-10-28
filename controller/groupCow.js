"use strict";
const GroupCowModel = require('../model/groupCowModel')
const CowModel = require('../model/cowModel')
const GroupCow = {
    insertOne: async (data)=>{
        try {
            if(!data.name) return {err: "name null"} 
            let groupCow = await GroupCowModel.insertOne(data)
            if(groupCow.insertedId){                
                return data
            }else{
                return {err: groupCow}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let groupCow = await GroupCowModel.findOne(id)            
            return groupCow
        } catch (error) {
            return {err: error}
        }
    },
    deleteById: async (id, deleteCow)=>{    
        try {
            if(deleteCow){            
                await CowModel.deleteMany({idGroupCow: id})
            }else{
                await CowModel.updateMany({idGroupCow: id}, {idGroupCow: ""})
            }
            let result = await GroupCowModel.deleteOne(id)    
            return result
        } catch (error) {
            return {err: error}
        }        
    },
    updateOne: async (id,data)=>{
        try {
            let groupCow = await GroupCowModel.updateOne(id,data)            
            if(!groupCow) return {err: "update false"}
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

            let items = await GroupCowModel.getMany(limit, skip, sortOption, filter)
            let totalCount = await GroupCowModel.count(filter)
            return {totalCount,items}
        } catch (error) {
            return {err: error}
        }
    },

    count: (filter) =>{
        GroupCowModel.count(filter)
    }
}

module.exports = GroupCow;