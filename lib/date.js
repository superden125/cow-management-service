"use strict"
var dates = {

    getDaysOld: function (start, end){
        console.log("start",start)
        end = end ? end : new Date().getTime()
        start = new Date(start).getTime()
        const oneDay = 24 * 60 * 60 * 1000

        return Math.round(Math.abs((start-end)/oneDay))
    }

}

module.exports = dates