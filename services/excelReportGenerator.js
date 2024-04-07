const ExcelJS = require('exceljs');

async function generateExcelReports(reportData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
        { 
            header: 'Order Date', 
            key: 'orderDate', 
            width: 15,
            outlineLevel: 1,
            type: 'date',
            style: { numFmt: 'dd/mm/yyyy' }
        },
        { header: 'Order ID', key: 'orderId', width: 15 },
        { header: 'Total Amount', key: 'totalAmount', width: 15 },
        { header: 'Discounted Amount', key: 'totalAmountAfterDiscount', width: 15 },
        { header: 'Order Status', key: 'orderStatus', width: 15 },
        { header: 'Payment Status', key: 'paymentStatus', width: 15 }
    ];

    reportData.forEach(order => {
        worksheet.addRow({
            orderDate: order.createdDate,
            orderId: order.pkOrderId,
            totalAmount: order.intTotalOrderPrice,
            totalAmountAfterDiscount: order.totalAmountAfterDiscount,
            orderStatus:order.strOrderStatus,
            paymentStatus:order.strPaymentStatus,
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}

module.exports = generateExcelReports;
