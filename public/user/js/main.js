!function(e){"use strict";if(e(".menu-item.has-submenu .menu-link").on("click",function(s){s.preventDefault(),e(this).next(".submenu").is(":hidden")&&e(this).parent(".has-submenu").siblings().find(".submenu").slideUp(200),e(this).next(".submenu").slideToggle(200)}),e("[data-trigger]").on("click",function(s){s.preventDefault(),s.stopPropagation();var n=e(this).attr("data-trigger");e(n).toggleClass("show"),e("body").toggleClass("offcanvas-active"),e(".screen-overlay").toggleClass("show")}),e(".screen-overlay, .btn-close").click(function(s){e(".screen-overlay").removeClass("show"),e(".mobile-offcanvas, .show").removeClass("show"),e("body").removeClass("offcanvas-active")}),e(".btn-aside-minimize").on("click",function(){window.innerWidth<768?(e("body").removeClass("aside-mini"),e(".screen-overlay").removeClass("show"),e(".navbar-aside").removeClass("show"),e("body").removeClass("offcanvas-active")):e("body").toggleClass("aside-mini")}),e(".select-nice").length&&e(".select-nice").select2(),e("#offcanvas_aside").length){const e=document.querySelector("#offcanvas_aside");new PerfectScrollbar(e)}e(".darkmode").on("click",function(){e("body").toggleClass("dark")})}(jQuery);



