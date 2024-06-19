const PDFDocument = require('pdfkit');
const moment = require('moment');
const fs = require('fs');

async function generatePDFReports(reportData, startDate, endDate) {
    return new Promise((resolve, reject) => {
        try {
            const pdfDoc = new PDFDocument();
            const filename = `sales-report-${moment().format('YYYY-MM-DD')}.pdf`;

            // Set up PDF document
            pdfDoc.font('Helvetica');
            pdfDoc.text("Order Report", { align: "center" });
            pdfDoc.moveDown();
            if (startDate && endDate) {
                pdfDoc.text(`Report from ${startDate} to ${endDate}`, { align: "center" });
            }

            pdfDoc.moveDown();
            pdfDoc.text("Seller Information:");
            pdfDoc.text(`Company Name: Evara`);
            pdfDoc.text(`Address: Ernakulam`);
            pdfDoc.text(`Contact No: +919999999999`);
            pdfDoc.moveDown(2);

            // Table settings
            const headers = ["No", "Order Id", "Order Date", "Amount", "After Discount", "Payment Status"];
            const columnWidths = [25, 100, 100, 75, 100, 100]
            let startX = 40;
            let startY = pdfDoc.y+20;
            let rowHeight = 25;

            // Draw table headers
            pdfDoc.font('Helvetica-Bold');
            headers.forEach((header, i) => {
                pdfDoc.text(header, startX, startY-10, { width: columnWidths[i], align: 'center' });
                startX += columnWidths[i];
            });

            // Draw table header border
            drawTableBorders(pdfDoc, 40, startY, rowHeight, columnWidths);

            // Table Rows
            pdfDoc.font('Helvetica');
            startY += rowHeight;
            let totalAmountAfterDiscount = 0;
            let totalAmountBeforeDiscount=0

            reportData.forEach((orderInfo, index) => {
                totalAmountAfterDiscount += orderInfo.totalAmountAfterDiscount;
                totalAmountBeforeDiscount+=  orderInfo.intTotalOrderPrice
                let createdDate = new Date(orderInfo.createdDate).toLocaleDateString();
                startX = 40;

                const row = [
                    index + 1,
                    orderInfo.orderId || "N/A",
                    createdDate,
                    orderInfo.intTotalOrderPrice.toFixed(2),
                    orderInfo.totalAmountAfterDiscount.toFixed(2),
                    orderInfo.strPaymentStatus
                ];

                row.forEach((cell, i) => {
                    pdfDoc.text(cell.toString(), startX, startY-10, { width: columnWidths[i], align: 'center' });
                    startX += columnWidths[i];
                });

                drawTableBorders(pdfDoc, 40, startY, rowHeight, columnWidths);
                startY += rowHeight;
            });

            // Total Summary
            pdfDoc.moveDown(2);
            pdfDoc.font('Helvetica-Bold').text("Total Amount:", 390, startY);
            pdfDoc.text(totalAmountBeforeDiscount.toFixed(2), 480, startY);
           

            pdfDoc.moveDown(2);
            pdfDoc.font('Helvetica-Bold').text("Total Revenue:", 390, startY+40);
            pdfDoc.text(totalAmountAfterDiscount.toFixed(2), 480, startY+40);
            
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
})}

function drawTableBorders(doc, startX, startY, rowHeight, columnWidths) {
let x = startX;
columnWidths.forEach((width) => {
doc.rect(x, startY - rowHeight + 2.5 , width , rowHeight).stroke();
x += width;
});
}

module.exports = generatePDFReports;
