const inputs = document.querySelectorAll("input"),
  button = document.querySelector("button");

// iterate over all inputs
inputs.forEach((input, index1) => {
  input.addEventListener("keyup", (e) => {
    // This code gets the current input element and stores it in the currentInput variable
    // This code gets the next sibling element of the current input element and stores it in the nextInput variable
    // This code gets the previous sibling element of the current input element and stores it in the prevInput variable
    const currentInput = input,
      nextInput = input.nextElementSibling,
      prevInput = input.previousElementSibling;

    // if the value has more than one character then clear it
    if (currentInput.value.length > 1) {
      currentInput.value = "";
      return;
    }
    // if the next input is disabled and the current value is not empty
    //  enable the next input and focus on it
    if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
      nextInput.removeAttribute("disabled");
      nextInput.focus();
    }

    // if the backspace key is pressed
    if (e.key === "Backspace") {
      $('#errorMessage').text('');
      // iterate over all inputs again
      inputs.forEach((input, index2) => {
        // if the index1 of the current input is less than or equal to the index2 of the input in the outer loop
        // and the previous element exists, set the disabled attribute on the input and focus on the previous element
        if (index1 <= index2 && prevInput) {
          input.setAttribute("disabled", true);
          input.value = "";
          prevInput.focus();
        }
      });
    }
    //if the fourth input( which index number is 3) is not empty and has not disable attribute then
    //add active class if not then remove the active class.
    if (!inputs[5].disabled && inputs[5].value !== "") {
      button.classList.add("active");
      return;
    }
    button.classList.remove("active");
  });
});


//focus the first input which index is 0 on window load
window.addEventListener("load", () => inputs[0].focus());

// JavaScript code
let countdown = 45; // Initial countdown value
const countdownDisplay = document.getElementById('countdown');
const resendButton = document.getElementById('resendButton');
const timerDisplay = document.getElementById('timer');

// Function to update countdown display
function updateCountdown() {
  countdown--;
  countdownDisplay.textContent = countdown;
  if (countdown <= 0) {
    clearInterval(timer);
    timerDisplay.style.display = 'none';
    resendButton.style.display = 'block';
  }
}

// Timer interval
const timer = setInterval(updateCountdown, 1000);

// Function to handle OTP resend
function resendOTP() {
  // Reset countdown
  countdown = 45;
  countdownDisplay.textContent = countdown;
  // Show timer and hide resend button
  timerDisplay.style.display = 'block';
  resendButton.style.display = 'none';
  // Restart timer
  setInterval(updateCountdown, 1000);
}

$(document).ready(function () {


  $('.form-control').focus(function () {
      $(this).removeClass('error');
      $('#errorMessage').text('');
  });

$('#submit-otp').click(function (e) {
  e.preventDefault()

  // let data = new FormData($('#otp-form')[0]);
  //  // Initialize an empty string to store the OTP
   let otp = '';
    
   // Iterate over each input field within the form
   $('#otp-form input[type="number"]').each(function() {
       // Append the value of each input field to the OTP
       otp += $(this).val();
   });
   
   
 

$.ajax({
  type: 'POST', 
  url: '/verifyOTP',
  data: {
    otp
  }, 
  success: function(response) {
      if (response.success) {
        console.log('success:', response.message);
        if(response.redirect=="home"){
          window.location.href="/"
        }else{
          window.location.href="/getResetPassword"
        }
        
      } else {
        console.log('falied:', response.message);
          $('#errorMessage').text(response.message)
      }
     
  },
  error: function(error) {
      
      console.error('Error:', error.message);
  }
});
  

});

 //resend otp
 $('#resendButton').click(async function (e) {
  e.preventDefault()
   resendOTP()

   $.ajax({
    type: 'POST',
    url: '/generateOTP', 
                          
    success: function(otpResponse) {
        if (otpResponse.success) {
          console.error('OTP generated:', otpResponse.message);
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
   
 

  

});


 
});
