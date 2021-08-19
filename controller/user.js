"use strict";
const UserModel = require('../model/userModel')
const pwd =  require('../lib/password')

const User = {
    insertOne: async (data)=>{
        try {
            data.password = pwd.hash(data.password)
            let user = await UserModel.insertOne(data)
            if(user.insertedId){
                delete data.password            
                return data
            }else{
                return {err: user}
            }
        } catch (error) {
            return {err: error}
        }
    },
    findById: async (id)=>{
        try {
            let user = await UserModel.findOne(id)
            delete user.password
            return user
        } catch (error) {
            return {err: error}
        }
    },
    deleteById: (id)=>{
        return UserModel.deleteOne(id)
    },
    updateOne: async (id,data)=>{
        try {
            let user = await UserModel.updateOne(id,data)
            delete user.password
            if(!user) return {err: "update false"}
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

        let items = await UserModel.getMany(limit, skip, filter, sortOption)
        let totalCount = await UserModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        UserModel.count(filter)
    },

    signin: async (data) =>{
        try {
            let {username, password} = data
            let usersDB = await UserModel.queryByFields({username})            
            if(usersDB.err){
                return {err: "username not found"}
            }            
            console.log(usersDB)
            let userDB = usersDB[0]
            let checkPwd = pwd.compare(password, userDB.password)
            console.log(checkPwd)
            if(!checkPwd) return {err: "password wrong"}
            delete userDB.password
            userDB.session_key = "x-session-key"
            return userDB
        } catch (error) {
            return {err: error}
        }
    }
}

module.exports = User;