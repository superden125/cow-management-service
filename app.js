require('dotenv/config')

import express from 'express'
import bodyParser from 'body-parser'
import {connectDB} from './model/index'

const PORT = process.env.PORT || 3000


const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

connectDB((err)=>{
    
    if(err){
        console.log("connect db error", err)
        return
    }
    console.log("connected db...")

    app.get('/',(req,res)=>{
        res.json({service: "cow management service", auth: "sd"})
    })

    app.use('/api/user', require('./route/user'))
    app.use('/api/cow', require('./route/cow'))
    app.use('/api/area', require('./route/area'))
    app.use('/api/cowbreed', require('./route/cowBreed'))
    app.use('/api/groupcow', require('./route/groupCow'))
    
    app.listen(3000, ()=>{
        console.log(`server listening on port ${PORT}...`)
    })
})
