"user strict"
const DB = require('./index')
const ObjectId = require('mongodb').ObjectId

const collectionName = 'meal'

let _db = DB.getDb()
let _collection = _db.collection(collectionName)

var MealModel = {    

    insertOne: function (data){
        try {         
            data.createdAt = new Date().getTime()
            data.deleted = false               
            if(!data._id) data._id = (new ObjectId()).toHexString()                      
            return _collection.insertOne(data)
            
        } catch (error) {            
            return {err: error}
        }
    },

    findOne: async (_id)=>{
        try {
            let doc = await _collection.findOne({_id})
            return doc
        } catch (error) {            
            return {err: error}
        }
    },

    updateOne: async (_id, data)=>{
        try {
            delete data.createdAt
            delete data.deleted
            let doc = await _collection
                .findOneAndUpdate({_id}, {$set: data},{returnOriginal: false})                
            return doc.value
        } catch (error) {            
            return {err: error}
        }
    },

    deleteOne: async (_id)=>{
        try {
            let doc = await _collection
                .findOneAndUpdate({_id}, {$set: {deleted: true}},{returnOriginal: false})
            return doc.value
        } catch (error) {            
            return {err: error}
        }
    },
    
    removeOne: async (_id)=>{
        try {
            let doc = await _collection.findOneAndDelete({_id})                       
            return doc.value
        } catch (error) {            
            return {err: error}
        }
    },

    queryByFields: async (filter)=>{
        try {            
            filter.deleted = false        
            let doc = await _collection.find(filter).toArray()            
            return doc
        } catch (error) {
            return {err: error}
        }
    },

    getMany: async (limit, skip, sort, filter)=>{
        try {            
            filter.deleted = false
            sort.createdAt = -1
            let doc = await _collection.find(filter).limit(limit).skip(skip).sort(sort).toArray()            
            return doc
        } catch (error) {
            return {err: error}
        }
    },

    count: async (filter)=>{
        try{
            filter.deleted = false
            let total = await _collection.count(filter)
            return total
        }catch(error){
            return error
        }
    },

    getDetailMeal: async (filter)=>{
        try {
            let pipeline = [
                {
                  '$match': filter
                }, {
                  '$lookup': {
                    'from': 'period', 
                    'localField': 'idPeriod', 
                    'foreignField': '_id', 
                    'as': 'period'
                  }
                }, {
                  '$unwind': {
                    'path': '$period'
                  }
                }, {
                  '$addFields': {
                    'periodName': '$period.name'
                  }
                }, {
                  '$lookup': {
                    'from': 'area', 
                    'localField': 'idArea', 
                    'foreignField': '_id', 
                    'as': 'area'
                  }
                }, {
                  '$unwind': {
                    'path': '$area'
                  }
                }, {
                  '$addFields': {
                    'areaName': '$area.name'
                  }
                }, {
                  '$project': {
                    'period': 0, 
                    'area': 0
                  }
                },
                {
                    '$sort': {
                        'createdAt' : -1
                    }
                }
              ]
    
              let docs = await _collection.aggregate(pipeline).toArray()
              return docs
        } catch (error) {            
            return {err: error}
        }
    }
}

module.exports = MealModel
