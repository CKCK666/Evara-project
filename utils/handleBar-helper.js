const handlebars = require('handlebars');
const moment = require('moment');

handlebars.registerHelper('eq', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
  handlebars.registerHelper('formatDate', function(startDate) {
    const formattedStartDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`
   
    return  formattedStartDate;
  });
  handlebars.registerHelper('dateStatus', function(startDate) {
    const today = moment(); // Get current date and time
    const start = moment(startDate);
    if (start.isAfter(today, 'day')) { // Check if start date is after today's date
        return "Upcoming";
    } else {
      const formattedStartDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`
   
      return  formattedStartDate;
    }
  });
  handlebars.registerHelper('checkExpiry', function(endDate,status) {
    const today = moment(); // Get current date and time
    const end = moment(endDate);
    if (end.isBefore(today, 'day')) { 
        return "Expired";
    } else {
      const formattedStartDate = status?"Active":"Blocked"
   
      return  formattedStartDate;
    }
  });
  handlebars.registerHelper('json', function(context) {
  return context.percentage
  
  });
  handlebars.registerHelper('paginate', function(currentPage, totalPages, options) {
    let output = '';
  
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            output += `<li class="page-item active"><a class="page-link others" data-page=${i}>${i}</a></li>`;
        } else {
            output += `<li class="page-item"><a class="page-link others" data-page=${i}>${i}</a></li>`;
        }
    }
  
    return new handlebars.SafeString(output);
  });
  handlebars.registerHelper('paginate-order', function(currentPage, totalPages, options) {
    let output = '';
  
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            output += `<li onclick=changeOrder(${i}) class="page-item active"><a class="page-link">${i}</a></li>`;
        } else {
            output += `<li onclick=changeOrder(${i}) class="page-item"><a class="page-link">${i}</a></li>`;
        }
    }
  
    return new handlebars.SafeString(output);
  });

  handlebars.registerHelper('paginate-wallet', function(currentPage, totalPages, options) {
    let output = '';
  
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            output += `<li onclick=changeWallet(${i}) class="page-item active"><a class="page-link">${i}</a></li>`;
        } else {
            output += `<li onclick=changeWallet(${i}) class="page-item"><a class="page-link">${i}</a></li>`;
        }
    }
  
    return new handlebars.SafeString(output);
  });
  
  
  handlebars.registerHelper('or', function() {
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return args.some(Boolean);
  });

  module.exports = handlebars;