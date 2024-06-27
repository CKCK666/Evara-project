
(function ($) {
    "use strict";
 
  
     if ($('#myChart').length>0) {
        $.ajax({
            url: `/admin/api/statistics`,
      method: 'GET',
      success: function(response) {
          const data = response.data
         
            // Process data as needed
            const totalAmounts = data.map(order => order.totalAmount);
            const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);
            const totalOrders = data.map(order => order.totalOrders);
            const orderIds = data.map(order => {
                const date = new Date(order.date);
                const day = ('0' + date.getDate()).slice(-2);
                const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            });

            let num=1
            const orders=response.orders
            const currentPage=response.currentPage
            const totalPages=response.totalPages
            const skip=response.skip
        //render table
            generateSaleTable(orders,num,currentPage,totalPages,skip)


            // Render the chart
            renderChart(orderIds, totalAmounts,totalAmountsAfterDiscount,totalOrders);
          
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', error);
        }
    });
     
    }   
    
    if ($('#topCategories').length>0) {
        $.ajax({
            url: '/admin/api/topCategories',
      method: 'GET',
      success: function(response) {
          const data = response.data
        
            // Process data as needed
            const categoryName = data.map(order => order.categoryName);
            const totalSold = data.map(order => order.totalSold);
           

            // Render the chart
            renderPieChartCate(categoryName, totalSold);
          
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', error);
        }
    });
     
    }   
    if ($('#topProducts').length>0) {
        $.ajax({
            url: '/admin/api/topProducts',
      method: 'GET',
      success: function(response) {
          const data = response.data
           
            // Process data as needed
            const productName = data.map(order => order.productName);
            const totalSold = data.map(order => order.totalSold);
           

            // Render the chart
            renderPieChartPro( productName, totalSold);
          
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', error);
        }
    });
     
    }  
    function renderChart(labels, values,values2,values3) {
        try {
            // Get the canvas element
            const ctx = document.getElementById('myChart').getContext('2d');
      
            // Create the chart
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Total sales',
                        data: values,
                        tension: 0.3,
                            fill: true,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Adjust color if needed
                        borderColor: 'rgba(54, 162, 235, 1)' , // Adjust color if needed
                    
                    },
                    {
                        label: 'Total Amount After Discount',
                        data: values2,
                        tension: 0.3,
                            fill: true,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Adjust color if needed
                        borderColor: 'rgba(255, 99, 132, 1)', // Adjust color if needed
                    
                    },
                    {
                        label: 'Total orders',
                        data: values3,
    
                        tension: 0.3,
                            fill: true,
                            backgroundColor: 'rgba(4, 209, 130, 0.2)',
                            borderColor: 'rgb(4, 209, 130)',
                    }]
                },
                
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering chart:', error);
        }
      }
      function renderPieChartCate(labels, values) {
        const ctx = document.getElementById('topCategories').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        'red',
                    'blue',
                    'green',
                    'orange',
                    'purple', // Add more colors as needed
                    'yellow',
                    'cyan',
                    'magenta',
                    'brown'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
      }

      function renderPieChartPro(labels, values) {
        const ctx = document.getElementById('topProducts').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        'red',
                    'blue',
                    'green',
                    'orange',
                    'purple', // Add more colors as needed
                    'yellow',
                    'cyan',
                    'magenta',
                    'brown'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
      }
    
})(jQuery);

