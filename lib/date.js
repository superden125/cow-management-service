"use strict"
var dates = {

    getDaysOld: function (start, end){        
        end = end ? end : new Date().getTime()
        start = new Date(start).getTime()
        const oneDay = 24 * 60 * 60 * 1000

        return Math.round(Math.abs((start-end)/oneDay))
    },

    formatDate: function(date){        
        date = date ? date : Date.now()
        let d = new Date(date)
        return `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}-${('0'+d.getDate()).slice(-2)}`
    }

}

module.exports = dates