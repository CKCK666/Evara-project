const Order = require('../models/orderModel');
const generatePDFReports = require('../services/pdfReportGenerator');
const generateExcelReports = require('../services/excelReportGenerator');
const generateInvoice= require('../services/invoiceGenerator');
const { ObjectId } = require('mongodb');

// app.get('/api/download-pdf', 
const generatePDFReport = async (req, res) => {
  console.log(req.query);
  try {
      const currentDate = new Date();
      let start, end;
      let matchQuery = { strPaymentStatus: "Success" };

      // Handle different sorting queries
      if (req.query.sort === '30days') {
          matchQuery.createdDate = { $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) };
          start = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 30).toLocaleDateString('en-GB');
          end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).toLocaleDateString('en-GB');
      } else if (req.query.sort === 'monthly') {
      
          const thirtyDaysAgo = new Date(currentDate);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          matchQuery.createdDate = { $gte: thirtyDaysAgo, $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1) };
          start = thirtyDaysAgo.toLocaleDateString('en-GB');
          end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).toLocaleDateString('en-GB');
      } else if (req.query.sort === 'yearly') {
        
          matchQuery.createdDate = {
              $gte: new Date(currentDate.getFullYear(), 0, 1),
              $lt: new Date(currentDate.getFullYear() + 1, 0, 1)
          };
          start = new Date(currentDate.getFullYear(), 0, 1).toLocaleDateString('en-GB');
          end = new Date(currentDate.getFullYear() + 1, 0, 1).toLocaleDateString('en-GB');
          console.log(start,end)

      } else if (req.query.start && req.query.end) {
          start = req.query.start;
          end = req.query.end;

          const startDate = new Date(start);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999);

          matchQuery.createdDate = {
              $gte: startDate,
              $lte: endDate
          };
      }

      // Fetch orders based on matchQuery
      let findOrder = await Order.find({ ...matchQuery }).sort({ createdDate: -1 });

      // Map orders to desired format
      let salesOrder = findOrder.map(order => ({ ...order._doc }));

      // Generate PDF report
      const { filename, pdfBuffer } = await generatePDFReports(salesOrder, start, end);
      res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-type', 'application/pdf');
      res.send(pdfBuffer);

  } catch (error) {
      console.error('Error generating PDF report:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};



const generateExcelReport = async (req, res) => {
  
    try {
     
      const currentDate = new Date();
      let start, end;
      let matchQuery = { strPaymentStatus: "Success" };

      // Handle different sorting queries
      if (req.query.sort === '30days') {
          matchQuery.createdDate = { $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) };
          start = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 30).toLocaleDateString('en-GB');
          end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).toLocaleDateString('en-GB');
      } else if (req.query.sort === 'monthly') {
      
          const thirtyDaysAgo = new Date(currentDate);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          matchQuery.createdDate = { $gte: thirtyDaysAgo, $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1) };
          start = thirtyDaysAgo.toLocaleDateString('en-GB');
          end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).toLocaleDateString('en-GB');
      } else if (req.query.sort === 'yearly') {
        console.log("yearrara jherrr");
          matchQuery.createdDate = {
              $gte: new Date(currentDate.getFullYear(), 0, 1),
              $lt: new Date(currentDate.getFullYear() + 1, 0, 1)
          };
          start = new Date(currentDate.getFullYear(), 0, 1).toLocaleDateString('en-GB');
          end = new Date(currentDate.getFullYear() + 1, 0, 1).toLocaleDateString('en-GB');
          console.log(start,end)

      } else if (req.query.start && req.query.end) {
          start = req.query.start;
          end = req.query.end;

          const startDate = new Date(start);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999);

          matchQuery.createdDate = {
              $gte: startDate,
              $lte: endDate
          };
      }

      // Fetch orders based on matchQuery
      let findOrder = await Order.find({ ...matchQuery }).sort({ createdDate: -1 });
  
     let salesOrder=findOrder.map((order)=>{
          return{
           ...order._doc
          }
     })

      const excelBuffer = await generateExcelReports(salesOrder);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="sales-report.xlsx"');
      res.send(excelBuffer);
    } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
 
const printInvoice = async (req, res) => {

      try {
  
        const orderId = new ObjectId(req.query.orderId)
       
        const orderData = await Order.aggregate([{$match:{pkOrderId:orderId}}])
        

        const { fileName, pdfBuffer } = await generateInvoice(orderData[0]);
          res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
          res.setHeader('Content-type', 'application/pdf');
          res.send(pdfBuffer);
  
  } catch (error) {
    console.log(error);
      console.error('Error generating PDF report:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
  }


module.exports = { generatePDFReport, generateExcelReport,printInvoice };