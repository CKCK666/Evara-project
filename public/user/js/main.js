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
    
    let email=data.get('email')
    let password=data.get("password")
     
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
      data: $('#login-form').serialize(), 
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

  let data = new FormData($('#signup-form')[0]);
    let email=data.get('email')
    let username=data.get("username")
    let password=data.get("password")
    let Cpassword=data.get("Cpassword")
    let phoneNumber=data.get("phno")
 
  
      console.log(username,email,password,Cpassword);
  if (username === ''|| email === '' || password==="" ||phoneNumber==="" ||Cpassword==="") {
  
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
if(phoneNumber.length<10 || phoneNumber.length>10){
  
  $('#errorMessage').text('Invalid phone number');
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
  data: $('#signup-form').serialize(), 
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
    let pincodeRegex = /^[1-9][0-9]{5}$/;
    let data = new FormData($('#add-address-form')[0]);
    let hasCheckbox = $("#add-address-form input[type='checkbox']").length > 0;

    // Serialize the form data
    let formData; // Declare formData variable

    if (hasCheckbox) {
        formData = $("#add-address-form").serializeArray(); // If checkbox exists, use serializeArray()
        var checkboxName = $("#add-address-form input[type='checkbox']").attr("name");
        var checkboxValue = $("#add-address-form input[type='checkbox']").is(":checked") ? "checked" : "unchecked";
        formData.push({ name: checkboxName, value: checkboxValue });
    } 
      

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
    
    if(city.legnth){
      $('#errorMessage').text('City name must 3 characters long.'); 
      $("input[name='city']").addClass('error');
   
      return
    }
  
   
  
  $.ajax({
    type: 'POST', 
    url: '/addAddress',
    data:  $("#add-address-form").serialize(), 
    success: function(response) {
        if (response.success) {
          console.log(response.pkUserId);
        //  window.location.href=`/userSettings?pkUserId=${response.pkUserId}`
        window.location.reload()
          
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
                window.location.href = `/userSetting?pkUserId=${response.pkUserId}`;
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
 $.ajax({
    type: 'POST', 
    url: '/checkOut',
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
        
        console.error('Error:', error);
    }
});


 
 
})

 //user edit address
 $('#edit-address-submit').click(function (e) {
  e.preventDefault()
  let nameRegex = /^(?=(.*[a-zA-Z]){3})[a-zA-Z0-9\s\-\_.]+$/;
  let pincodeRegex = /^[1-9][0-9]{5}$/;
  let data = new FormData($('#edit-address-form')[0]);
 let  data1= $("#edit-address-form").serialize()
  console.log(data1);
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
  
  if(city.legnth){
    $('#errorMessage').text('City name must 3 characters long.'); 
    $("input[name='city']").addClass('error');
 
    return
  }

 

$.ajax({
  type: 'POST', 
  url: '/editAddress',
  data:  $("#edit-address-form").serialize(), 
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