$(document).ready(function () {


  $('.form-control').focus(function () {
      $(this).removeClass('error');
      $('#errorMessage').text('');
  });


  // user login
  $("#submit-login").click(async function(e){
    e.preventDefault()
   
    let nameRegex = /[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*/;
    let data = new FormData($('#login-form')[0]);
    
    let email=data.get('email').trim()
    let password=data.get("password").trim()
     
    console.log(email,password);

    if ( email === '' || password==="") {
    
        $('#errorMessage').text('Please fill in all fields.');
        $('.form-control').addClass('error') 

        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        $('#errorMessage').text('Invalid email format.');
        $('input[name="email"]').addClass('error');
        return;
    }

    $.ajax({
      type: 'POST', 
      url: '/login',
      data:{
        email,password
      }, 
      success: function(response) {
          if (response.success) {
              Swal.fire({
                  position: 'top-end',
                  icon: 'success',
                  title: 'Successfully logged in',
                  showConfirmButton: false,
                  timer: 1500,
                  didClose:()=>{
                window.location.href = '/';
                  }
                })
              console.log('success:', response.message);
          } else {
              $('#errorMessage').text(response.message)
          }
         
      },
      error: function(error) {
          
          console.error('Error:', error);
      }
  });


   
   
})

 //user signUp
 $('#submit-signup').click(function (e) {
  e.preventDefault()
  let nameRegex = /^(?=(.*[a-zA-Z]){3})[a-zA-Z0-9\s\-\_.]+$/;
  const indianPhoneNumberRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
  let data = new FormData($('#signup-form')[0]);
 
  for (let pair of data.entries()) {
    let [key, value] = pair;
    if (typeof value === 'string') {
        data.set(key, value.trim());
    }
}

    let email=data.get('email')
    let username=data.get("username")
    let password=data.get("password")
    let Cpassword=data.get("Cpassword")
    let phno=data.get("phno")
 
  
  if (username === ''|| email === '' || password==="" ||phno==="" ||Cpassword==="") {
  
      $('#errorMessage').text('Please fill in all fields.');
      $('.form-control').addClass('error') 

      return;
  }
  
  

  if(username.length<=3){
      $('#errorMessage').text('Name must be at least 4 characters long.');
      $("input[name='username']").addClass('error');  
      return;
  }
  if (!nameRegex.test(username)) {
    $('#errorMessage').text('Username must contain at least three alphabetical character');
    $("input[name='username']").addClass('error');
    return;
}
if(phno.length<10 || phno.length>10){
  
  $('#errorMessage').text('Invalid phone number');
  $("input[name='phno']").addClass('error');  
  return;
}
if (!indianPhoneNumberRegex.test(phno)) {
  $('#errorMessage').text('Invailid mobile number');
  $("input[name='phno']").addClass('error');
  return;
}

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      $('#errorMessage').text('Invalid email format.');
      $("input[name='email']").addClass('error');
      return;
  }
  if(password.length<8){
     
      $('#errorMessage').text('Password must be at least 8 characters long.'); 
      $("input[name='password']").addClass('error');
      return;
  }
  
  if(password!=Cpassword){
    $('#errorMessage').text('Passwords do not match.'); 
    $("input[name='password']").addClass('error');
    $("input[name='Cpassword']").addClass('error');
    return
  }

 

$.ajax({
  type: 'POST', 
  url: '/signUp',
  data: {
    email,username,password,phno
  }, 
  success: function(response) {
      if (response.success) {
       
        $.ajax({
          type: 'POST',
          url: '/generateOTP', // Replace with the actual endpoint for generating OTP
                                 // Provide the user's phone number
          success: function(otpResponse) {
              if (otpResponse.success) {
                 window.location.href="/getOTP"
              } else {
                  console.error('Error generating OTP:', otpResponse.message);
                  // Handle error
              }
          },
          error: function(error) {
              console.error('Error generating OTP:', error);
              // Handle error
          }
      });
         
          console.log('success:', response.message);
      } else {
          $('#errorMessage').text(response.message)
      }
     
  },
  error: function(error) {
      
      console.error('Error:', error);
  }
});
  

});

 //user add address
 $('#add-address-submit').click(function (e) {
    e.preventDefault()
    let nameRegex = /^(?=(.*[a-zA-Z]){3})[a-zA-Z0-9\s\-\_.]+$/;
    const indianPhoneNumberRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;

    let pincodeRegex = /^[1-9][0-9]{5}$/;
    let data = new FormData($('#add-address-form')[0]);
    for (let pair of data.entries()) {
      let [key, value] = pair;
      if (typeof value === 'string') {
          data.set(key, value.trim());
      }
  }
    

    let hasCheckbox = $("#add-address-form input[type='checkbox']").length > 0;

    // Serialize the form data
    let formData={} // Declare formData variable

    if (hasCheckbox) {
       
       
        var checkboxValue = $("#add-address-form input[type='checkbox']").is(":checked") ? true :false;
        formData={ addressCheckBox:checkboxValue}
    } 
      
      let pkUserId=data.get("pkUserId")
      let fullName=data.get("fname")
      let pinCode=data.get("pinCode")
      let city=data.get("city")
      let phoneNumber=data.get("phno")
      let state=data.get("state")
      let area=data.get("area")
    
    if (fullName === ''|| pinCode === '' || city==="" ||phoneNumber==="" || state==="") {
    
        $('#errorMessage').text('Please fill in all fields.');
        $('.form-control').addClass('error') 
  
        return;
    }
    if(fullName.length<=3){
        $('#errorMessage').text('Full name must be at least 4 characters long.');
        $("input[name='fname']").addClass('error');  
        return;
    }
  //   if (!pincodeRegex.test(pinCode)) {
  //     $('#errorMessage').text('Invalid Indian PIN code.');
  //     $("input[name='username']").addClass('error');
  //     return;
  // }
  if (!nameRegex.test(fullName)) {
    $('#errorMessage').text('Full name must contain at least three alphabetical character');
    $("input[name='fname']").addClass('error');
    return;
}
  if(phoneNumber.legnth<10 || phoneNumber<0 || phoneNumber.length>10){
    $('#errorMessage').text('Phone number invalid'); 
    $("input[name='phno']").addClass('error');
 
    return
  }
  if (!indianPhoneNumberRegex.test(phoneNumber)) {
    $('#errorMessage').text('Invailid mobile number');
    $("input[name='phno']").addClass('error');
    return;
}
  
    if(city.legnth){
      $('#errorMessage').text('City name must 3 characters long.'); 
      $("input[name='city']").addClass('error');
   
      return
    }
  
   
  
  $.ajax({
    type: 'POST', 
    url: '/addAddress',
    data: {
         pkUserId,
         fname:fullName,
      phno: phoneNumber,
         area,
         pinCode,
         city,
         state  ,
         ...formData
    },
    success: function(response) {
        if (response.success) {
          console.log(response.pkUserId);
          Swal.fire({
                  position: 'top-end',
                  icon: 'success',
                  title: 'Successfully Added new address',
                  showConfirmButton: false,
                  timer: 1500,
                  didClose:()=>{
                    window.location.reload()
                  }
                })
        //  window.location.href=`/userSettings?pkUserId=${response.pkUserId}`
        
          
        } else {
            $('#errorMessage').text(response.message)
        }
       
    },
    error: function(error) {
        
        console.error('Error:', error);
    }
  });
    
  
  });


  // user profile edit
  $("#user-profile-edit-btn").click(async function(e){
    e.preventDefault()
   console.log("calll");
   let nameRegex = /[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*/;
    let data = new FormData($('#user-profile-form')[0]);

    for (let pair of data.entries()) {
      let [key, value] = pair;
      if (typeof value === 'string') {
          data.set(key, value.trim());
      }
  }
    
    let email=data.get('email')
    let password=data.get("password")
    let npassword=data.get("npassword")
    let cpassword=data.get("cpassword")
    let username =data.get("name")
    
     
    

    if ( email === '' || username==="") {
    
        $('#errorMessage').text('Please fill in all fields.');
        $('input[name="email"]').addClass('error');
        $('input[name="name"]').addClass('error');

        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        $('#errorMessage').text('Invalid email format.');
        $('input[name="email"]').addClass('error');
        return;
    }
    if (!nameRegex.test(username)) {
      $('#errorMessage').text('Username contains aleast 3 alphabets');
      $('input[name="name"]').addClass('error');
      return;
  }
    

    if(password.length){
      if(cpassword=="" || npassword ==""){
        $('#errorMessage').text('Fill the password');
        $('input[name="cpassword"]').addClass('error');
        $('input[name="npassword"]').addClass('error');
        return
      }
      if(cpassword!=npassword){
        $('#errorMessage').text('Passwords doesn"t match');
        $('input[name="cpassword"]').addClass('error');
        $('input[name="npassword"]').addClass('error');
        return
      }
      if(cpassword.length<8 ||npassword.length<8){
        $('#errorMessage').text('Passwords must be strong');
        $('input[name="cpassword"]').addClass('error');
        $('input[name="npassword"]').addClass('error');
        return
      }
      if(password == npassword){
        $('#errorMessage').text('Enter a new password');
       
        return
      }
    }
    if(cpassword.length || npassword.length){
      if(password.length==0){
        $('#errorMessage').text('Required current password');
        $('input[name="password"]').addClass('error');
        return
      }
   
     
     
    }

    $.ajax({
      type: 'POST', 
      url: '/userEdit',
      data: $('#user-profile-form').serialize(), 
      success: function(response) {
          if (response.success) {
              Swal.fire({
                  position: 'top-end',
                  icon: 'success',
                  title: 'Successfully updated user',
                  showConfirmButton: false,
                  timer: 1500,
                  didClose:()=>{
                // window.location.href = `/userSetting?pkUserId=${pkUserId}`;
                window.location.reload()
                  }
                })
              console.log('success:', response.message);
          } else {
              $('#errorMessage').text(response.message)
          }
         
      },
      error: function(error) {
          
          console.error('Error:', error);
      }
  });


   
   
})



let couponReduction=0
$("#place-order-btn").click(async function(e){
  e.preventDefault()
  let razorpayRadioButton = document.querySelector('#razorpayOption');
  const codOption = document.getElementById("codOption");
  const walletCheckbox = document.getElementById("walletCheck");
  let walletAmt=parseFloat(document.getElementById('walletBalanceSpan').textContent)
  let  discountAmt =parseFloat( document.querySelector('td.product-subtotal.grandTotalAmt span').textContent.slice(1))
  let totalAmountAfterDiscount=discountAmt
  if( walletCheckbox.checked){
    if(discountAmt>walletAmt){
      totalAmountAfterDiscount=discountAmt-walletAmt
    }
  }
  let totalDiscountText = document.getElementById('totalDiscountSpan')



  let totalDiscount=null
  if (totalDiscountText && totalDiscountText.textContent.length > 0) {
    // Remove the first character (assuming it's a currency symbol)
    let totalDiscountNumber = totalDiscountText.textContent.slice(1);

    // Parse the resulting string to a float
    totalDiscount = parseFloat(totalDiscountNumber);

    // Log the result to the console (or use it as needed)
    console.log(totalDiscount);
} else {
    // Handle the case where the text content is empty
    console.log('totalDiscountSpan has no content');
}

  const radioButtons = document.querySelectorAll('input[type="radio"][name="shipping-address"]');

  let pkAddressId;

  //get default addressId
  if (radioButtons.length > 0) {
    radioButtons.forEach(function(radioButton) {
      if (radioButton.checked) {
          // const pkAddressIdInput = radioButton.parentNode.nextElementSibling.querySelector('input[name="pkAddressId"]');
          pkAddressId = radioButton.dataset.pkAddressId
      }
  });
  
  
    // get the address when radio button change event
    radioButtons.forEach(function(radioButton) {
        radioButton.addEventListener('change', function(event) {
            if (event.target.checked) {
                 pkAddressId = event.target.dataset.pkAddressId;
                console.log('pkAddressId:', pkAddressId);
               
            }
        });
    });
  
} else {
  Toastify({
    text: "Add the address",
    duration: 3000, // Duration in milliseconds
    close: true, // Whether to display a close button
    gravity: 'top', // Toast position: 'top', 'bottom', 'center'
    position: 'right', // Toast position: 'left', 'center', 'right'
    backgroundColor: '#4CAF50', // Background color of the toast
    stopOnFocus: true // Whether to close the toast when focused
  }).showToast();
}




  if(!pkAddressId.length){
    $('#errorMessage').text('Select a shipping address');
    return
  }
  if(razorpayRadioButton.checked){
   let bodyData={
    pkAddressId,
    totalAmountAfterDiscount,
    walletAmt,
    couponReduction
   }
  
   if (totalDiscount !== null && !isNaN(totalDiscount)) {
    bodyData.totalDiscount = totalDiscount;
}

  
  
    $.ajax({
      type: 'POST', 
      url: '/checkOutRazorPay',
      data:{
       ...bodyData
      },
      success: function(response) {
          if (response.razorpay) {
         
            
            const order = response.message;
            const user = response.user;
            const orderId = response.orderId;
         const walletCashUsed=response.walletCashUsed
         const pkUserId=response.pkUserId
         let isProgrammaticClose = false;
      
            var options = {
              key: "rzp_test_N10HdSb3UEKLbM",
              amount:order.amount, // Amount in paise (change to your desired amount)
              currency: 'INR',
              name: 'Evara',
              description: 'Payment for Order',
              image: 'https://example.com/logo.png',
              order_id: order.id,
              handler: function (response){
                console.log(response.razorpay_order_id,response.razorpay_signature);
                  $.ajax({
                url: "/payment/success",
                method: "POST",
                data: {
                  orderId: orderId,
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  walletCashUsed,
                  pkUserId
                },
                success: function (data) {
                  if (data.success) {
                    window.location.href ="/";
                    Swal.fire({
                      icon: "Success", 
                      title: "payment success",
                    });
                  }
                },
                error: function (xhr, status, error) {
                  console.error(error);
                  Swal.fire({
                    icon: "Success",
                    title: "payment failed",
                  });
                  
                },
               


              });
              },
              modal: {
                ondismiss: function(){
          
                  if (!isProgrammaticClose) {
                  $.ajax({
                    url: "/paymentDismiss",
                    method: "Delete",
                    data: {
                      payment : 'failed',
                      orderId: orderId
                    },
                    success: function (data) {
                      if (data.success) {
  
                        Swal.fire({
                          icon: 'success',
                          title: 'Payment Cancelled',
                          showConfirmButton: true,
                          confirmButtonText: 'OK',
                         
                        })
                      }
                    },
                    error: function (xhr, status, error) {
                      console.error(error);
                    },
                  });
                  }else{
                    isProgrammaticClose=false
                    rzp.open()
                   
                  }
                  
                }
            },
          };
          var rzp = new Razorpay(options);
      
     rzp.on("payment.failed", async function (response) {
      isProgrammaticClose=true
          rzp.close()
          });

         
    
  
          rzp.open();


          } else {
              $('#errorMessage').text(response.message)
          }
         
      },
      error: function(error) {
        $('#errorMessage').text(error.message)
          console.error('Error:', error);
          console.error(error);
                  Swal.fire({
                    icon: "Success",
                    title: "payment failed",
                  });
      }
  });
  }
  else{
    let paymentMethod="COD"
    codOption.checked==false?paymentMethod="WALLET":paymentMethod="COD"
    let bodyData={
      pkAddressId,
      totalAmountAfterDiscount,
      walletAmt,
      paymentMethod,
      couponReduction
    }
   
    if (totalDiscount !== null && !isNaN(totalDiscount)) {
      bodyData.totalDiscount = totalDiscount;
  }
 
    $.ajax({
      type: 'POST', 
      url: '/checkOut',
      data:bodyData,
      success: function(response) {
          if (response.success) {
              Swal.fire({
                  position: 'top-end',
                  icon: 'success',
                  title: 'Successfully ordered',
                  showConfirmButton: false,
                  timer: 1500,
                  didClose:()=>{
                window.location.href = '/';
                  }
                })
              console.log('success:', response.message);
          } else {
              $('#errorMessage').text(response.message)
          }
         
      },
      error: function(error) {
        $('#errorMessage').text(error.message)
          console.error('Error:', error);
      }
  });
  
  }


 
 
})

 //user edit address
 $('#edit-address-submit').click(function (e) {
  e.preventDefault()
  let nameRegex = /^(?=(.*[a-zA-Z]){3})[a-zA-Z0-9\s\-\_.]+$/;
  let pincodeRegex = /^[1-9][0-9]{5}$/;
  const indianPhoneNumberRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
  let data = new FormData($('#edit-address-form')[0]);
  for (let pair of data.entries()) {
    let [key, value] = pair;
    if (typeof value === 'string') {
        data.set(key, value.trim());
    }
  }   

  let hasCheckbox = $("#edit-address-form input[type='checkbox']").length > 0;

  // Serialize the form data
  let formData={} // Declare formData variable

  if (hasCheckbox) {
     
     
      var checkboxValue = $("#edit-address-form input[type='checkbox']").is(":checked") ? true :false;
      formData={ addressCheckBox:checkboxValue}
  } 
let pkUserId=data.get("pkUserId")
let pkAddressId=data.get("pkAddressId")
    let fullName=data.get("fname")
    let pinCode=data.get("pincode")
    let city=data.get("city")
    let phoneNumber=data.get("phno")
    let state=data.get("state")
    let area=data.get("area")
    
  if (fullName === ''|| pinCode === '' || city==="" ||phoneNumber==="" || state==="") {
  
      $('#errorMessage').text('Please fill in all fields.');
      $('.form-control').addClass('error') 

      return;
  }
  if(fullName.length<=3){
      $('#errorMessage').text('Full name must be at least 4 characters long.');
      $("input[name='fname']").addClass('error');  
      return;
  }
//   if (!pincodeRegex.test(pinCode)) {
//     $('#errorMessage').text('Invalid Indian PIN code.');
//     $("input[name='username']").addClass('error');
//     return;
// }
if (!nameRegex.test(fullName)) {
  $('#errorMessage').text('Full name must contain at least three alphabetical character');
  $("input[name='fname']").addClass('error');
  return;
}
if(phoneNumber.legnth<10 || phoneNumber<0 || phoneNumber.length>10){
  $('#errorMessage').text('Phone number invalid'); 
  $("input[name='phno']").addClass('error');

  return
}

if (!indianPhoneNumberRegex.test(phoneNumber)) {
  $('#errorMessage').text('Invailid mobile number');
  $("input[name='phno']").addClass('error');
  return;
}

  
  if(city.legnth){
    $('#errorMessage').text('City name must 3 characters long.'); 
    $("input[name='city']").addClass('error');
 
    return
  }

 

$.ajax({
  type: 'POST', 
  url: '/editAddress',
  data: {
    pkUserId,
    pkAddressId,
    fname:fullName,
    phn:phoneNumber,
    area,
    pinCode,
    city,
    state,
    ...formData
  }, 
  success: function(response) {
      if (response.success) {
        console.log(response.pkUserId);
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Successfully updated address',
          showConfirmButton: false,
          timer: 1500,
          didClose:()=>{
            window.location.reload()
          }
        })
      
    
        
      } else {
        
          $('#errorMessage').text(response.message)
      }
     
  },
  error: function(error) {
    $('#errorMessage').text(error.message)
      console.error('Error:', error);
  }
});
  

});

$(".set-as-default").click(function(e){
  e.preventDefault()
  let pkAddressId = $(this).data('pk-address-id');
  let pkUserId = $(this).data('pk-user-id');
   let render=$(this).data('check-out');

   console.log(pkAddressId,pkUserId);
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-danger',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })
  
  swalWithBootstrapButtons.fire({
    title: `Want to set as default address`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, set it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
        $.ajax({
            type: 'POST', 
            url: "/setAsDefault",
            data: {
              pkAddressId,
              pkUserId
            }, 
            success: function(response) {
                if (response.success) {
                    swalWithBootstrapButtons.fire(
                        'Updated!',
                        'Your address set as default.',
                        'success'
                      ).then(()=>{
                        if(render=="toCheckOut"){
                          window.location.href='/getCheckoutPage' 
                        }else{
                          window.location.href=`/userSettings?pkUserId=${pkUserId}`
                        }
                         
                      })
                     
                    console.log('success:', response.message);
                } else {
                  console.log('success:', response.message);
                    swalWithBootstrapButtons.fire(
                        'Cancelled',
                        
                      )
                }
               
            },
            error: function(error) {
                
                console.error('Error:', error);
            }
        });
      
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        
      )
    }
  })


})

