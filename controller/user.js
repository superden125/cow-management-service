"use strict";
const UserModel = require('../model/userModel')

const User = {
    create: (data)=>{        
        return UserModel.create(data)
    },
    read: (id)=>{
        return UserModel.read(id)
    },
    delete: (id)=>{
        return UserModel.delete(id)
    },
    update: (id,data)=>{
        return UserModel.update(id,data)
    },
    queryByFields: (fields)=>{
        return UserModel.queryByFields(fields)
    }
}

module.exports = User;