const path = require('path')
const {formatDate, formatDate2} = require('./date')

var fonts = {
    Roboto: {
      normal: path.join(__dirname, '..', 'public', '/fonts/Roboto-Regular.ttf'),
      bold: path.join(__dirname, '..', 'public', '/fonts/Roboto-Medium.ttf'),
      italics: path.join(__dirname, '..', 'public', '/fonts/Roboto-Italic.ttf'),
      bolditalics: path.join(__dirname, '..', 'public', '/fonts/Roboto-MediumItalic.ttf')
    }
  };
  
  var PdfPrinter = require('pdfmake');
  var printer = new PdfPrinter(fonts);
  var fs = require('fs');

let data = {
    "cowBreedName": "Bò vàng Việt Nam",
    "periods": [
        {
            "_id": "612126315b297a50b30bb312",
            "serial": 1,
            "name": "Bò sơ sinh",
            "foods": [
                {
                    "idFood": "61210c3ebf9a4cf4b571d0d1",
                    "amount": 44,
                    "name": "Đậu phộng",
                    "unit": "g"
                },
                {
                    "idFood": "61210c3ebf9a4cf4b571d0d1",
                    "amount": 123,
                    "name": "Đậu phộng",
                    "unit": "g"
                }
            ]
        },
        {
            "_id": "61533a83cc3d8500388284b6",
            "serial": 2,
            "name": "Bò dậy thì",
            "foods": [
                {
                    "idFood": "61210c3ebf9a4cf4b571d0d1",
                    "amount": 20,
                    "name": "Đậu phộng",
                    "unit": "g"
                },
                {
                    "idFood": "612267b8596319f4761a2bca",
                    "amount": 25,
                    "name": "Đậu Xanh",
                    "unit": "g"
                },
                {
                    "idFood": "612267c5596319f4761a2bcb",
                    "amount": 49,
                    "name": "Cỏ mỹ",
                    "unit": "g"
                }
            ]
        },
        {
            "_id": "61533aa4cc3d8500388284b7",
            "serial": 3,
            "name": "Bò vị thành niên",
            "foods": [
                {
                    "idFood": "61210c3ebf9a4cf4b571d0d1",
                    "amount": 30,
                    "name": "Đậu phộng",
                    "unit": "g"
                },
                {
                    "idFood": "612267b8596319f4761a2bca",
                    "amount": 60,
                    "name": "Đậu Xanh",
                    "unit": "g"
                },
                {
                    "idFood": "612267c5596319f4761a2bcb",
                    "amount": 30,
                    "name": "Cỏ mỹ",
                    "unit": "g"
                }
            ]
        }
    ]
}

let data2 = {
    "cowBreedName": "Bò vàng Việt Nam",
    "areaName": "Châu Đốc, An Giang",
    "items": [
        {
            "_id": "61685dc70c0e708424104896",
            "idArea": "611fd8e4ba4496abd1055790",
            "idPeriod": "61473ebaec6a7e24db455e58",
            "foods": [
                {
                    "idFood": "612267b8596319f4761a2bca",
                    "amount": 12,
                    "name": "Đậu Xanh",
                    "unit": "g"
                },
                {
                    "idFood": "612267c5596319f4761a2bcb",
                    "amount": 50,
                    "name": "Cỏ mỹ",
                    "unit": "g"
                },
                {
                    "idFood": "612b45240af7eb272c8d9eda",
                    "amount": 23,
                    "name": "Khoai lang",
                    "unit": "kg"
                }
            ],
            "createdAt": 1634229703707,        
            "periodName": "Bò sơ sinh",
            "idCowBreed": "611fe13b4a45a8f816990d93",
            "areaName": "Châu Đốc, An Giang",
            "cowBreedName": "Bò nam phi"
        },
        {
            "_id": "61685dc70c0e708424104896",
            "idArea": "611fd8e4ba4496abd1055790",
            "idPeriod": "61473ebaec6a7e24db455e58",
            "foods": [
                {
                    "idFood": "612267b8596319f4761a2bca",
                    "amount": 12,
                    "name": "Đậu Xanh",
                    "unit": "g"
                },
                {
                    "idFood": "612267c5596319f4761a2bcb",
                    "amount": 50,
                    "name": "Cỏ mỹ",
                    "unit": "g"
                },
                {
                    "idFood": "612b45240af7eb272c8d9eda",
                    "amount": 23,
                    "name": "Khoai lang",
                    "unit": "kg"
                }
            ],
            "createdAt": 1634229703707,        
            "periodName": "Bò sơ sinh",
            "idCowBreed": "611fe13b4a45a8f816990d93",
            "areaName": "Châu Đốc, An Giang",
            "cowBreedName": "Bò nam phi"
        }
    ]
}

function convertJsonToPDF(data){    
    var docDefinition = {
        styles: {
            header: {
              fontSize: 22,
              bold: true
            },
            space: {
                lineHeight : 2
            }
        },
        content: [
            {text: 'Khẩu phần ăn tiêu chuẩn', style: 'header', alignment: 'center'},
            {text: " ", style: 'space'},
            {text: `Giống bò: ${data.cowBreedName}`, style: 'space'},        
            {text: `Khu vực: ${data.areaName}`, style: 'space'}            
            // {
            //     //layout: 'lightHorizontalLines', // optional
            //     table: {              
            //         headerRows: 1,
            //         widths: [ '*', 'auto', 100],
            
            //         body: [
            //                 [   
            //                     {text: 'Tên thức ăn', alignment: 'center', bold: true}, 
            //                     {text: 'Số lượng', alignment: 'center', bold: true}, 
            //                     {text: 'Đơn vị', alignment: 'center', bold: true}
            //                 ],
            //                 [ 'Value 1', 'Value 2', 'Value 3'],
            //                 [ 'Value 1', 'Value 2', 'Value 3'],
            //                 [ 'Value 1', 'Value 2', 'Value 3'],
            //                 [ 'Value 1', 'Value 2', 'Value 3']
            //             ]
            //     }
            // }
        ],
        footer: {
            text: `${formatDate()}`, alignment: 'right', margin:  [ 0, 0, 20, 0]
        },
    };

    if(data.items.length > 0){
        data.items.forEach((meal)=>{
            let bodyMeal = [
                {text: `Giai đoạn: ${meal.periodName} - Ngày tạo khẩu phần ăn: ${formatDate2(meal.createdAt)}`, lineHeight: 1.5}
            ]
            if(meal.foods && meal.foods.length > 0){
                bodyMeal.push(
                    {
                        //layout: 'lightHorizontalLines', // optional
                        table: {              
                            headerRows: 1,
                            widths: [ '*', 'auto', 100],
                    
                            body: [
                                    [   
                                        {text: 'Tên thức ăn', alignment: 'center', bold: true}, 
                                        {text: 'Số lượng', alignment: 'center', bold: true}, 
                                        {text: 'Đơn vị', alignment: 'center', bold: true}
                                    ]
                                ]
                        }
                    },
                    {text: " ", lineHeight: 1.5}
                )

                meal.foods.forEach((food)=>{
                    bodyMeal[1].table.body.push([ food.name, food.amount, food.unit ])
                })
            }else{
                bodyMeal.push(
                    {text: "Chưa có khẩu phần ăn"},
                    {text: " ", lineHeight: 1.5}
                )
            }
            docDefinition.content.push(bodyMeal)
        })
    }

    // Building the PDF
    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    return pdfDoc
    // Writing it to disk
    // pdfDoc.pipe(fs.createWriteStream('document.pdf'));
    // pdfDoc.end();
    
}

module.exports = {
    convertJsonToPDF
}
// convertJsonToPDF(data2)