$(".cancel-order-btn").click(function(e){
  e.preventDefault()
  let pkOrderId = $(this).data('pk-order-id');
  let pkUserId = $(this).data('pk-user-id');
  let orderStatusChange=$(this).data('order-status-change')
 
  
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-danger',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })
  
  swalWithBootstrapButtons.fire({
    title: `Want to cancel `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel the order it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
        $.ajax({
            type: 'POST', 
            url: "/orderStatusChange",
            data: {
              pkOrderId,
              pkUserId,
              orderStatusChange
            }, 
            success: function(response) {
                if (response.success) {
                    swalWithBootstrapButtons.fire(
                        'Updated!',
                        'Order is Cancelled.',
                        'success'
                      ).then(()=>{
                         window.location.href=`/userSettings?pkUserId=${pkUserId}`
                      })
                     
                    console.log('success:', response.message);
                } else {
                  console.log('success:', response.message);
                    swalWithBootstrapButtons.fire(
                        'Cancelled',
                        
                      )
                }
               
            },
            error: function(error) {
                
                console.error('Error:', error);
            }
        });
      
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        
      )
    }
  })


})

//return  order
$(".return-order-btn").click(function(e){
  e.preventDefault()

  let pkOrderId = $(this).data('pk-order-id');
  let pkUserId = $(this).data('pk-user-id');
  let orderStatusChange=$(this).data('order-status-change')
 console.log(pkOrderId,pkUserId,orderStatusChange)
  
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-danger',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })
  
  swalWithBootstrapButtons.fire({
    title: `Want to return `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Return the order it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
        $.ajax({
            type: 'POST', 
            url: "/orderStatusChange",
            data: {
              pkOrderId,
              pkUserId,
              orderStatusChange
            }, 
            success: function(response) {
                if (response.success) {
                    swalWithBootstrapButtons.fire(
                        'Updated!',
                        'Order return process starting.',
                        'success'
                      ).then(()=>{
                         window.location.href=`/userSettings?pkUserId=${pkUserId}&pkOrderId=${pkOrderId}`
                      })
                     
                    console.log('success:', response.message);
                } else {
                  console.log('success:', response.message);
                    swalWithBootstrapButtons.fire(
                        'Cancelled',
                        
                      )
                }
               
            },
            error: function(error) {
                
                console.error('Error:', error);
                swalWithBootstrapButtons.fire(
                  'Cancelled',
                  
                )
            }
        });
      
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        
      )
    }
  })


})

