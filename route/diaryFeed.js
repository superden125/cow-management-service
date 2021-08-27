const express = require('express')
const DiaryFeedController = require('../controller/diaryFeed')


const router = express.Router()    

router.route('/:id')
    .get(async (req,res)=>{
        let id = req.params.id
        let diaryFeed = await DiaryFeedController.findById(id)        
        if(!diaryFeed) return res.json({status: false, message: "diaryFeed not found"})            
        res.json({status: true, data: diaryFeed})
    })
    .put(async (req,res)=>{
        let id = req.params.id
        let data = req.body
        let diaryFeed = await DiaryFeedController.updateOne(id,data)
        if(diaryFeed.err) return res.json({status: false, message: diaryFeed.err})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let id = req.params.id
        let diaryFeed = await DiaryFeedController.deleteById(id)
        if(!diaryFeed) return res.json({status: false, message: "diaryFeed not found"})
        res.json({status: true})
    })

router.route('/')
    .get(async (req,res)=>{
        try {
            let query = req.query            
            // query.limit = query.limit ? query.limit : query.take
            // delete query.take        
            let diaryFeeds = await DiaryFeedController.getMany(query)
            res.json({status: true, data: diaryFeeds})
        } catch (error) {            
            return res.json({status: false, data:[], message: "Error query data"})
        }
    })
    .post(async (req,res)=>{
        let data = req.body                                    
        let result = await DiaryFeedController.insertOne(data)        
        if(result.err) return res.json({status: false, message: result.err}) 
        return res.json({status: true, data: result})

    })



 module.exports = router