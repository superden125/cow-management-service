"user strict"
const DB = require('./index')
const ObjectId = require('mongodb').ObjectId

const collectionName = 'user'

let _db = DB.getDb()
let _collection = _db.collection(collectionName)

var UserModel = {    

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
                let re = new RegExp(search,'i')
                Object.assign(filter,{$or: [{ username: { $regex: re } },  { name: { $regex: re }}, { email: { $regex: re }} ] })
            }             
            let doc = await _collection.find(filter).project({ password: 0}).limit(limit).skip(skip).sort(sort).toArray()            
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
    search: async (s, filter)=>{
        try {            
            let result = await _collection.find({ $text :{ $search: s}}).toArray()
            console.log("res",result)
            return result
        } catch (error) {
            console.log("eerre,",error)
            return {err: "not found"}
        }
    }
}

module.exports = UserModel
