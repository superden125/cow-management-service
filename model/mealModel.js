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
            let pipeline = [
                {
                  '$match': filter
                }, 
                                
                {
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
                }, {
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
                    'from': 'meal', 
                    'localField': '_id', 
                    'foreignField': '_id', 
                    'as': 'meal'
                    }
                }, {
                    '$unwind': {
                    'path': '$meal'
                    }
                }, {
                    '$addFields': {
                    'meal.foods': '$foods'
                    }
                }, {
                    '$replaceRoot': {
                    'newRoot': '$meal'
                    }
                },
                  
                {
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
                    'periodName': '$period.name',
                    //'idCowBreed': '$period.idCowBreed'
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
                }, 
                // {
                //     '$lookup': {
                //       'from': 'cowBreed', 
                //       'localField': 'idCowBreed', 
                //       'foreignField': '_id', 
                //       'as': 'cowBreed'
                //     }
                //   }, {
                //     '$unwind': {
                //       'path': '$cowBreed'
                //     }
                //   }, {
                //     '$addFields': {
                //       'cowBreedName': '$cowBreed.name'
                //     }
                // },
                {
                  '$project': {
                    'period': 0, 
                    'area': 0,
                    //'cowBreed': 0
                  }
                },
                { '$limit': limit }, { '$skip': skip }, { '$sort': sort }
              ]
            
            // let doc = await _collection.find(filter).limit(limit).skip(skip).sort(sort).toArray()            
            let docs = await _collection.aggregate(pipeline).toArray()
            return docs
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
                },                
                
                {
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
                }, {
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
                    'from': 'meal', 
                    'localField': '_id', 
                    'foreignField': '_id', 
                    'as': 'meal'
                    }
                }, {
                    '$unwind': {
                    'path': '$meal'
                    }
                }, {
                    '$addFields': {
                    'meal.foods': '$foods'
                    }
                }, {
                    '$replaceRoot': {
                    'newRoot': '$meal'
                    }
                },                  
                
                {
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
                    'periodName': '$period.name',
                    'idCowBreed': '$period.idCowBreed'
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
                },
                {
                    '$lookup': {
                      'from': 'cowBreed', 
                      'localField': 'idCowBreed', 
                      'foreignField': '_id', 
                      'as': 'cowBreed'
                    }
                  }, {
                    '$unwind': {
                      'path': '$cowBreed'
                    }
                  }, {
                    '$addFields': {
                      'cowBreedName': '$cowBreed.name'
                    }
                },
                {
                  '$project': {
                    'period': 0, 
                    'area': 0,
                    'cowBreed': 0
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
    },

    getLaterMeal: async (filter)=>{
        try {
            let pipeline = [
                {
                  '$match': filter
                },                
                {
                    '$sort': {
                      'createdAt': -1
                    }
                  }, {
                    '$group': {
                      '_id': {
                        'idArea': '$idArea', 
                        'idPeriod': '$idPeriod'
                      }, 
                      'idMeal': {
                        '$push': '$_id'
                      }
                    }
                  }, {
                    '$project': {
                      'idMeal': {
                        '$arrayElemAt': [
                          '$idMeal', 0
                        ]
                      }
                    }
                  }, {
                    '$lookup': {
                      'from': 'meal', 
                      'localField': 'idMeal', 
                      'foreignField': '_id', 
                      'as': 'meal'
                    }
                  }, {
                    '$unwind': {
                      'path': '$meal'
                    }
                  }, {
                    '$replaceRoot': {
                      'newRoot': '$meal'
                    }
                  },
                {
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
                }, {
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
                    'from': 'meal', 
                    'localField': '_id', 
                    'foreignField': '_id', 
                    'as': 'meal'
                    }
                }, {
                    '$unwind': {
                    'path': '$meal'
                    }
                }, {
                    '$addFields': {
                    'meal.foods': '$foods'
                    }
                }, {
                    '$replaceRoot': {
                    'newRoot': '$meal'
                    }
                },                  
                
                {
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
                    'periodName': '$period.name',
                    'idCowBreed': '$period.idCowBreed'
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
                },
                {
                    '$lookup': {
                      'from': 'cowBreed', 
                      'localField': 'idCowBreed', 
                      'foreignField': '_id', 
                      'as': 'cowBreed'
                    }
                  }, {
                    '$unwind': {
                      'path': '$cowBreed'
                    }
                  }, {
                    '$addFields': {
                      'cowBreedName': '$cowBreed.name'
                    }
                },
                {
                  '$project': {
                    'period': 0, 
                    'area': 0,
                    'cowBreed': 0
                  }
                },                
                {
                    '$sort': {
                        'createdAt' : -1
                    }
                }
              ]
              console.log("pipeline", pipeline)
              let docs = await _collection.aggregate(pipeline).toArray()
              return docs
        } catch (error) {            
            return {err: error}
        }
    },
}

module.exports = MealModel
