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

$("#place-order-btn").click(async function(e){
  e.preventDefault()
  const radioButtons = document.querySelectorAll('input[type="radio"][name="shipping-address"]');
  let pkAddressId;

  //get default addressId
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

  if(!pkAddressId.length){
    $('#errorMessage').text('Select a shipping address');
    return
  }
  
 $.ajax({
    type: 'POST', 
    url: '/checkOut',
    data:{
      pkAddressId
    },
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












 
});

const deleteAddress=(addressId,userId,render)=>{

  console.log("hereee",addressId,userId);

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
    console.log(pkProductId,pkUserId);
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
            
          } else {
              $('#errorMessage').text(response.message)
          }
         
      },
      error: function(error) {
          
          console.error('Error:', error);
      }
    });
  }



