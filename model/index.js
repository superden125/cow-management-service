import {MongoClient} from 'mongodb'
import mongo from '../config/mongo'

let db

const indexMongo = {
    connectDB: async (callback)=>{
        let client = new MongoClient(mongo.url)
        let conn = await client.connect()
        if(conn.err){
            return callback(err)
        }
        db = client.db(mongo.dbName)
        return callback()
    },
    getDb: ()=>{
        return db
    }
}

module.exports = indexMongo