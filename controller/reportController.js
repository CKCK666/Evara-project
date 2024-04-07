const Order = require('../models/orderModel');
const generatePDFReports = require('../services/pdfReportGenerator');
const generateExcelReports = require('../services/excelReportGenerator');


// app.get('/api/download-pdf', 
const generatePDFReport = async (req, res) => {
console.log(req.query);
    try {

        const currentDate = new Date();
        let start
        let end
        let matchQuery={}
    
        if(req.query.sort=='daily'){
            matchQuery={
              createdDate: {
                $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
              }
            }
            start=new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toLocaleDateString()
            end=new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).toLocaleDateString()
        }
         if(req.query.sort=='weekly'){
          const sevenDaysAgo = new Date(currentDate);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          matchQuery={
             createdDate: { $gte: sevenDaysAgo, $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) } 
          }
          start= sevenDaysAgo.toLocaleDateString()
          end=new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toLocaleDateString()
        }
    
        if(req.query.sort=='yearly'){
          matchQuery={
          createdDate: {
            $gte: new Date(currentDate.getFullYear(), 0, 1), // Start of the current year
            $lt: new Date(currentDate.getFullYear() + 1, 0, 1) // Start of the next year
        }}
         start=new Date(currentDate.getFullYear(), 0, 1).toLocaleDateString()
         end= new Date(currentDate.getFullYear() + 1, 0, 1).toLocaleDateString()

        }
        if(req.query.start && req.query.end ){
           start = req.query.start
     end= req.query.end
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    endDate.setHours(23, 59, 59, 999); 
    
    matchQuery={
      createdDate: {
        $gte:startDate,
        $lte: endDate
    }}
    
    
        }
    
         
        
        let findOrder=await Order.find({
        ...matchQuery
        }).sort({createdDate:-1})
    
       let salesOrder=findOrder.map((order)=>{
            return{
             ...order._doc
            }
       })
    
      const { filename, pdfBuffer } = await generatePDFReports(salesOrder, start, end);
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
        res.send(pdfBuffer);

} catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
}
}


const generateExcelReport = async (req, res) => {
  
    try {
     
      const currentDate = new Date();
      let start
      let end
      let matchQuery={}
  
      if(req.query.sort=='daily'){
          matchQuery={
            createdDate: {
              $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
              $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
          }
          start=new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toLocaleDateString()
          end=new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).toLocaleDateString()
      }
       if(req.query.sort=='weekly'){
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchQuery={
           createdDate: { $gte: sevenDaysAgo, $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) } 
        }
        start= sevenDaysAgo.toLocaleDateString()
        end=new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toLocaleDateString()
      }
  
      if(req.query.sort=='yearly'){
        matchQuery={
        createdDate: {
          $gte: new Date(currentDate.getFullYear(), 0, 1), // Start of the current year
          $lt: new Date(currentDate.getFullYear() + 1, 0, 1) // Start of the next year
      }}
       start=new Date(currentDate.getFullYear(), 0, 1).toLocaleDateString()
       end= new Date(currentDate.getFullYear() + 1, 0, 1).toLocaleDateString()

      }
      if(req.query.start && req.query.end ){
         start = req.query.start
   end= req.query.end
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  endDate.setHours(23, 59, 59, 999); 
  
  matchQuery={
    createdDate: {
      $gte:startDate,
      $lte: endDate
  }}
  
  
      }
  
       
      
      let findOrder=await Order.find({
      ...matchQuery
      }).sort({createdDate:-1})
  
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
 



module.exports = { generatePDFReport, generateExcelReport };