$(".removeFromCart").click(function(e){
  e.preventDefault()
  let pkCartId = $(this).data('pk-cart-id');
  let pkProductId = $(this).data('pk-product-id');
  console.log(pkCartId,pkProductId);
 
    
        $.ajax({
            type: 'POST', 
            url: "/removeFromCart",
            data: {
         pkCartId,
         pkProductId
            }, 
            success: function(response) {
                if (response.success) {
                    
                     window.location.reload()
                    console.log('success:', response.message);
                } else {
                  console.log('success:', response.message);
                    
                }
               
            },
            error: function(error) {
                
                console.error('Error:', error);
            }
        });
  


})

//remove From WishList
$(".removeFromWishList").click(function(e){
  e.preventDefault()
  let pkWishListId = $(this).data('pk-wishlist-id');
  let pkProductId = $(this).data('pk-product-id');
  console.log( pkWishListId,pkProductId);
 
    
        $.ajax({
            type: 'POST', 
            url: "/removeFromWishList",
            data: {
              pkWishListId,
         pkProductId
            }, 
            success: function(response) {
                if (response.success) {
                    
                     window.location.reload()
                    console.log('success:', response.message);
                } else {
                  console.log('success:', response.message);
                    
                }
               
            },
            error: function(error) {
                
                console.error('Error:', error);
            }
        });
  


})
 //Forget password sent OTP
 $('#sent-otp').click(function (e) {
  e.preventDefault()
  let nameRegex = /^(?=(.*[a-zA-Z]){3})[a-zA-Z0-9\s\-\_.]+$/;
  const indianPhoneNumberRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let data = new FormData($('#forgot-password-form')[0]);
  for (let pair of data.entries()) {
    let [key, value] = pair;
    if (typeof value === 'string') {
        data.set(key, value.trim());
    }
  }   

    let email=data.get('email')
     let phno=data.get("phno")
 
  
  if (email === '' || phno ==="") {
  
      $('#errorMessage').text('Please fill in all fields.');
      $('.form-control').addClass('error') 

      return;
  }
  
  
if(phno.length<10 || phno.length>10){
  
  $('#errorMessage').text('Invalid phone number');
  $("input[name='phno']").addClass('error');  
  return;
}
if (!indianPhoneNumberRegex.test(phno)) {
  $('#errorMessage').text('Invailid mobile number');
  $("input[name='phno']").addClass('error');
  return;
}

  
  if (!emailRegex.test(email)) {
      $('#errorMessage').text('Invalid email format.');
      $("input[name='email']").addClass('error');
      return;
  }
 
$.ajax({
  type: 'POST', 
  url: '/verifyUser',
  data: {
     strEmail:email,
    strPhoneNumber:"+91"+phno
  }, 
  success: function(response) {
    
    if (response.success) {
      $.ajax({
          type: 'POST',
          url: '/generateOTP', // Replace with the actual endpoint for generating OTP
          data: {
            strEmail:email,
           strPhoneNumber:"+91"+phno
         },                     // Provide the user's phone number
          success: function(otpResponse) {
              if (otpResponse.success) {
                 window.location.href="/getOTP"
              } else {
                  console.error('Error generating OTP:', otpResponse.message);
                  // Handle error
              }
          },
          error: function(error) {
              console.error('Error generating OTP:', error);
              // Handle error
          }
      });
     























    } else {
      $('#errorMessage').text(response.message);
       console.log(response);
        console.error('Error generating OTP:', response.message);
        
    }
},
  error: function(error) {
    $('#errorMessage').text(error.message);
      console.error('Error:', error);
  }
});
  

})


  // reset password
  $("#submit-reset-password").click(async function(e){
    e.preventDefault()
   console.log("calll");
  
    let data = new FormData($('#reset-password-form')[0]);

    for (let pair of data.entries()) {
      let [key, value] = pair;
      if (typeof value === 'string') {
          data.set(key, value.trim());
      }
  }
    
    let password=data.get("password")
    
    let cpassword=data.get("cpassword")
   
    
     
    

    if ( password === '' || cpassword==="") {
    
        $('#errorMessage').text('Please fill in all fields.');
        $('input[name="email"]').addClass('error');
        $('input[name="name"]').addClass('error');

        return;
    }
    
    
    
      if(cpassword!=password){
        $('#errorMessage').text('Passwords doesn"t match');
        $('input[name="cpassword"]').addClass('error');
        $('input[name="npassword"]').addClass('error');
        return
      }
      if(cpassword.length<8 ||password.length<8){
        $('#errorMessage').text('Passwords must be strong');
        $('input[name="cpassword"]').addClass('error');
        $('input[name="npassword"]').addClass('error');
        return
      }
     
    
   

    $.ajax({
      type: 'POST', 
      url: '/resetPassword',
      data: {
        password
      }, 
      success: function(response) {
          if (response.success) {
              Swal.fire({
                  position: 'top-end',
                  icon: 'success',
                  title: 'Successfully reset the password',
                  showConfirmButton: false,
                  timer: 1500,
                  didClose:()=>{
              
                window.location.href="/"
                  }
                })
              console.log('success:', response.message);
          } else {
              $('#errorMessage').text(response.message)
          }
         
      },
      error: function(error) {
          
          console.error('Error:', error);
      }
  });


   
   
})

