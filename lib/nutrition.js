const {convertArrayToObject} = require('./utils')

// let foods = [
//     {
//         "_id": "6176bdf69636f0bc1eb7188a",
//         "name": "Bột sắn",
//         "unit": "kg",
//         "idArea": "611fd867ba4496abd105578f",
//         "type": 1,
//         "ingredient": [
//             {
//                 "name": "DM",
//                 "amount": "91",
//                 "unit": "kg/kg",
//                 "idIngredient": "30ITzz9Nv"
//             },
//             {
//                 "name": "ME",
//                 "amount": "1.63",
//                 "unit": "Mcal/kg",
//                 "idIngredient": "ZOUQ9u-4hh"
//             },
//             {
//                 "name": "CP",
//                 "amount": "4.4",
//                 "unit": "g",
//                 "idIngredient": "YaY82P1xMx"
//             },
//             {
//                 "name": "Ca",
//                 "amount": "3,5",
//                 "unit": "g",
//                 "idIngredient": "XfWzjc4i65"
//             },
//             {
//                 "name": "P",
//                 "amount": "14,1",
//                 "unit": "g",
//                 "idIngredient": "InGuHjsj-S"
//             }
//         ],
//         "amount": 5.67
//     },
//     {
//         "_id": "6176be2e56cbb2ce52c1ea2a",
//         "name": "Bột sắn",
//         "unit": "kg",
//         "idArea": "611fd867ba4496abd105578f",
//         "type": "1",
//         "ingredient": [
//             {
//                 "name": "DM",
//                 "amount": "89",
//                 "unit": "kg/kg",
//                 "idIngredient": "USnVttH-k"
//             },
//             {
//                 "name": "ME",
//                 "amount": "3.15",
//                 "unit": "Mcal/kg",
//                 "idIngredient": "MctmAum6CN"
//             },
//             {
//                 "name": "CP",
//                 "amount": "10.9",
//                 "unit": "g",
//                 "idIngredient": "Cqr4v8WR1n"
//             },
//             {
//                 "name": "Ca",
//                 "amount": "3,5",
//                 "unit": "g",
//                 "idIngredient": "mgcdaHiMRx"
//             },
//             {
//                 "name": "P",
//                 "amount": "14,1",
//                 "unit": "g",
//                 "idIngredient": "-7vKK_7ynh"
//             }
//         ],
//         "amount": 1.34
//     },
//     {
//         "_id": "6176be5044f1d150207c2ce6",
//         "name": "Bột sắn",
//         "unit": "kg",
//         "idArea": "611fd867ba4496abd105578f",
//         "type": "1",
//         "ingredient": [
//             {
//                 "name": "DM",
//                 "amount": "91",
//                 "unit": "kg/kg",
//                 "idIngredient": "YQNRkSmNa"
//             },
//             {
//                 "name": "ME",
//                 "amount": "2.75",
//                 "unit": "Mcal/kg",
//                 "idIngredient": "zc0Q8qyMm4"
//             },
//             {
//                 "name": "CP",
//                 "amount": "45.2",
//                 "unit": "g",
//                 "idIngredient": "tJ9dNfXFIS"
//             },
//             {
//                 "name": "Ca",
//                 "amount": "3,5",
//                 "unit": "g",
//                 "idIngredient": "bLCpiJtXye"
//             },
//             {
//                 "name": "P",
//                 "amount": "14,1",
//                 "unit": "g",
//                 "idIngredient": "bib0Wu3YiL"
//             }
//         ],
//         "amount": 0.78
//     }
// ]

function calcNutrition(foods){
    
    let DM = 0, ME = 0, CP=0    
    foods.forEach((food)=>{
        food.ingredient = convertArrayToObject(food.ingredient)        
        DM += food.amount * food.ingredient["DM"]/100
        ME += food.amount * food.ingredient["DM"]/100 * food.ingredient["ME"]
        //  CP = amount * DM/100 * CP/100 * 1000 = amount * DM * CP * 0.1
        CP += food.amount * food.ingredient["DM"] * food.ingredient["CP"] * 0.1
    })    
    return { "DM": parseFloat(DM), "ME": parseFloat(ME.toFixed(2)), "CP": parseFloat(CP.toFixed(2))}
}

function compareNutrition(foods, nutrition){        
    console.log("dm", Math.abs(foods["DM"] - nutrition["DM"]), nutrition["DM"]*0.1)
    if(Math.abs(foods["DM"] - nutrition["DM"]) > nutrition["DM"]*0.1)
        return false
    console.log("ME", Math.abs(foods["ME"] - nutrition["ME"]), nutrition["ME"]*0.1)
    if(Math.abs(foods["ME"] - nutrition["ME"]) > nutrition["ME"]*0.1)
        return false
    console.log("CP", Math.abs(foods["CP"] - nutrition["CP"]), nutrition["CP"]*0.1)
    if(Math.abs(foods["CP"] - nutrition["CP"]) > nutrition["CP"]*0.1)
        return false
    return true
}


module.exports = {
    calcNutrition,
    compareNutrition
}