const express = require('express')
const UserController = require('../controller/user')
const jwt = require('../lib/jwt')

const router = express.Router()
router.route('/login')
    .post(async (req,res)=>{
        try {
            let {username, password} = req.body
            if(!username || !password) return res.json({status: false, message: "username or password null"})
            let result = await UserController.login({username,password})
            if(result.err) return res.json({status: false, message: result.err})
            return res.json({status: true, data: result})
        } catch (error) {
            return res.json({status: false, message: "Login fail"})
        }
    })

router.route('/logout')
    .get(async (req,res)=>{
        try {
            let token = req.header("x-session-key").split(' ')[1]
            if(!token) return res.json({status: true})            
            await jwt.destroy(token)
            res.json({status: true})
        } catch (error) {            
            return res.json({status: false, message: "Logout fail"})
        }
    })

module.exports = router