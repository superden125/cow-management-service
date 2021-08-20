"use strict";
const AreaModel = require('../model/areaModel')

const Area = {
    insertOne: async (data)=>{
        try {            
            let area = await AreaModel.insertOne(data)
            if(area.insertedId){                
                return data
            }else{
                return {err: area}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let area = await AreaModel.findOne(id)            
            return area
        } catch (error) {
            return {err: error}
        }
    },
    deleteById: (id)=>{
        return AreaModel.deleteOne(id)
    },
    updateOne: async (id,data)=>{
        try {
            let area = await AreaModel.updateOne(id,data)            
            if(!area) return {err: "update false"}
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

        let items = await AreaModel.getMany(limit, skip, sortOption, filter)
        let totalCount = await AreaModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        AreaModel.count(filter)
    }    
}

module.exports = Area;