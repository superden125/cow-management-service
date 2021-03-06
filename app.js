require('dotenv/config')

import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import cors  from 'cors'
import morgan from 'morgan'
import {connectDB} from './model/index'
import {port} from './config/host'
import {isLogin} from './middleware/auth'
import path from 'path'
const app = express()
app.use(morgan('dev'))
app.use(session(
    {
        secret: "DC4483AB18723",
        resave: true,
        saveUninitialized: true,
    }
))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
connectDB((err)=>{
    
    if(err){
        console.log("connect db error", err)
        console.log("service shutdown")
        return
    }
    console.log("connected db...")

    app.get('/',(req,res)=>{
        res.json({service: "cow management service", auth: "sd"})
    })

    app.use('/api/auth', require('./route/auth'))
    app.use('/api',isLogin)
    app.use('/api/admin', require('./route/admin'))
    app.use('/api/user', require('./route/user'))
    app.use('/api/cow', require('./route/cow'))
    app.use('/api/area', require('./route/area'))
    app.use('/api/cowbreed', require('./route/cowBreed'))
    app.use('/api/groupcow', require('./route/groupCow'))
    app.use('/api/food', require('./route/food'))
    app.use('/api/diaryfeed',require('./route/diaryFeed'))
    app.use('/api/period',require('./route/period'))
    app.use('/api/meal',require('./route/meal'))
    
    app.listen(port, ()=>{
        console.log(`server listening on port ${port}...`)
    })
})