let productName
let pkOrderId
document.getElementById('searchForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission behavior

  //  var category = document.querySelector('.select-active').value;
  var searchQuery = document.getElementById('searchInput').value;

  console.log('Search Query:', searchQuery);

  // Clear the input fields if needed
  document.getElementById('searchInput').value = '';

   productName=searchQuery
  //  pkCategoryId=category

  


   
});

document.getElementById('searchInput').addEventListener('keydown', async function(event) {
  if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default Enter key behavior (form submission)

      // Trigger the form submission by clicking the submit button
      document.getElementById('submitButton').click();
      const url = `/search?productName=${productName}`;
      window.location.href=url
  }
});



if (window.location.pathname === "/getCheckoutPage") {
  let couponApplied = false;
let totalAmountAfterDiscount;
let discountPrice;
let totalCartPriceElement = document.querySelector(".product-subtotal.totalAmt");
let totalCartPrice = parseFloat(totalCartPriceElement.textContent.substring(1));
    const codOption = document.getElementById("codOption");
    var labelElementCod = document.querySelector('label.form-check-label[for="codOption"]');

// Get the span element within the label
var spanElementCod = labelElementCod.querySelector('span');

    
    const razorpayOption = document.getElementById("razorpayOption");
    const walletCheckbox = document.getElementById("walletCheck");
    let spanElement = document.querySelector('td.product-subtotal.grandTotalAmt span');
    totalAmountAfterDiscount = parseFloat(spanElement.textContent.slice(1));
   let walletBalanceString=document.getElementById('walletBalanceSpan').textContent
  let walletBalance=parseFloat(walletBalanceString)
  if(totalAmountAfterDiscount>1000){
    spanElementCod.style.display = 'inline';
    codOption.disabled=true
    codOption.checked=false
    razorpayOption.checked=true
  }
  if(walletBalance==0){
    walletCheckbox.disabled=true
    
  }
  walletCheckbox.addEventListener("change",handleWalletCheckboxChange)

  function handleWalletCheckboxChange(){
    if(walletCheckbox.checked){
      let spanElement = document.querySelector('td.product-subtotal.grandTotalAmt span');
     let totalAmountAfterDiscount = parseFloat(spanElement.textContent.slice(1));
      if(walletBalance>totalAmountAfterDiscount){
        razorpayOption.disabled=true
        codOption.disabled=true
        razorpayOption.checked=false
        codOption.checked=false
      }
    
    }else{
      razorpayOption.disabled=false
      codOption.disabled=false
       if(razorpayOption.checked){
        razorpayOption.checked=true
       }else{
        codOption.checked=true
       }
        
    }
  }


   

    //apply coupon
document.addEventListener('click', function(event) {

    if (event.target.classList.contains('apply-btn')) {
     
        if (couponApplied) {
            return alert("Coupon already applied");
        }
        // Declare variables outside the function
     
        const button = event.target;
       
      let discount = button.getAttribute('data-discount');
    let  minSpend = button.getAttribute('data-minSpend');
     let  id = button.getAttribute('data-id');
     discount = parseFloat(discount);
     minSpend = parseFloat(minSpend);
        
        let totalCartPriceElement = document.querySelector(".product-subtotal.totalAmt");
        let couponDiscountElement=document.querySelector('.couponDiscount-checkout')
         let couponDiscount=parseFloat(couponDiscountElement.textContent)
        
        let grandTotalElement = document.querySelector('td.product-subtotal.grandTotalAmt span');
        let totalCartPrice = parseFloat(totalCartPriceElement.textContent.substring(1));
        

        if(totalCartPrice<minSpend){
          Toastify({
            text: `Purchase above ${minSpend}`,
            duration: 3000, // Duration in milliseconds
            close: true, // Whether to display a close button
            gravity: 'top', // Toast position: 'top', 'bottom', 'center'
            position: 'center', // Toast position: 'left', 'center', 'right'
            stopOnFocus: true, // Whether to close the toast when focused
            style: {
              width: '500px', // Adjust the width as needed
              height: '50px', // Adjust the height as needed
              background: 'red' // Set the background color to red
            }
          }).showToast();
      
          return
        }

       
       

             totalPriceAfterDiscount = parseFloat(totalAmountAfterDiscount) - parseFloat(totalCartPrice * (discount / 100));
           
             couponDiscountElement.textContent=couponDiscount+parseFloat(totalCartPrice * (discount / 100))
            grandTotalElement.textContent = "₹" + totalPriceAfterDiscount;
            discountPrice= parseFloat(totalCartPrice * (discount / 100));
          couponReduction=discountPrice
          alert(couponReduction)
           
          
        event.target.textContent = "Applied";

        const buttonGroup = event.target.closest('.button-group');
        const removeBtn = buttonGroup.querySelector('.remove-btn');
        event.target.disabled = true;
        removeBtn.style.display = 'inline-block';
        couponApplied = true;
        totalAmountAfterDiscount = totalPriceAfterDiscount;
        console.log("Total amount after discount (applied):", totalAmountAfterDiscount);
    }else{
      return
    }
});





//remove coupon
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('remove-btn')) {
      couponApplied = false;
      const buttonGroup = event.target.closest('.button-group');
      const applyBtn = buttonGroup.querySelector('.apply-btn');

      applyBtn.textContent = "Apply";
 
      let grandTotalElement = document.querySelector('td.product-subtotal.grandTotalAmt span');
      totalAmountAfterDiscount = parseFloat(totalAmountAfterDiscount) + parseFloat(discountPrice);
      let couponDiscountElement=document.querySelector('.couponDiscount-checkout')
      let couponDiscount=parseFloat(couponDiscountElement.textContent)
      couponDiscountElement.textContent=couponDiscount-parseFloat(discountPrice)
      grandTotalElement.textContent = "₹" + totalAmountAfterDiscount.toFixed(2);
      applyBtn.disabled = false;
      event.target.style.display = 'none';
      couponReduction=0
      alert(couponReduction)
      console.log("Total amount after discount (removed):", totalAmountAfterDiscount);
  }
});















}

