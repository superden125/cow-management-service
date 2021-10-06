const path = require('path')
const {formatDate} = require('./date')

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
            {text: `Giống bò: ${data.cowBreedName}`, style: 'space'}            
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

    if(data.periods.length > 0){
        data.periods.forEach((period)=>{
            let bodyPeriod = [
                {text: `Giai đoạn: ${period.name}`, lineHeight: 1.5}                
            ]
            if(period.foods && period.foods.length > 0){
                bodyPeriod.push(
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

                period.foods.forEach((food)=>{
                    bodyPeriod[1].table.body.push([ food.name, food.amount, food.unit ])
                })
            }else{
                bodyPeriod.push(
                    {text: "Chưa có khẩu phần ăn"},
                    {text: " ", lineHeight: 1.5}
                )
            }
            docDefinition.content.push(bodyPeriod)
        })
    }

    // Building the PDF
    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    return pdfDoc
    // // Writing it to disk
    // pdfDoc.pipe(fs.createWriteStream('document.pdf'));
    // pdfDoc.end();
    
}

module.exports = {
    convertJsonToPDF
}
// convertJsonToPDF(data)