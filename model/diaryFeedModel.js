"user strict"
const DB = require('./index')
const ObjectId = require('mongodb').ObjectId

const collectionName = 'diaryFeed'

let _db = DB.getDb()
let _collection = _db.collection(collectionName)

var DiaryFeedModel = {    

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

    getMany: async (limit, skip, sort, filter, group = false)=>{
        try {            
            filter.deleted = false
            sort.createdAt = -1
            let pipeline = [
                {
                    '$match': filter
                },
                {
                  '$unwind': {
                    'path': '$foods'
                  }
                }, {
                  '$lookup': {
                    'from': 'food', 
                    'localField': 'foods.idFood', 
                    'foreignField': '_id', 
                    'as': 'foods.food'
                  }
                }, {
                  '$unwind': {
                    'path': '$foods.food'
                  }
                }, {
                  '$addFields': {
                    'foods.name': '$foods.food.name', 
                    'foods.unit': '$foods.food.unit'
                  }
                }, {
                  '$project': {
                    'foods.food': 0
                  }
                }, {
                  '$group': {
                    '_id': '$_id', 
                    'foods': {
                      '$push': '$foods'
                    }
                  }
                }, {
                  '$lookup': {
                    'from': 'diaryFeed', 
                    'localField': '_id', 
                    'foreignField': '_id', 
                    'as': 'diaryFeed'
                  }
                }, {
                  '$unwind': {
                    'path': '$diaryFeed'
                  }
                }, {
                  '$addFields': {
                    'diaryFeed.foods': '$foods'
                  }
                }, {
                  '$replaceRoot': {
                    'newRoot': '$diaryFeed'
                  }
                }, {
                  '$lookup': {
                    'from': 'cow', 
                    'localField': 'idCow', 
                    'foreignField': '_id', 
                    'as': 'cow'
                  }
                }, {
                  '$unwind': {
                    'path': '$cow'
                  }
                }, {
                  '$addFields': {
                    'idBreeder': '$cow.idUser',
                    'serial':'$cow.serial'
                  }
                }, {
                  '$project': {
                    'cow': 0
                  }
                }, {
                  '$lookup': {
                    'from': 'user', 
                    'localField': 'idBreeder', 
                    'foreignField': '_id', 
                    'as': 'user'
                  }
                }, {
                  '$unwind': {
                    'path': '$user'
                  }
                }, {
                  '$addFields': {
                    'breederName': '$user.name'
                  }
                }, {
                  '$project': {
                    'user': 0
                  }
                }
                // ,
                // {
                //   '$group': {
                //     '_id': '$idBreeder', 
                //     'diaryFeeds': {
                //       '$push': {
                //         'idDairyFeed': '$_id', 
                //         'idCow': '$idCow', 
                //         'createdAt': '$createdAt', 
                //         'serial': '$serial', 
                //         'foods': '$foods'
                //       }
                //     }
                //   }
                // },
                // { '$sort': sort }, { '$skip': skip}, { '$limit': limit}
              ]        
            if(group){
              pipeline.push({
                '$group': {
                  '_id': '$idBreeder', 
                  'diaryFeeds': {
                    '$push': {
                      'idDairyFeed': '$_id', 
                      'idCow': '$idCow', 
                      'createdAt': '$createdAt', 
                      'serial': '$serial', 
                      'foods': '$foods'
                    }
                  }
                }
              })
            }
            pipeline.push({ '$sort': sort }, { '$skip': skip}, { '$limit': limit})
            // let doc = await _collection.find(filter).limit(limit).skip(skip).sort(sort).toArray()            
            let doc = await _collection.aggregate(pipeline).toArray()
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
    },

    statistic : async (idCow, filter)=>{
        try {
            console.log("filter", filter)  
            let pipeline = [
                {   
                  '$match': filter
                  
                }, {
                  '$group': {
                    '_id': '$idCow', 
                    'food': {
                      '$push': '$foods'
                    }
                  }
                }, {
                  '$unwind': {
                    'path': '$food'
                  }
                }, {
                  '$unwind': {
                    'path': '$food'
                  }
                }, {
                  '$group': {
                    '_id': '$food.idFood', 
                    'amount': {
                      '$push': '$food.amount'
                    }
                  }
                }, {
                  '$addFields': {
                    'total': {
                      '$sum': '$amount'
                    }
                  }
                }
                , {
                    '$unset': ['amount']
                }
                
              ] 
              
            let data = await _collection.aggregate(pipeline).toArray()
            console.log("data", data)
            return data
        } catch (error) {
            
        }
    }
}

module.exports = DiaryFeedModel