if(window.location.pathname.startsWith("/search")){
  const checkboxes = document.querySelectorAll('.category-checkbox');
  const urlParams = new URLSearchParams(window.location.search);
  const minPrice = parseInt(urlParams.get('minPrice')) || 0;
  const maxPrice = parseInt(urlParams.get('maxPrice')) || 5000;

    /*---------------------
        Price range
    --------------------- */
    var sliderrange = $('#slider-range');
    var amountprice = $('#amount');
    $(function() {
        sliderrange.slider({
            range: true,
            min: 50,
            max: 10000,
            values: [minPrice,maxPrice],
            slide: function(event, ui) {
                amountprice.val("₹" + ui.values[0] + " - ₹" + ui.values[1]);
            }
        });
        amountprice.val("₹" + sliderrange.slider("values", 0) +
            " - ₹" + sliderrange.slider("values", 1));
    });




  const selectedCategoryIds = urlParams.get('categoryIds') ? urlParams.get('categoryIds').split(',') : [];
  $('.category-checkbox').each(function() {
      if (selectedCategoryIds.includes($(this).val())) {
          $(this).prop('checked', true);
      }
  });

 
 

  // Function to get checked checkboxes
  function getCheckedCheckboxes() {
    const checkedValues = [];
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        checkedValues.push(checkbox.value);
      }
    });
    return checkedValues;
  }

  // Example of using the function when a button is clicked
  document.querySelector('#filter-btn').addEventListener('click', () => {
    const url = new URL(window.location.href);
    const checkedCategories = getCheckedCheckboxes();
    var min = $("#slider-range").slider("values", 0);
    var max = $("#slider-range").slider("values", 1);
    url.searchParams.set('minPrice',min);
    url.searchParams.set('maxPrice',max);
   url.searchParams.set('categoryIds',checkedCategories);
    window.location.href = url.toString();
  });

 
  var pageLinks = document.querySelectorAll('.page-link');
  if (pageLinks.length > 0) {
 
  pageLinks.forEach(function(link) {
      
      link.addEventListener('click', function(event) {
        const url = new URL(window.location.href);
          event.preventDefault();
        var page = link.getAttribute('data-page')
       
      url.searchParams.set('page', page);
      window.location.href = url.toString();
         
         
      });
  });

  }



}





});

