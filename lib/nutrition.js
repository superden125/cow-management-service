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
    let listFood = JSON.parse(JSON.stringify(foods))
    let DM = 0, ME = 0, CP=0, P = 0, Ca = 0
    listFood.forEach((food)=>{
        food.ingredient = convertArrayToObject(food.ingredient)        
        DM += food.amount * food.ingredient["DM"]/100
        ME += food.amount * food.ingredient["DM"]/100 * food.ingredient["ME"]
        //  CP = amount * DM/100 * CP/100 * 1000 = amount * DM * CP * 0.1
        CP += food.amount * food.ingredient["DM"] * food.ingredient["CP"] * 0.1
        P += food.amount * food.ingredient["P"] * food.ingredient["P"] * 0.1
        Ca += food.amount * food.ingredient["Ca"] * food.ingredient["Ca"] * 0.1
    })    
    return { 
        "DM": parseFloat(DM), 
        "ME": parseFloat(ME.toFixed(2)),
        "CP": parseFloat(CP.toFixed(2)),
        "P": parseFloat(P.toFixed(2)),
        "Ca": parseFloat(Ca.toFixed(2))
    }
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

function mixFood(foods, nutritionGlobal){        
    let listFood = JSON.parse(JSON.stringify(foods))
    let totalME = nutritionGlobal['ME'] / nutritionGlobal["DM"]
    let totalCP = nutritionGlobal['CP'] / nutritionGlobal["DM"]
    let listFood0 = listFood.filter(x => x.type == '0')
    let listFood1 = listFood.filter(x => x.type == '1')
    listFood0.forEach((food)=>{
        food.ingredient = convertArrayToObject(food.ingredient)
    })
    listFood1.forEach((food)=>{
        food.ingredient = convertArrayToObject(food.ingredient)
    })
    let resultME = pearsonSquare(listFood0[0].ingredient["ME"], listFood0[1].ingredient["ME"], totalME)

    listFood0[0].ratio = resultME[0]
    listFood0[1].ratio = resultME[1]    
    //CP = %DM * %CP * 1000 = DM * CP * 0.1
    let currentCP = (listFood0[0].ratio*100 * listFood0[0].ingredient["CP"] + listFood0[1].ratio*100 * listFood0[1].ingredient["CP"])*0.1
    if(currentCP < totalCP){    
        let resultCP = pearsonSquare(currentCP, listFood1[0].ingredient["CP"]*10, totalCP)
        listFood0[0].ratio = listFood0[0].ratio * resultCP[0]
        listFood0[1].ratio = listFood0[1].ratio * resultCP[0]
        listFood1[0].ratio = resultCP[1]
    }
    listFood0.forEach((food)=>{
        let amount = food.ratio * nutritionGlobal["DM"] / food.ingredient['DM'] * 100
        food.amount = amount ? parseFloat(amount.toFixed(2)) : 0
        food.ratio = parseFloat(food.ratio.toFixed(2))
        delete food.ingredient
        // listFood.find(x => x._id == food._id).amount = parseFloat(amount.toFixed(2))
    })    
    listFood1.forEach((food)=>{
        let amount = food.ratio * nutritionGlobal["DM"] / food.ingredient['DM'] * 100
        food.amount = amount ? parseFloat(amount.toFixed(2)) : 0
        food.ratio = parseFloat(food.ratio.toFixed(2))
        delete food.ingredient
        // listFood.find(x => x._id == food._id).amount = parseFloat(amount.toFixed(2))
    })

    // console.log("list mix", listFood)
    return listFood
}


function pearsonSquare(a, b, target){    
    // console.log("a -b - target", a, b , target)
    let b1 = Math.abs(target - a)
    let a1 = Math.abs(target - b)
    let total = a1 + b1
    return [ a1/total, b1/total]
}
module.exports = {
    calcNutrition,
    compareNutrition,
    mixFood
}