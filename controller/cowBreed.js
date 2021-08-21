"use strict";
const CowBreedModel = require('../model/cowBreedModel')

const CowBreed = {
    insertOne: async (data)=>{
        try {
            //check null
            if(!data.name) return {err: "name null"}
            if(!data.farmingTime) return {err: "farmingTime null"}

            //check farmingTime
            data.farmingTime = parseInt(data.farmingTime)
            if(Number.isInteger(data.farmingTime) == false)
                return {err: "farming time invalid"}

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
            //check formingTime
            if(data.farmingTime){
                data.farmingTime = parseInt(data.farmingTime)
                if(Number.isInteger(data.farmingTime) == false)
                    return {err: "farming time invalid"}
            }
            
            //update db
            let cowBreed = await CowBreedModel.updateOne(id,data)            
            if(!cowBreed) return {err: "update false"}
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

        let items = await CowBreedModel.getMany(limit, skip, sortOption, filter)
        let totalCount = await CowBreedModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        CowBreedModel.count(filter)
    }    
}

module.exports = CowBreed;