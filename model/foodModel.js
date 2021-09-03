"user strict"
const DB = require('./index')
const ObjectId = require('mongodb').ObjectId

const collectionName = 'food'

let _db = DB.getDb()
let _collection = _db.collection(collectionName)

var FoodModel = {    

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

    getMany: async (limit, skip, sort, filter, search)=>{
        try {            
            filter.deleted = false
            if(search){
                let re = new RegExp(search, 'i')
                Object.assign(filter, {name: {$regex: re}})
            }
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

    removeItem: async (_id, data)=>{
        try {            
            let doc = await _collection
                .updateOne({_id}, {$pull: data}, {returnOriginal: false})
            return doc.modifiedCount
        } catch (error) {
            console.log("err",error)
            return {err: error}
        }
    },
    updateItem: async (filter, data)=>{
        try {
            let doc = await _collection
                .updateOne(filter, {$set: data}, {returnOriginal: false})
            return doc.modifiedCount
        } catch (error) {
            console.log("err",error)
            return {err: error}
        }
    },
    pushItem: async (_id, data)=>{
        try {
            let doc = await _collection
                .updateMany({_id},{$push: data})
            return doc
        } catch (error) {
            return {err: error}
        }
    }
}

module.exports = FoodModel
