"use strict";
const CowModel = require('../model/cowModel')
const UserModel = require('../model/userModel')
const CowBreed = require('../model/cowBreedModel')
const GroupCow = require('../model/groupCowModel')

const Cow = {
    insertOne: async (data)=>{
        try {
            //check null
            if(!data.idUser) return {err: "idUser null"}
            if(!data.idCowBreed) return {err: "idCowBreed null"}
            if(!data.birthday) return {err: "birthday null"}
            
            //check user
            let user = await UserModel.findOne(data.idUser)
            if(!user) return {err: "user not found"}            

            //check cowBreed
            let cowBreed = await CowBreed.findOne(data.idCowBreed)
            if(!cowBreed) return {err: "cow breed not found"}

            //check group cow
            if(data.idGroupCow){
                let groupCow = await GroupCow.findOne(data.idGroupCow)
                if(!groupCow) return {err: "group cow not found"}
            }

            data.birthday = parseInt(data.birthday)
            if(Number.isInteger(data.birthday)==false)
                return {err: "birthday invalid"}            

            let cow = await CowModel.insertOne(data)
            if(cow.insertedId){                
                return data
            }else{
                return {err: cow}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let cow = await CowModel.findOne(id)            
            return cow
        } catch (error) {
            return {err: error}
        }
    },
    deleteById: (id)=>{
        return CowModel.deleteOne(id)
    },
    updateOne: async (id,data)=>{
        try {

            if(data.idUser){
                let user = await UserModel.findOne(data.idUser)
                if(!user) return {err: "user not found"}
            }

            if(data.idCowBreed){
                let cowBreed = await CowBreed.findOne(data.idCowBreed)
                if(!cowBreed) return {err: "cow breed not found"}
            }
            
            if(data.idGroupCow){
                let groupCow = await GroupCow.findOne(data.idGroupCow)
                if(!groupCow) return {err: "group cow not found"}
            }
            if(data.birthday){
                data.birthday = parseInt(data.birthday)
                if(Number.isInteger(data.birthday)==false)
                    return {err: "birthday invalid"}
            }            

            let cow = await CowModel.updateOne(id,data)            
            if(!cow) return {err: "update false"}
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
        
        if(sort){
            let s = sort.split(' ')[0]
            let v = sort.split(' ')[1]
            v = v == 'desc' ? -1 : 1            
            sortOption[s]=v
        }

        let items = await CowModel.getMany(limit, skip, sortOption, filter)
        let totalCount = await CowModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        CowModel.count(filter)
    }    
}

module.exports = Cow;