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
            query.filter = query.filter ? JSON.parse(query.filter): {} 
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

router.route('/:idDiaryFeed/food/:idFood')
    .put(async (req,res)=>{
        let {idDiaryFeed, idFood} = req.params
        let {amount} = req.body
        if(!amount) return res.json({status: false, message: "amount invalid"})
        
        let result = await DiaryFeedController.updateFood(idDiaryFeed,idFood, {amount})
        if(!result || result.err) return res.json({status: false})
        res.json({status: true})
    })
    .delete(async (req,res)=>{
        let {idDiaryFeed, idFood} = req.params
        let result = await DiaryFeedController.deleteFood(idDiaryFeed,idFood)
        if(!result || result.err) return res.json({status: false})
        res.json({status: true})
    })

router.route('/:idDairyFeed/food')
    .post(async (req,res)=>{
        let {idDairyFeed} = req.params
        let data = req.body

        let result = await DiaryFeedController.pushFood(idDairyFeed, data)
        if(!result || result.err) return res.json({status: false})
        res.json({status: true})
    })

 module.exports = router