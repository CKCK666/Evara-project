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

  let data = new FormData($('#signup-form')[0]);
    let email=data.get('email')
    let username=data.get("username")
    let password=data.get("password")
    let Cpassword=data.get("Cpassword")
      console.log(username,email,password,Cpassword);
  if (username === ''|| email === '' || password==="") {
  
      $('#errorMessage').text('Please fill in all fields.');
      $('.form-control').addClass('error') 

      return;
  }
  if(username.length<=3){
      $('#errorMessage').text('Name must be at least 4 characters long.');
      $('#username').addClass('error')   
      return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      $('#errorMessage').text('Invalid email format.');
      $('#email').addClass('error');
      return;
  }
  if(password.length<8){
     
      $('#errorMessage').text('Password must be at least 8 characters long.'); 
      $('#password').addClass('error') 
      return;
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
          data: { phoneNumber: '+917907497841' }, // Provide the user's phone number
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

 
});







