function monthlyStat() {
  $.ajax({
      url: '/admin/api/statistics/monthly',
      method: 'GET',
      success: function(response) {
          console.log(response);
          const data = response.data;

          // Process data as needed
          const totalAmounts = data.map(order => order.totalAmount);
          const totalAmountsAfterDiscount = data.map(order => order.totalAmountAfterDiscount);

          const orderIds = data.map(order => {
              const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              const monthName = monthNames[order.month - 1];
              const year = order.year;
              return { month: monthName, year: year };
          });

          // Populate the table headers
          const table = $('.statisticsTable');
          const tableHead = table.find('thead');
          const headRow = `
              <tr>
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
              data.forEach(order => {
                  const row = `
                      <tr>
                          <td><a href="#" class="fw-bold">${order.pkOrderId}</a></td>
                          <td>${formatDate(order.createdDate)}</td>
                          <td>${order.intTotalOrderPrice}</td>
                          <td>${order.totalAmountAfterDiscount}</td>
                          <td><span class="badge badge-pill badge-soft-success">${order.strPaymentStatus}</span></td>
                          <td><i class="material-icons md-payment font-xxl text-muted mr-5"></i> ${order.strPaymentMethod}</td>
                      </tr>
                  `;
                  tableBody.append(row);
              });

          }
      },
      error: function(xhr, status, error) {
          console.error('Error fetching data:', error);
      }
  });
}

// Function to generate pagination HTML
function generatePagination(currentPage, totalPages) {
  const paginationArea = $('.pagination-area');
  paginationArea.empty(); // Clear any existing pagination

  const paginationHtml = `
      <nav aria-label='Page navigation example'>
          <ul class='pagination justify-content-start'>
              {{paginate ${currentPage} ${totalPages}}}
          </ul>
      </nav>
  `;
  
  paginationArea.append(paginationHtml);
}






