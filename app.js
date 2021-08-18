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
    
    require('./route/user')(app)
    
    app.listen(3000, ()=>{
        console.log(`server listening on port ${PORT}...`)
    })
})
