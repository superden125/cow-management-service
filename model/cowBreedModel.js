"user strict"
const DB = require('./index')
const ObjectId = require('mongodb').ObjectId

const collectionName = 'crowBreed'

let _db = DB.getDb()
let _collection = _db.collection(collectionName)

var CowBreed = {    

    insertOne: function (data){
        try {
            //check null
            if(!data.name) return {err: "name null"}
            if(!data.farmingTime) return {err: "farmingTime null"}

            //check farmingTime
            data.farmingTime = parseInt(data.farmingTime)
            if(Number.isInteger(data.farmingTime) == false)
                return {err: "farming time invalid"}

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
            //check formingTime
            if(data.farmingTime){
                data.farmingTime = parseInt(data.farmingTime)
                if(Number.isInteger(data.farmingTime) == false)
                    return {err: "farming time invalid"}
            }

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
    }
}

module.exports = CowBreed