const deleteAddress=(addressId,userId,render)=>{

 

  const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })
    
    swalWithBootstrapButtons.fire({
      title: `Want to delete this address`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
          $.ajax({
              type: 'POST', 
              url: "/deleteAddress",
              data: {
                pkAddressId:addressId,
                pkUserId:userId
              }, 
              success: function(response) {
                  if (response.success) {
                      swalWithBootstrapButtons.fire(
                          'Deleted!',
                          'Your file has been deleted.',
                          'success'
                        ).then(()=>{
                          if(render=="toCheckout"){
                            window.location.href='/getCheckoutPage'
                          }else{
                            window.location.href=`/userSettings?pkUserId=${response.pkUserId}`
                          }
                          
                        })
                       
                      console.log('success:', response.message);
                  } else {
                    console.log('success:', response.message);
                      swalWithBootstrapButtons.fire(
                          'Cancelled',
                          
                        )
                  }
                 
              },
              error: function(error) {
                  
                  console.error('Error:', error);
              }
          });
        
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          
        )
      }
    })
  }

  const handleAddToCart=(pkProductId,pkUserId)=>{

    $.ajax({
      type: 'POST', 
      url: '/addToCart',
      data: {
        pkProductId,
        pkUserId
    
      }, 
      success: function(response) {
          if (response.success) {
          let cartCount=document.getElementById("cartCount").innerText
          document.getElementById("cartCount").innerText=parseInt(cartCount)+1
          Toastify({
            text: 'Item added to cart!',
            duration: 3000, // Duration in milliseconds
            close: true, // Whether to display a close button
            gravity: 'top', // Toast position: 'top', 'bottom', 'center'
            position: 'right', // Toast position: 'left', 'center', 'right'
            backgroundColor: '#4CAF50', // Background color of the toast
            stopOnFocus: true // Whether to close the toast when focused
          }).showToast();
      
            
          } else {
              $('#errorMessage').text(response.message)
              Toastify({
                text: response.message,
                duration: 3000, // Duration in milliseconds
                close: true, // Whether to display a close button
                gravity: 'top', // Toast position: 'top', 'bottom', 'center'
                position: 'right', // Toast position: 'left', 'center', 'right'
                backgroundColor: '#4CAF50', // Background color of the toast
                stopOnFocus: true // Whether to close the toast when focused
              }).showToast();
              
          }
         
      },
      error: function(error) {
        Toastify({
          text: "Failed add to cart",
          duration: 3000, // Duration in milliseconds
          close: true, // Whether to display a close button
          gravity: 'top', // Toast position: 'top', 'bottom', 'center'
          position: 'right', // Toast position: 'left', 'center', 'right'
          backgroundColor: '#4CAF50', // Background color of the toast
          stopOnFocus: true // Whether to close the toast when focused
        }).showToast();
          
          console.error('Error:', error);
      }
    });
  }


  const handleAddToWishList=(pkProductId,pkUserId)=>{

    $.ajax({
      type: 'POST', 
      url: '/addToWishList',
      data: {
        pkProductId,
    
    
      }, 
      success: function(response) {
          if (response.success) {
            let wishListCount=document.getElementById("wishListCount").innerText
            document.getElementById("wishListCount").innerText=parseInt(wishListCount)+1
          Toastify({
            text: 'Item added to Wislist!',
            duration: 3000, // Duration in milliseconds
            close: true, // Whether to display a close button
            gravity: 'top', // Toast position: 'top', 'bottom', 'center'
            position: 'right', // Toast position: 'left', 'center', 'right'
            backgroundColor: '#4CAF50', // Background color of the toast
            stopOnFocus: true // Whether to close the toast when focused
          }).showToast();
      
            
          } else {
              $('#errorMessage').text(response.message)
              Toastify({
                text: response.message,
                duration: 3000, // Duration in milliseconds
                close: true, // Whether to display a close button
                gravity: 'top', // Toast position: 'top', 'bottom', 'center'
                position: 'right', // Toast position: 'left', 'center', 'right'
                backgroundColor: '#4CAF50', // Background color of the toast
                stopOnFocus: true // Whether to close the toast when focused
              }).showToast();
              
          }
         
      },
      error: function(error) {
        Toastify({
          text: "Failed add to wishlist",
          duration: 3000, // Duration in milliseconds
          close: true, // Whether to display a close button
          gravity: 'top', // Toast position: 'top', 'bottom', 'center'
          position: 'right', // Toast position: 'left', 'center', 'right'
          backgroundColor: '#4CAF50', // Background color of the toast
          stopOnFocus: true // Whether to close the toast when focused
        }).showToast();
          
          console.error('Error:', error);
      }
    });
  }



  function generateInvoice(orderId) {
   
  
    let fetchUrl = `/api/printInvoice?orderId=${orderId}`;

    $.ajax({
        url: fetchUrl,
        method: 'GET',
        xhrFields: {
            responseType: 'blob'
        },
        success: function(blob) {
            // If successful response, download the generated PDF
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "invoice.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        },
        error: function(xhr, status, error) {
            console.error("Failed to generate PDF report:", error);
        }
    });
}
        
function sortProducts(order) {
 
  const url = new URL(window.location.href);
  
    url.searchParams.set('sort', order);
   

   window.location.href = url.toString();
}


