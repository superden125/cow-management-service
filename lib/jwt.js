import redis from 'redis'

import {privateKey} from '../config/jwt'
import { redisUrl, redisPwd } from '../config/redis'

const JWTR  = require('jwt-redis').default

let redisClient =  redis.createClient(redisUrl, {password: redisPwd})
let jwtr  = new JWTR(redisClient)

module.exports.decode = async (token)=>{
    let payload = await jwtr.verify(token,privateKey)    
    return payload
}

module.exports.encode = async (payload)=>{
    let token = await jwtr.sign(payload, privateKey, {expiresIn: '1h'})
    return token
}

module.exports.destroy = async (token)=>{
    let payload = await jwtr.decode(token, privateKey)    
    let result = await jwtr.destroy(payload.jti)    
    return result
}