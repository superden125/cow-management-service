"use strict";
const UserModel = require('../model/userModel')
const AreaModel = require('../model/areaModel')
const pwd = require('../lib/password')
const jwt = require('../lib/jwt')

const User = {
    insertOne: async (data)=>{
        try {
            //check data
            if(!data.idArea) return {err: "id area null"}
            if(!data.username) return {err: "username null"}
            if(!data.password) return {err: "password null"}
            if(!data.role) data.role = 'breeder'

            //check area
            let area = await AreaModel.findOne(data.idArea)
            if(!area) return {err: "id area not found"}

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
            if(!user) return {err: "user not found"}

            let area = await AreaModel.findOne(user.idArea)
            if(!area) return {err: "area not found"}
            user.areaName = area.name
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
            if(data.idArea){
                let area = await AreaModel.findOne(data.idArea)
                if(!area) return {err: "id area not found"}
            }
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
        
        if(sort){
            let s = sort.split(' ')[0]
            let v = sort.split(' ')[1]
            v = v == 'desc' ? -1 : 1            
            sortOption[s]=v
        }

        let items = await UserModel.getMany(limit, skip, sortOption, filter)
        let totalCount = await UserModel.count(filter)
        return {totalCount,items}
    },

    count: (filter) =>{
        UserModel.count(filter)
    },

    login: async (data) =>{
        try {
            let {username, password} = data
            let usersDB = await UserModel.queryByFields({username})            
            if(usersDB.err){
                return {err: "username not found"}
            }                        
            let userDB = usersDB[0]
            let checkPwd = pwd.compare(password, userDB.password)            
            if(!checkPwd) return {err: "password wrong"}
            delete userDB.password
            delete userDB.deleted
            delete userDB.createdAt
            let tokenKey = await jwt.encode(userDB)
            let token = `Bearer ${tokenKey}`

            userDB.token = token
            return userDB
        } catch (error) {
            return {err: error}
        }
    }
}

module.exports = User;