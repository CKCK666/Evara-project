(function ($) {
    "use strict";
 
  
     if ($('#myChart').length>0) {
        $.ajax({
            url: '/admin/api/statistics',
      method: 'GET',
      success: function(response) {
          const data = response.data
  
            // Process data as needed
            const totalAmounts = data.map(order => order.totalAmount);
            const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);
            const totalOrders = data.map(order => order.totalOrders);
            const orderIds = data.map(order => new Date(order.date).toLocaleDateString());

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







    //monthly
  function monthlyStat () {

    {
     $.ajax({
         url: '/admin/api/statistics/monthly',
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
  


  function yearlyStat () {
    {
     $.ajax({
         url: '/admin/api/statistics/yearly',
   method: 'GET',
   success: function(response) {
       console.log(response);
       const data = response.data
   
         // Process data as needed
         const totalAmounts = data.map(order => order.totalAmount);
         const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);
         const orderIds = data.map(order => order.year);
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
  function dailyStat(){
    $.ajax({
        url: '/admin/api/statistics',
  method: 'GET',
  success: function(response) {
      const data = response.data

        // Process data as needed
        const totalAmounts = data.map(order => order.totalAmount);
        const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);
        const totalOrders = data.map(order => order.totalOrders);
        const orderIds = data.map(order => new Date(order.date).toLocaleDateString());
        
        renderChartCustom(orderIds, totalAmounts,totalAmountsAfterDiscount);
      
    },
    error: function(xhr, status, error) {
        console.error('Error fetching data:', error);
    }
})
  }

  
  function customStat () {
    {
        const startDate = document.getElementById('startDateChart').value;
        const endDate = document.getElementById('endDateChart').value;
      

     $.ajax({
         url: `/admin/api/statistics/custom?startDate=${startDate}&endDate=${endDate}`,
   method: 'GET',
   success: function(response) {
       console.log(response);
       const data = response.data
       console.log(data);
   if(data.length==0){
    Toast.fire({
        icon: "info",
        title: "Sorry, no data.",
      });
   }
         // Process data as needed
         const totalAmounts = data.map(order => order.totalAmount);
         const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);
         const orderIds = data.map(order => new Date(order.date).toLocaleDateString());

        
        
        
         // Render the chart
         renderChartCustom(orderIds, totalAmounts,totalAmountsAfterDiscount);
        
     },
     error: function(xhr, status, error) {
         console.error('Error fetching data:', error);
     }
   });
   }
   }
  
  
 
  let myChartCustom;
  function renderChartCustom(labels, values,values2) {
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