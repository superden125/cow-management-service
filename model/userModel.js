"user strict"
const DB = require('./index')
const ObjectId = require('mongodb').ObjectId

const collectionName = 'user'

let _db = DB.getDb()
let _collection = _db.collection(collectionName)

/**
 * why not
 * @object
 */
var UserModel = {    

    /**
     * @function
     * @param {object} data 
     * @returns {object}
     */
    create: function (data){
        try {                        
            if(!data._id) data._id = (new ObjectId()).toHexString()            
            return _collection.insertOne(data)
            
        } catch (error) {            
            return {err: error}
        }
    },

    read: async (_id)=>{
        try {
            let doc = await _collection.findOne({_id})
            return doc
        } catch (error) {            
            return {err: error}
        }
    },

    update: async (_id, data)=>{
        try {
            let doc = await _collection
                .findOneAndUpdate({_id}, {$set: data},{returnOriginal: false})
            console.log("update", doc)
            return doc.value
        } catch (error) {            
            return {err: error}
        }
    },
    
    delete: async (_id)=>{
        try {
            let doc = await _collection.findOneAndDelete({_id})                       
            return doc.value
        } catch (error) {            
            return {err: error}
        }
    },

    queryByFields: async (fields)=>{
        try {
            let doc = await _collection.find(fields).toArray()
            return doc
        } catch (error) {
            return error
        }
    }
}

module.exports = UserModel
