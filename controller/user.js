"use strict";
const UserModel = require('../model/userModel')
const AreaModel = require('../model/areaModel')
const pwd = require('../lib/password')
const jwt = require('../lib/jwt')
const {userAdmin,passwordAdmin} = require('../config/host')

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

            //check idManager
            if(data.idManager){
                let checkManager = await UserModel.findOne(data.idManager)
                if(!checkManager) return {err: "id Manager not found"}
            }

            //check username existed
            let checkUser = await UserModel.queryByFields({username: data.username})
            if(checkUser.length > 0){
                return {err: "username existed"}
            }

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
    
    queryByFields: async (query)=>{
        try{
            let result = await UserModel.queryByFields(query)
            if(result.err) return {err: result.err}
            if(result.length>0){
                let cacheAreaList = []            
                for(let i=0; i<result.length; i++){
                    delete result[i].password
                    let cacheArea = cacheAreaList.find(x=> x.id == result[i].idArea)
                    if(cacheArea){
                        result[i].areaName = cacheArea.name
                    }else{
                        let area = await AreaModel.findOne(result[i].idArea)
                        if(area){
                            result[i].areaName = area.name
                            cacheAreaList.push({ id: area._id, name: area.name})
                        }                        
                    }
                    
                }
            }
            return result
        }catch(error){
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
            
            //check idManager
            if(data.idManager){
                let checkManager = await UserModel.findOne(data.idManager)
                if(!checkManager) return {err: "id Manager not found"}
            }
            
            delete data.password
            delete data.username
            let user = await UserModel.updateOne(id,data)
            
            if(!user) return {err: "update false"}
            return true
        } catch (error) {
            return {err: error}
        }
        
    },
    getMany: async (query)=>{
        try {
            let {limit, skip, filter, sort, search} = query
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

            let items = await UserModel.getMany(limit, skip, sortOption, filter, search)
            if(items.length>0){
                let cacheAreaList = []            
                for(let i=0; i<items.length; i++){
                    let cacheArea = cacheAreaList.find(x=> x.id == items[i].idArea)
                    if(cacheArea){
                        items[i].areaName = cacheArea.name
                    }else{
                        let area = await AreaModel.findOne(items[i].idArea)
                        if(area){
                            items[i].areaName = area.name
                            cacheAreaList.push({ id: area._id, name: area.name})
                        }                        
                    }
                    
                }
            }

            let totalCount = await UserModel.count(filter)        
            return {totalCount,items}    
        } catch (error) {
            return {err: error}
        }
        
    },

    count: (filter) =>{
        UserModel.count(filter)
    },

    updateBreeder: async (idManager, idBreeder, data)=>{
        try {
            let manager = await UserModel.findOne(idManager)
            if(!manager || manager.role != 'manager') return {err: "manager not found"}
            let breeder = await UserModel.findOne(idBreeder)
            if(!breeder || breeder.role != 'breeder' ) return {err: "breeder not found"}

            data.idManager = idManager

            if(data.idArea){
                let area = await AreaModel.findOne(data.idArea)
                if(!area) return {err: "id area not found"}
            }            
            delete data.password
            delete data.username
            let user = await UserModel.updateOne(idBreeder,data)
            
            if(!user) return {err: "update false"}
            return true            
        } catch (error) {
            return {err: error}
        }
    },

    deleteBreeder: async (idBreeder)=>{
        try {
            let breeder = await UserModel.queryByFields({_id: idBreeder, role: 'breeder'})
            if(breeder.length==0) return {err: "breeder not found"}
            let result = await UserModel.deleteOne(idBreeder)
            if(result.err) return {err: result.err}
            return result
        } catch (error) {
            return {err: error}
        }
    },

    login: async (data) =>{
        try {
            let {username, password} = data

            //user loopback
            if(username == userAdmin && password == passwordAdmin){
                let su = {
                    username: "sd",
                    role: "admin",
                    jti: "superuser"                                     
                }
                let tokenKey = await jwt.encode(su)
                let token = `Bearer ${tokenKey}`
                su.token = token
                return su
            }

            //user db
            let usersDB = await UserModel.queryByFields({username})            
            if(usersDB.length == 0){
                return {err: "user not found"}
            }                        
            let userDB = usersDB[0]
            let checkPwd = pwd.compare(password, userDB.password)            
            if(!checkPwd) return {err: "password wrong"}
            delete userDB.password
            delete userDB.deleted
            delete userDB.createdAt
            userDB.jti = userDB._id
            let tokenKey = await jwt.encode(userDB)
            let token = `Bearer ${tokenKey}`

            userDB.token = token
            return userDB
        } catch (error) {
            console.log("ee", error)
            return {err: error}
        }
    },
    changePassword: async (id, data)=>{
        try {
            let user = await UserModel.findOne(id)
            if(!data) return {err: "password null"}
            if(!user) return {err: "user not found"}
            let password = pwd.hash(data)
            let result = await UserModel.updateOne(id,{password})            
            delete result.password
            if(!user) return {err: "update false"}
            return true
        } catch (error) {            
            return {err: error}
        }
    },
    search: async (s, filter)=>{
        try {
            filter = filter ? filter : {}
            let result = await UserModel.search(s)
            return result
        } catch (error) {
            return {err: error}
        }
    }
}

module.exports = User;