Handlebars.registerHelper('paginate', function(currentPage, totalPages ,num) {
    let result = '';
    let status=''
   
   if(num==1){
    status='dailyStat'
   }
   else if(num==2){
    status='monthlyStat'
   }
   else if(num==3){
    status='yearlyStat'
   }else{
    status='customStat'
   }
    // Generate page links
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        result += `<li onclick=${status}(${i}) class='page-item active'><span class='page-link'>${i}</span></li>`;
      } else {
        result += `<li onclick=${status}(${i}) class='page-item'><a class='page-link'>${i}</a></li>`;
      }
    }
  

  
    return new Handlebars.SafeString(result);
  });

  





    //monthly
  function monthlyStat (obj) {
    let page=typeof obj==Object?obj.page :obj
 
    {
     $.ajax({
         url: `/admin/api/statistics/monthly?page=${page}`,
   method: 'GET',
   success: function(response) {
       console.log(response);
       const data = response.data
   
         // Process data as needed
         const totalAmounts = data.map(order => order.totalAmount);
         const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);

        const orderIds = data.map(order => {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthName = monthNames[order.month - 1];
            const year = order.year;
            return `${monthName} ${year}`;
        });
        let num=2
        const orders=response.orders
        const currentPage=response.currentPage
        const totalPages=response.totalPages
        const skip=response.skip
    //render table
        generateSaleTable(orders,num,currentPage,totalPages,skip)

     
           
         // Render the chart
         renderChartMonthly(orderIds, totalAmounts,totalAmountsAfterDiscount);
        
     },
     error: function(xhr, status, error) {
         console.error('Error fetching data:', error);
     }
   });
   }
 
   }

   //render monthly chart
  let myChartMonthly; 
  function renderChartMonthly(labels, values,values2) {
    try {
        // Get the canvas element
        const ctx = document.getElementById('myChartMonthly').getContext('2d');

        // Check if the chart instance already exists
        if (!myChartMonthly) {
            // If the chart instance doesn't exist, create a new chart
            myChartMonthly = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                            label: 'Total sales',
                            data: values,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                          barPercentage: 0.4, 
                          categoryPercentage: 0.5 // Set the width of the bars
                        },
                        {
                            label: 'Total Amount After Discount',
                            data: values2,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            barPercentage: 0.4,
                          categoryPercentage: 0.5 
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } else {
            // If the chart instance already exists, update the data
            myChartMonthly.data.labels = labels;
            myChartMonthly.data.datasets[0].data = values;
            myChartMonthly.data.datasets[1].data = values2;
            myChartMonthly.update();
        }
    } catch (error) {
        console.error('Error rendering chart:', error);
    }
  }
  


  function yearlyStat (obj) {
    let page=typeof obj==Object?obj.page :obj
    {
     $.ajax({
         url: `/admin/api/statistics/yearly?page=${page}`,
   method: 'GET',
   success: function(response) {
     
       const data = response.data
   
         // Process data as needed
         const totalAmounts = data.map(order => order.totalAmount);
         const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);
         const orderIds = data.map(order => order.year);

         let num=3
         const orders=response.orders
         const currentPage=response.currentPage
         const totalPages=response.totalPages
         const skip=response.skip
     //render table
         generateSaleTable(orders,num,currentPage,totalPages,skip)

         // Render the chart
         renderChartYearly(orderIds, totalAmounts,totalAmountsAfterDiscount);
       
     },
     error: function(xhr, status, error) {
         console.error('Error fetching data:', error);
     }
   });
   }
   }
 
  let myChartYearly; 
  function renderChartYearly(labels, values,values2) {
    try {
        const ctx = document.getElementById('myChartYearly').getContext('2d');

        // Check if the chart instance already exists
        if (!myChartYearly) {
            // If the chart instance doesn't exist, create a new chart
            myChartYearly = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                            label: 'Total sales',
                            data: values,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Total Amount After Discount',
                            data: values2,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } else {
            // If the chart instance already exists, update the data
            myChartYearly.data.labels = labels;
            myChartYearly.data.datasets[0].data = values;
            myChartYearly.data.datasets[1].data = values2;
            myChartYearly.update();
        }
    } catch (error) {
        console.error('Error rendering chart:', error);
    }
  }
  function dailyStat(page){

    $.ajax({
        url: `/admin/api/statistics?page=${page}`,
  method: 'GET',
  success: function(response) {
      const data = response.data

        // Process data as needed
        const totalAmounts = data.map(order => order.totalAmount);
        const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);
        const totalOrders = data.map(order => order.totalOrders);
        const orderIds = data.map(order => {
            const date = new Date(order.date);
            const day = ('0' + date.getDate()).slice(-2);
            const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        });
        
    
        let num=1
        const orders=response.orders
        const currentPage=response.currentPage
        const totalPages=response.totalPages
        const skip=response.skip
    //render table
        generateSaleTable(orders,num,currentPage,totalPages,skip)


        // Render the chart
        // renderChart(orderIds, totalAmounts,totalAmountsAfterDiscount,totalOrders);
      
    },
    error: function(xhr, status, error) {
        console.error('Error fetching data:', error);
    }
})
  }

  let myChartCustom;
  function customStat (obj) {
    let page=typeof obj==Object?obj.page :obj
    {
        const startDate = document.getElementById('startDateChart').value;
        const endDate = document.getElementById('endDateChart').value;
     

     $.ajax({
         url: `/admin/api/statistics/custom?startDate=${startDate}&endDate=${endDate}&page=${page}`,
   method: 'GET',
   success: function(response) {
       console.log(response);
       const data = response.data
       console.log(data);
   if(data.length==0){
    if (myChartCustom) {
        myChartCustom.destroy(); // Destroy the existing chart instance
        myChartCustom = null; // Reset the chart instance variable
    }
    const button1 = document.getElementById('newButton1');
    const button2 = document.getElementById('newButton2');

    button1.style.display = 'none';
    button2.style.display = 'none';
    Swal.fire({
        icon: "info",
        title: "Sorry, no data.",
      });
return
   }
         // Process data as needed
               // Display the new buttons after the chart is rendered
             
        const button1 = document.getElementById('newButton1');
        const button2 = document.getElementById('newButton2');

        button1.style.display = 'inline-block';
        button2.style.display = 'inline-block';

        // Add onclick attribute with function and argument
        button1.onclick = function() { pdfReport({startDate,endDate}); };
        button2.onclick = function() { excelReport({startDate,endDate}); };

         const totalAmounts = data.map(order => order.totalAmount);
         const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);
         
        
    
            // const orderIds = data.map(order => new Date(order.date).toLocaleDateString());
            const orderIds = data.map(order => {
                const date = new Date(order.date);
                const day = ('0' + date.getDate()).slice(-2);
                const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            });
        
            let num=4
            const orders=response.orders
            const currentPage=response.currentPage
            const totalPages=response.totalPages
            const skip=response.skip
        //render table
            generateSaleTable(orders,num,currentPage,totalPages,skip)
        
        
        
         // Render the chart
         renderChartCustom(orderIds, totalAmounts,totalAmountsAfterDiscount,startDate,endDate);
        
     },
     error: function(xhr, status, error) {
         console.error('Error fetching data:', error);
     }
   });
   }
   }
  
  
 
  
  function renderChartCustom(labels, values,values2,startDate,endDate) {
   
    try {
        const ctx = document.getElementById('myChartCustom').getContext('2d');

        // Check if the chart instance already exists
        if (!myChartCustom) {
            // If the chart instance doesn't exist, create a new chart
            myChartCustom = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                            label: 'Total sales',
                            data: values,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Total Amount After Discount',
                            data: values2,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
                // Process data as needed
               // Display the new buttons after the chart is rendered
             
        const button1 = document.getElementById('newButton1');
        const button2 = document.getElementById('newButton2');

        button1.style.display = 'inline-block';
        button2.style.display = 'inline-block';

        // Add onclick attribute with function and argument
        button1.onclick = function() { pdfReport({startDate,endDate}); };
        button2.onclick = function() { excelReport({startDate,endDate}); };
      

        } else {
            // If the chart instance already exists, update the data
            myChartCustom.data.labels = labels;
            myChartCustom.data.datasets[0].data = values;
            myChartCustom.data.datasets[1].data = values2;
            myChartCustom.update();
        }
    } catch (error) {
        console.error('Error rendering custom chart:', error);
    }
  }

  function formatDateToDDMMYYYY(isoDateString) {
    const date = new Date(isoDateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


   



function generateSaleTable(data,num,currentPage,totalPages,skip){

        // Populate the table headers
        const table = $(`.statisticsTable-${num}`);
        const tableHead = table.find('thead');
        const headRow = `
            <tr>
                 <th class="align-middle" scope="col">Sl.no</th>
                <th class="align-middle" scope="col">Order ID</th>
                <th class="align-middle" scope="col">Order Date</th>
                <th class="align-middle" scope="col">Total</th>
                <th class="align-middle" scope="col">Discount Price</th>
                <th class="align-middle" scope="col">Payment Status</th>
                <th class="align-middle" scope="col">Payment Method</th>
            </tr>
        `;
        tableHead.empty().append(headRow);

        // Populate the table body
        const tableBody = table.find('tbody');
        tableBody.empty(); // Clear any existing rows
        
        if (data.length === 0) {
            const noDataRow = `
                <tr>
                    <td colspan="6" class="text-center">No data found</td>
                </tr>
            `;
            tableBody.append(noDataRow);
        } else {
            data.forEach((order, index)  => {
                const formattedDate = formatDateToDDMMYYYY(order.createdDate);
                const row = `
                    <tr>
                         <td>${(skip+index+1)}</td>
                        <td><a href="#" class="fw-bold">${order.pkOrderId}</a></td>
                         <td>${formattedDate}</td>
                        <td>${order.intTotalOrderPrice}</td>
                        <td>${order.totalAmountAfterDiscount}</td>
                        <td><span class="badge badge-pill badge-soft-success">${order.strPaymentStatus}</span></td>
                        <td><i class="material-icons md-payment font-xxl text-muted mr-5"></i> ${order.strPaymentMethod}</td>
                    </tr>
                `;
                tableBody.append(row);
            });

            
        }
        generatePagination(currentPage,totalPages,num)
}





function generatePagination(currentPage, totalPages,num) {
   
    const paginationArea = $(`#pagination-area-${num}`);
    paginationArea.empty(); // Clear any existing pagination

    const source = `
        <nav aria-label='Page navigation example'>
            <ul class='pagination justify-content-start'>
                {{paginate currentPage totalPages num}}
            </ul>
        </nav>
    `;

    const template = Handlebars.compile(source);
    const context = { currentPage: currentPage, totalPages: totalPages,num:num };
    const paginationHtml = template(context);

    paginationArea.append(paginationHtml);
}
