
const PDFDocument = require('pdfkit');


async function generateInvoice(orderData) {
  return new Promise((resolve, reject) => {
      try {

        function generateInvoiceNumber() {
          const currentDate = orderData.createdDate;
          const year = currentDate.getFullYear();
          const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); 
          const day = ('0' + currentDate.getDate()).slice(-2); 
          const uniqueNumber = Math.floor(Math.random() * 10000); 
      
 
          const invoiceNumber = `INV-${year}${month}${day}-${uniqueNumber}`;
          return invoiceNumber;
      }
// let companyLogo = "public/user/imgs/theme/logo.svg";
let fileName = `${orderData.pkOrderId}.pdf`;
let fontNormal = 'Helvetica';
let fontBold = 'Helvetica-Bold';
const options = {
  hour12: true,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Kolkata',
  timeZoneName: 'short'
};
let date = new Date()

let sellerInfo = {
"companyName": "Evara",
"address": "Mumbai Central",
"city": "Mumbai",
"state": "Maharashtra",
"pincode": "400017",
"country": "India",
"contactNo": "+910000000600"
}





let pdfDoc = new PDFDocument();

// pdfDoc.image(companyLogo, 10, 20, { width: 100, height: 50 });
pdfDoc.font(fontBold).text('Evara', 7, 75);
pdfDoc.font(fontNormal).fontSize(14).text('Order Invoice/Bill Receipt', 400, 30, { width: 200 });
pdfDoc.fontSize(10).text(date.toLocaleDateString(), 400, 46, { width: 200 });

pdfDoc.font(fontBold).text("Sold by:", 7, 100);
pdfDoc.font(fontNormal).text(sellerInfo.companyName, 7, 115, { width: 250 });
pdfDoc.text(sellerInfo.address, 7, 130, { width: 250 });
pdfDoc.text(sellerInfo.city + " " + sellerInfo.pincode, 7, 145, { width: 250 });
pdfDoc.text(sellerInfo.state + " " + sellerInfo.country, 7, 160, { width: 250 });

pdfDoc.font(fontBold).text("Customer details:", 400, 100);
pdfDoc.font(fontNormal).text(orderData.arrDeliveryAddress[0].strFullName, 400, 115, { width: 250 });
pdfDoc.text(orderData.arrDeliveryAddress[0].strArea, 400, 130, { width: 250 });
pdfDoc.text(orderData.arrDeliveryAddress[0].strCity + " " + orderData.arrDeliveryAddress[0].intPinCode, 400, 145, { width: 250 });
pdfDoc.text(orderData.arrDeliveryAddress[0].strState + " " + "India", 400, 160, { width: 250 });

pdfDoc.text("Order No:" + orderData.pkUserId, 7, 195, { width: 250 });
pdfDoc.text("Invoice No:" + generateInvoiceNumber(), 7, 210, { width: 250 });
pdfDoc.text("Date:" + orderData.createdDate.toLocaleDateString() + " " + orderData.createdDate.toLocaleTimeString('en-IN', options), 7, 225, { width: 250 });

pdfDoc.rect(7, 250, 560, 20).fill("#427BFC").stroke("#427BFC");
pdfDoc.fillColor("#fff").text("ID", 20, 256, { width: 90 });
pdfDoc.text("Product", 110, 256, { width: 190 });
pdfDoc.text("Qty", 300, 256, { width: 100 });
pdfDoc.text("Price", 350, 256, { width: 100 });
pdfDoc.text("Offer Price", 420, 256, { width: 100 });
pdfDoc.text("Total Price", 500, 256, { width: 100 });

let productNo = 1;
orderData.arrProductsDetails.forEach((product ,index)=> {
console.log("adding", product.strProductName);
let y = 256 + (productNo * 20);
pdfDoc.fillColor("#000").text(index, 20, y, { width: 90 });
pdfDoc.text(product.strProductName, 110, y, { width: 190 });
pdfDoc.text(product.intQuantity, 300, y, { width: 100 });
pdfDoc.text(product.intPrice.toFixed(2), 350, y, { width: 100 });
pdfDoc.text((product.offerPrice?product.offerPrice:product.intPrice).toFixed(2), 420, y, { width: 100 });
pdfDoc.text((product.intPrice*product.intQuantity).toFixed(2), 500, y, { width: 100 });
productNo++;
});

pdfDoc.rect(7, 256 + (productNo * 20), 560, 0.2).fillColor("#000").stroke("#000");
productNo++;

pdfDoc.font(fontNormal).text("Total:", 400, 256 + (productNo * 17));
pdfDoc.font(fontNormal).text(orderData.intTotalOrderPrice.toFixed(2), 500, 256 + (productNo * 17));

pdfDoc.font(fontNormal).text("Gst", 400, 271 + (productNo * 17));
pdfDoc.font(fontNormal).text((`+${orderData.gst.toFixed(2)}`), 500, 271 + (productNo * 17));

pdfDoc.font(fontNormal).text("couponDiscount", 400, 286 + (productNo * 17));
pdfDoc.font(fontNormal).text((orderData.couponDiscount > 0 ? `-${orderData.couponDiscount.toFixed(2)}` : orderData.couponDiscount.toFixed(2)), 500, 286 + (productNo * 17));

pdfDoc.font(fontNormal).text("offer Discount", 400, 301 + (productNo * 17));
pdfDoc.font(fontNormal).text((orderData.totalDiscount > 0 ? `-${orderData.totalDiscount.toFixed(2)}` : orderData.totalDiscount.toFixed(2)), 500, 301 + (productNo * 17));

pdfDoc.font(fontNormal).text("wallet Cash Used", 400, 316 + (productNo * 17));
pdfDoc.font(fontNormal).text((orderData.walletCashUsed > 0 ? `-${orderData.walletCashUsed.toFixed(2)}` : orderData.walletCashUsed.toFixed(2)), 500, 316 + (productNo * 17));



pdfDoc.lineWidth(1);
pdfDoc.moveTo(390, 331 + (productNo * 17)).lineTo(550, 331 + (productNo * 17)) .stroke();
pdfDoc.font(fontBold).text("Grand total:", 400, 341+ (productNo * 17));
pdfDoc.font(fontBold).text(orderData.totalAmountAfterDiscount.toFixed(2), 500, 341 + (productNo * 17));

const chunks = [];
            pdfDoc.on('data', (chunk) => {
                chunks.push(chunk);
            });
            pdfDoc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve({ fileName, pdfBuffer });
            });

pdfDoc.end();
console.log("pdf generate successfully");


} catch (error) {
  reject(error);
}
});
}

module.exports = generateInvoice;