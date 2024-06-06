const PDFDocument = require('pdfkit');
const moment = require('moment');

async function generatePDFReports(reportData, startDate, endDate) {
    return new Promise((resolve, reject) => {
        try {
            const pdfDoc = new PDFDocument();
            const filename = `sales-report-${moment().format('YYYY-MM-DD')}.pdf`;

            pdfDoc.text("Order Report", { align: "center" });
            pdfDoc.moveDown();
            if(startDate && endDate){
                pdfDoc.text(`Report from ${startDate} to ${endDate}`, { align: "center" });
            }

            
          
            pdfDoc.moveDown();

            pdfDoc.text("Seller Information:");
            pdfDoc.text(`Company Name: Evara`);
            pdfDoc.text(`Address: Ernakulam`);
            pdfDoc.text(`Contact No: +919999999999`);
            pdfDoc.moveDown();
            let fontBold = 'Helvetica-Bold';
            pdfDoc.text("Orders:");
            pdfDoc.fontSize(10);
            let startY = pdfDoc.y + 15;
            let rowHeight = 20;
            let totalAmountAfterDiscount=0
            // Headers
            pdfDoc.text("No", 50, startY);
            pdfDoc.text("Order Id", 75, startY);
            pdfDoc.text("Order Date", 220, startY);
            pdfDoc.text("Amount", 275, startY);
            pdfDoc.text("Order Amount", 330, startY);
            pdfDoc.text("Order Status", 400, startY);
            pdfDoc.text("Payment Status", 470, startY);

            // Data
            startY += rowHeight;
            reportData.forEach((orderInfo, index) => {
                totalAmountAfterDiscount+=orderInfo.totalAmountAfterDiscount
                let createdDate=orderInfo.createdDate.toLocaleDateString()
                pdfDoc.text(`${index + 1}`, 50, startY);
                pdfDoc.text(`${orderInfo.pkOrderId}`, 75, startY);
                pdfDoc.text(`${createdDate}`, 225, startY);
                pdfDoc.text(`${orderInfo.intTotalOrderPrice.toFixed(2)}`, 275, startY);
                pdfDoc.text(`${orderInfo.totalAmountAfterDiscount.toFixed(2)}`, 335, startY);
                pdfDoc.text(`${orderInfo.strOrderStatus}`, 400, startY);
                pdfDoc.text(`${orderInfo.strPaymentStatus}`, 470, startY);

                startY += rowHeight;
            });

            pdfDoc.moveDown();
            pdfDoc.moveDown();
            pdfDoc.font(fontBold).text("Total Revenue:", 450,startY);
            pdfDoc.font(fontBold).text(totalAmountAfterDiscount.toFixed(2), 560, startY);
            pdfDoc.font(fontBold).text("Total Discount:", 450,startY+40);
            pdfDoc.font(fontBold).text(totalAmountAfterDiscount.toFixed(2)-5600, 560, startY+40);
            // const totalValue = reportData.reduce((acc, value) => acc + value.totalAmountAfterDiscount, 0);
            // pdfDoc.fontSize(12).text(`Total Value: ${totalValue.toFixed(2)}`, 420, startY, { bold: true });

            // Generate the PDF and resolve the promise when done
            const chunks = [];
            pdfDoc.on('data', (chunk) => {
                chunks.push(chunk);
            });
            pdfDoc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve({ filename, pdfBuffer });
            });
            pdfDoc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = generatePDFReports;
