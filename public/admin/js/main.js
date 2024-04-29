!function(e){"use strict";if(e(".menu-item.has-submenu .menu-link").on("click",function(s){s.preventDefault(),e(this).next(".submenu").is(":hidden")&&e(this).parent(".has-submenu").siblings().find(".submenu").slideUp(200),e(this).next(".submenu").slideToggle(200)}),e("[data-trigger]").on("click",function(s){s.preventDefault(),s.stopPropagation();var n=e(this).attr("data-trigger");e(n).toggleClass("show"),e("body").toggleClass("offcanvas-active"),e(".screen-overlay").toggleClass("show")}),e(".screen-overlay, .btn-close").click(function(s){e(".screen-overlay").removeClass("show"),e(".mobile-offcanvas, .show").removeClass("show"),e("body").removeClass("offcanvas-active")}),e(".btn-aside-minimize").on("click",function(){window.innerWidth<768?(e("body").removeClass("aside-mini"),e(".screen-overlay").removeClass("show"),e(".navbar-aside").removeClass("show"),e("body").removeClass("offcanvas-active")):e("body").toggleClass("aside-mini")}),e(".select-nice").length&&e(".select-nice").select2(),e("#offcanvas_aside").length){const e=document.querySelector("#offcanvas_aside");new PerfectScrollbar(e)}e(".darkmode").on("click",function(){e("body").toggleClass("dark")})}(jQuery);



$(document).ready(function () {
let imageData=[]

  $('.form-control').focus(function () {
      $(this).removeClass('error');
      $('#errorMessage').text('');
  });

  //add category //edit category
  $('#cate-submit').click(function (e) {
      e.preventDefault()
      let nameRegex= /[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*/;
       let data = new FormData($('#cate-form')[0]);

      let category_id = data.get("category_id")
      let category=data.get("category").trim()
      let description=data.get("description").trim()
      
        if (category === ''|| description=='') {
      
          $('#errorMessage').text('Please fill in all fields.');
          $('.form-control').addClass('error') 

          return;
      }
      if(category.length<4){
          $('#errorMessage').text('Category name must be at least 4 characters long.');
          $("input[name='category-name']").addClass('error')   
          return;
      }

      if (!nameRegex.test(category)) {
        $('#errorMessage').text('Category name must contain at least three alphabetical character');
        $("input[name='category-name']").addClass('error');
        return;
    }

    if(description.length<5){
      $('#errorMessage').text('Description must be at least 5 characters long.');
      $("input[name='category-name']").addClass('error')   
      return;
  }
   
  if (!nameRegex.test(description)) {
    $('#errorMessage').text('Description must contain at least three alphabetical character');
    $("input[name='category-name']").addClass('error');
    return;
}
let url;
let ajaxType;
let action
let datas={}
if (category_id) {
    url = '/admin/editCategory'; 
    ajaxType = 'PATCH';
    action="edited"
    datas={
      category_id,
      category,
      description
    }
} else {
    url = '/admin/addCategory'; 
    ajaxType = 'POST';
    action="added",
    datas={
      category,
      description
    }
}
  console.log("datas:",datas);
  $.ajax({
      type: ajaxType, 
      url: url,
      data: datas,
      success: function(response) {
          if (response.success) {
              Swal.fire({
                  position: 'top-end',
                  icon: 'success',
                  title: `successfully ${action} a category`,
                  showConfirmButton: false,
                  timer: 1500,
                  didClose:()=>{
                window.location.href = '/admin/getCategoryPage';
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
      
    
  });


  $("#login-submit").click(async function(e){
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
      url: '/admin/login',
      data: {
        email,
        password
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
                window.location.href = '/admin';
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

$('#product-edit-submit').click(function (e) {
  e.preventDefault()
  let nameRegex = /[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*/;
  let data = new FormData($('#product-edit-form')[0]);

  
  let pkProductId=data.get("pkProductId")
  let strProductName=data.get("strProductName")
  let strDescription=data.get("strDescription")
  let intPrice=data.get("intPrice")
  let intStock=data.get("intStock")
  

   console.log(pkProductId,strDescription,strProductName,intPrice,intStock);


    if (strProductName === ''|| strDescription=='' || !intPrice || !intStock) {
  
      $('#errorMessage').text('Please fill in all fields.');
      $('.form-control').addClass('error') 

      return false;
  }
   
  
  if(strProductName.length<4){
      $('#errorMessage').text('Product name must be at least 4 characters long.');
      $("input[name='strProductName']").addClass('error')   
      return false;
  }

  if(intPrice<=0 ){
    $('#errorMessage').text('Invaild product price');
    $("input[name='intPrice']").addClass('error')   
    return false;
   }
   if (intStock.includes('.') || intStock <= 0){
    $('#errorMessage').text('Invaild product stock');
    $("input[name='intStock']").addClass('error')   
    return false;
   }


  if (!nameRegex.test(strProductName)) {
    $('#errorMessage').text('Product name must contain at least three alphabetical character');
    $("input[name='strProductName']").addClass('error');
    return false;
}

if(strDescription.length<5){
  $('#errorMessage').text('Description must be at least 5 characters long.');
  $("textarea[name='strDescription']").addClass('error')   
  return false;
}

if (!nameRegex.test(strDescription)) {
$('#errorMessage').text('Description must contain at least three alphabetical character');
$("textarea[name='strDescription']").addClass('error');
return false;
}
let swalLoader = Swal.fire({
  title: 'Loading...',
  allowOutsideClick: false,
  showConfirmButton: false,
  onBeforeOpen: () => {
      Swal.showLoading();
  }
});
console.log("edit client side");

// $('#product-form').submit()
$.ajax({
url: $('#product-edit-form').attr('action'),
data:data,
type: "POST",
processData: false,
contentType: false,
success: function(response) {
  if (response.success) {
    swalLoader.close()
      Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'successfully edited a product',
          showConfirmButton: false,
          timer: 1500,
          didClose:()=>{
         window.location.reload()
          }
        })
      console.log('success:', response.message);
  } else {
    swalLoader.close()
      $('#errorMessage').text(response.message)
  }
 
},
error: function(error) {
swalLoader.close()
  console.error('Error:', error);
}
});

return false;



});

$(".order-status-change-btn").click(function(e){
  const selectElement = document.getElementById('statusSelect');
  let orderStatusChange=selectElement.value;
  if(orderStatusChange==""){
    $('#errorMessage').text('Please select a status!!!!');
    return
  }

  let pkOrderId = $(this).data('pk-order-id');
  let pkUserId = $(this).data('pk-user-id');
 
 console.log(pkOrderId,pkUserId,orderStatusChange);


  
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-danger',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })
  
  swalWithBootstrapButtons.fire({
    title: `Want to make it ${orderStatusChange}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, make it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
        $.ajax({
            type: 'POST', 
            url: "/admin/orderStatusChange",
            data: {
              pkOrderId,
              pkUserId,
              orderStatusChange
            }, 
            success: function(response) {
                if (response.success) {
                    swalWithBootstrapButtons.fire(
                        'Updated!',
                        `Order is ${orderStatusChange}.`,
                        'success'
                      ).then(()=>{
                         window.location.href=`/admin/orderDetailsPage?pkOrderId=${pkOrderId}`
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




document.querySelectorAll('.inputImage').forEach(function(input, index) {
  input.addEventListener('change', function (e) {
    let inputName=input.name
    let form = document.getElementById("edit-product-image-form")
   
    if (window.location.pathname === "/admin/getAddProduct") {
      
      form=document.getElementById("add-product-image-form")
    }

  
    
    if (!form) {
      alert("Form element not found.");
      return;
  }

    var imageFile = e.target.files[0];
    var imageType = /^image\//;

    if (!imageType.test(imageFile.type)) {
      console.error('Please select an image file');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (event) {
      var img = new Image();
      img.src = event.target.result;
      img.onload = function () {
        var imagePreview = input.parentElement.querySelector('.image-preview');
        imagePreview.innerHTML = ''; // Clear previous image if any
        imagePreview.style.display = 'block'; // Show image preview
        imagePreview.appendChild(img);

        var cropper = new Cropper(img, {
          // No fixed aspect ratio
          crop: function (event) {
            // You can access cropped data here
            // Example: console.log(event.detail.x, event.detail.y, event.detail.width, event.detail.height, event.detail.rotate, event.detail.scaleX, event.detail.scaleY);
          }
        });

        // Show crop button and heading
        input.parentElement.querySelector('.cropButton').style.display = 'block';
        // input.parentElement.querySelector('.heading').style.display = 'block';

        input.parentElement.querySelector('.cropButton').addEventListener('click', function () {
          var croppedCanvas = cropper.getCroppedCanvas();
          var croppedPreview = input.parentElement.querySelector('.cropped-preview');
          croppedPreview.innerHTML = ''; // Clear previous preview if any
          croppedPreview.style.display = 'block'; // Show cropped image preview
          croppedPreview.appendChild(croppedCanvas);

          // Get the cropped image data
          // var croppedImageData = croppedCanvas
          croppedCanvas.toBlob((blob) => {
            const fileName = Date.now();
            const file = new File([blob], `${fileName}.jpg`, {
              type: "image/jpeg",
            });

            let inputToRemove = form.querySelector(`input[name="${inputName}"]`);
        
        
            if (inputToRemove) {
              inputToRemove.remove();
            
            } 

            if (window.FileList && window.DataTransfer) {
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              const input = document.createElement("input");
              input.type = "file";
              input.name = inputName;
              input.files = dataTransfer.files;
              form.appendChild(input);
              input.style.display = "none";
            } else {
              console.error(
                "FileList and DataTransfer are not supported in this browser."
              );
            }
          });
          
          
          // imageData.push({
          //   croppedImageData,
          //   // imageName,
          //   index:index+1
          // })
          // Send cropped image data and image name to backend
          // sendToBackend(croppedImageData, imageName, index + 1);
        });
      };
    };
    reader.readAsDataURL(imageFile);
  });
});





  // add product 
  $('#product-submit').click(function (e) {
    e.preventDefault()
  
   
    
    let nameRegex = /[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*/;
    let data = new FormData($('#product-form')[0]);
    let imageForm=new FormData($("#add-product-image-form")[0])
    imageForm.forEach((value, key) => {
      data.append(key, value);
  });

    // imageData.map((img)=>{
    //   data.append(`Image_${img.index}`,img.croppedImageData)
    // })

    console.log(data);
    
    for (let pair of data.entries()) {
      let [key, value] = pair;
      if (typeof value === 'string') {
          data.set(key, value.trim());
      }
  }


    
    let pkProductId=data.get("pkProductId")
        
    let strProductName=data.get("strProductName")
    let strDescription=data.get("strDescription")
    let intPrice=parseInt(data.get("intPrice"))
    let intStock=parseInt(data.get("intStock"))
  
   
   
      if (strProductName === ''|| strDescription=='' || !intPrice || !intStock) {
    
        $('#errorMessage').text('Please fill in all fields.');
        $('.form-control').addClass('error') 

        return false;
    }
     if(intPrice<=0){
      $('#errorMessage').text('Invaild product price');
      $("input[name='intPrice']").addClass('error')   
      return false;
     }
     if ( intStock <= 0){
      $('#errorMessage').text('Invaild product stock');
      $("input[name='intStock']").addClass('error')   
      return false;
     }
    
    if(strProductName.length<4){
        $('#errorMessage').text('Product name must be at least 4 characters long.');
        $("input[name='strProductName']").addClass('error')   
        return false;
    }

    if (!nameRegex.test(strProductName)) {
      $('#errorMessage').text('Product name must contain at least three alphabetical character');
      $("input[name='strProductName']").addClass('error');
      return false;
  }

  if(strDescription.length<5){
    $('#errorMessage').text('Description must be at least 5 characters long.');
    $("textarea[name='strDescription']").addClass('error')   
    return false;
}
 
if (!nameRegex.test(strDescription)) {
  $('#errorMessage').text('Description must contain at least three alphabetical character');
  $("textarea[name='strDescription']").addClass('error');
  return false;
}
let swalLoader = Swal.fire({
title: 'Loading...',
allowOutsideClick: false,
showConfirmButton: false,
onBeforeOpen: () => {
    Swal.showLoading();
}
});


// $('#product-form').submit()
$.ajax({
url:"/admin/addProduct",
data:data,
type: "POST",
processData: false,
contentType: false,
success: function(response) {
    if (response.success) {
      swalLoader.close()
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'successfully added a product',
            showConfirmButton: false,
            timer: 1500,
            didClose:()=>{
          window.location.href = '/admin/getAddProduct';
            }
          })
        console.log('success:', response.message);
    } else {
      swalLoader.close()
        $('#errorMessage').text(response.message)
    }
   
},
error: function(error) {
  swalLoader.close()
    console.error('Error:', error);
}
});

return false;


  
});



$('.product-edit-image').click(function(e){
  e.preventDefault()
  // let pkProductId = $("input[name='pkProductId']").val()
  const form = document.getElementById("edit-product-image-form");
  let pkProductId = $(this).data('product-id');
   let data = new FormData(form);

data.append('pkProductId',pkProductId)
 

let swalLoader = Swal.fire({
  title: 'Loading...',
  allowOutsideClick: false,
  showConfirmButton: false,
  onBeforeOpen: () => {
      Swal.showLoading();
  }
});

$.ajax({
  url:"/admin/editProductImages", 
  data:data,
  type: "POST",
  processData: false,
  contentType: false,
  success: function(response) {
    if (response.success) {
      swalLoader.close()
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'successfully edited a product',
            showConfirmButton: false,
            timer: 1500,
            didClose:()=>{
           window.location.href=`/admin/getProductEdit?pkProductId=${pkProductId}`
            }
          })
        console.log('success:', response.message);
    } else {
      swalLoader.close()
        $('#errorMessage').text(response.message)
    }
   
  },
  error: function(error) {
  swalLoader.close()
    console.error('Error:', error);
  }
  });



});



if(window.location.pathname === "/admin/getCreateCoupon"){
  document.getElementById("couponType").addEventListener("change", function () {
    var couponType = this.value;
    if (couponType === "products") {
      document.getElementById("categories").value = "none";
      document.getElementById("productsSection").style.display = "inline-block";
      document.getElementById("categoriesSection").style.display = "none";
    } else if (couponType === "categories") {
      document.getElementById("products").value = "none";
      document.getElementById("productsSection").style.display = "none";
      document.getElementById("categoriesSection").style.display =
        "inline-block";
    }
  });

  document
    .getElementById("generateCodeBtn")
    .addEventListener("click", function () {
      const randomCode = generateRandomCode();
      document.getElementById("code").value = randomCode;
    });
  }

  if (window.location.pathname.startsWith("/admin/getCouponEdit")) {
    document
      .getElementById("generateCodeBtn")
      .addEventListener("click", function () {
        const randomCode = generateRandomCode();
        document.getElementById("code").value = randomCode;
      });
  
    const product = document.getElementById("productValue").value;
    const category = document.getElementById("categoriesValue").value;
    const couponTypeSelect = document.getElementById("couponType");
    if (!product) {
      couponTypeSelect.value = "categories";
      document.getElementById("categories").value = category;
      document.getElementById("productsSection").style.display = "none";
      document.getElementById("categoriesSection").style.display = "inline-block";
    } else if (!category) {
      couponTypeSelect.value = "products";
      document.getElementById("products").value = product;
      document.getElementById("productsSection").style.display = "inline-block";
      document.getElementById("categoriesSection").style.display = "none";
    }
  
    document.getElementById("couponType").addEventListener("change", function () {
      var couponType = this.value;
      if (couponType === "products") {
        document.getElementById("categories").value = "none";
        document.getElementById("productsSection").style.display = "inline-block";
        document.getElementById("categoriesSection").style.display = "none";
      } else if (couponType === "categories") {
        document.getElementById("products").value = "none";
        document.getElementById("productsSection").style.display = "none";
        document.getElementById("categoriesSection").style.display =
          "inline-block";
      }
    });
  }


function generateRandomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codeLength = 8;
  let randomCode = "";
  for (let i = 0; i < codeLength; i++) {
    randomCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomCode;
}

//coupon submit
$('#couponCreateForm button[type="submit"]').click(function () {

  // Collect form data
  let formData = {
    name: $("#name").val(),
    code: $("#code").val(),
    description: $("#description").val(),
    discount: $("#discount").val(),
    minAmount: $("#minAmount").val(),
    maxDiscount: $("#maxDiscount").val(),
    startDate: $("#startDate").val(),
    endDate: $("#endDate").val(),
    usageLimit: $("#usageLimit").val(),
    couponType: $("#couponType").val(),
    products: $("#products").val(),
    categories: $("#categories").val(),
  };

  $.ajax({
    type: "POST",
    url: "/admin/createCoupon",
    data: formData,
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: `Coupon created`,
        }).then(function () {
          window.location.href = `/admin/getCreateCoupon`;
        });
      } else if (response.validation) {
        Swal.fire({
          icon: "info",
          title: `Invalid entry`,
        });
      } else if (response.filled) {
        Swal.fire({
          icon: "info",
          title: `Required fields contain only blank spaces`,
        });
      } else if (response.duplicate) {
        Swal.fire({
          icon: "info",
          title: `Duplicate Entry`,
        });
      }
    },
    error: function (xhr, status, error) {
      Swal.fire({
        icon: "info",
        title: `Some error occured`,
      });
      console.error("Error:", error);
    },
  });
  return false;
});


//edit coupon
$('#couponUpdateForm button[type="submit"]').click(function () {
 let coupnId= $("#coupnId").val()
  // Collect form data
  let formData = {
    coupnId: $("#coupnId").val(),
    name: $("#name").val(),
    code: $("#code").val(),
    description: $("#description").val(),
    discount: $("#discount").val(),
    minAmount: $("#minAmount").val(),
    maxDiscount: $("#maxDiscount").val(),
    startDate: $("#startDate").val(),
    endDate: $("#endDate").val(),
    usageLimit: $("#usageLimit").val(),
    couponType: $("#couponType").val(),
    products: $("#products").val(),
    categories: $("#categories").val(),
  };

  console.log(formData);

  $.ajax({
    type: "POST",
    url: "/admin/couponEdit",
    data: formData,
    success: function (response) {
      console.log(response);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: `Coupon updated`,
        }).then(function () {
          window.location.href=`/admin/getCouponEdit?_id=${coupnId}`;
        });
      } else if (response.validation) {
        Swal.fire({
          icon: "info",
          title: `Invalid entry`,
        });
      } else if (response.filled) {
        Swal.fire({
          icon: "info",
          title: `Required fields contain only blank spaces`,
        });
      } else if (response.duplicate) {
        Swal.fire({
          icon: "info",
          title: `Duplicate Entry`,
        });
      }

      console.log("Response:", response);
    },
    error: function (xhr, status, error) {
      Swal.fire({
        icon: "info",
        title: `Some error occured`,
      });
      console.error("Error:", error);
    },
  });
  return false;
});



if(window.location.pathname === "/admin/getCreateOffer"){
  document.getElementById("couponType").addEventListener("change", function () {
    var couponType = this.value;
    if (couponType === "products") {
      document.getElementById("categories").value = "none";
      document.getElementById("productsSection").style.display = "inline-block";
      document.getElementById("categoriesSection").style.display = "none";
    } else if (couponType === "categories") {
      document.getElementById("products").value = "none";
      document.getElementById("productsSection").style.display = "none";
      document.getElementById("categoriesSection").style.display =
        "inline-block";
    }
  });

  }


  if (window.location.pathname.startsWith("/admin/getOfferEdit")) {
    
  
    const product = document.getElementById("productValue").value;
    const category = document.getElementById("categoriesValue").value;
    const couponTypeSelect = document.getElementById("couponType");
    if (!product) {
      couponTypeSelect.value = "categories";
      document.getElementById("categories").value = category;
      document.getElementById("productsSection").style.display = "none";
      document.getElementById("categoriesSection").style.display = "inline-block";
    } else if (!category) {
      couponTypeSelect.value = "products";
      document.getElementById("products").value = product;
      document.getElementById("productsSection").style.display = "inline-block";
      document.getElementById("categoriesSection").style.display = "none";
    }
  
    document.getElementById("couponType").addEventListener("change", function () {
      var couponType = this.value;
      if (couponType === "products") {
        document.getElementById("categories").value = "none";
        document.getElementById("productsSection").style.display = "inline-block";
        document.getElementById("categoriesSection").style.display = "none";
      } else if (couponType === "categories") {
        document.getElementById("products").value = "none";
        document.getElementById("productsSection").style.display = "none";
        document.getElementById("categoriesSection").style.display =
          "inline-block";
      }
    });
  }


//offer submit
$('#offerCreateForm button[type="submit"]').click(function () {
console.log("hereeee");
  // Collect form data
  let formData = {
    name: $("#name").val(),
    description: $("#description").val(),
    discount: $("#discount").val(),
    minAmount: $("#minAmount").val(),
    maxDiscount: $("#maxDiscount").val(),
    startDate: $("#startDate").val(),
    endDate: $("#endDate").val(),
    offerType: $("#couponType").val(),
    products: $("#products").val(),
    categories: $("#categories").val(),
  };
 
  $.ajax({
    type: "POST",
    url: "/admin/createOffer",
    data: formData,
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: `Offer created`,
        }).then(function () {
          window.location.href = `/admin/getCreateOffer`;
        });
      } else if (response.validation) {
        Swal.fire({
          icon: "info",
          title: `Invalid entry`,
        });
      } else if (response.filled) {
        Swal.fire({
          icon: "info",
          title: `Required fields contain only blank spaces`,
        });
      } else if (response.duplicate) {
        Swal.fire({
          icon: "info",
          title: `Duplicate Entry`,
        });
      }
    },
    error: function (xhr, status, error) {
      Swal.fire({
        icon: "info",
        title: `Some error occured`,
      });
      console.error("Error:", error);
    },
  });
  return false;
});


});


//edit offer
$('#offerUpdateForm button[type="submit"]').click(function () {
 let offerId= $("#offerId").val()
   // Collect form data
   let formData = {
     offerId: $("#offerId").val(),
     name: $("#name").val(),
     description: $("#description").val(),
     discount: $("#discount").val(),
     minAmount: $("#minAmount").val(),
     maxDiscount: $("#maxDiscount").val(),
     startDate: $("#startDate").val(),
     endDate: $("#endDate").val(),
     offerType: $("#couponType").val(),
     products: $("#products").val(),
     categories: $("#categories").val(),
   };
 
   console.log(formData);
 
   $.ajax({
     type: "POST",
     url: "/admin/offerEdit",
     data: formData,
     success: function (response) {
       console.log(response);
       if (response.success) {
         Swal.fire({
           icon: "success",
           title: `Offer updated`,
         }).then(function () {
           window.location.href=`/admin/getOfferEdit?_id=${offerId}`;
         });
       } else if (response.validation) {
         Swal.fire({
           icon: "info",
           title: `Invalid entry`,
         });
       } else if (response.filled) {
         Swal.fire({
           icon: "info",
           title: `Required fields contain only blank spaces`,
         });
       } else if (response.duplicate) {
         Swal.fire({
           icon: "info",
           title: `Duplicate Entry`,
         });
       }
 
       console.log("Response:", response);
     },
     error: function (xhr, status, error) {
       Swal.fire({
         icon: "info",
         title: `Some error occured`,
       });
       console.error("Error:", error);
     },
   });
   return false;
 });



const handleDelete=(id,name)=>{
 console.log(id,name);
  let item=name=="category"?"category":name=="user"?"user":"product"
  let url=name=="category"?"/admin/deleteCategory":name=="user"?"/admin/deleteUser":"/admin/deleteProduct"
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
      })
      
      swalWithBootstrapButtons.fire({
        title: `Want to delete this ${item}?`,
        // text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: 'PATCH', 
                url: url,
                data: {
                  id:id
                }, 
                success: function(response) {
                    if (response.success) {
                        swalWithBootstrapButtons.fire(
                            'Deleted!',
                            'Your file has been deleted.',
                            'success'
                          ).then(()=>{
                            if(response.categoryDeleted){
                              window.location.href = '/admin/getCategoryPage';
                            }
                            if(response.userDeleted){
                              window.location.href = '/admin/listUsers';
                            }
                            if(response.productDeleted){
                              window.location.href='/admin/listProducts'
                            }
                          })
                         
                        console.log('success:', response.message);
                    } else {
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


    const handleBlock=(id,strStatus,name)=>{
      let item=name=="category"?"category":name=="user"?"user":"product"
      let url=name=="category"?"/admin/blockCategory":name=="user"?"/admin/blockUser":"/admin/blockProduct"
       
      let status=strStatus=="Active"?"block":"unblock"
      
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-success',
              cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
          })
          
          swalWithBootstrapButtons.fire({
            title: `Want to ${status}  this ${item}??`,
            // text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${status} it!`,
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: 'PATCH', 
                    url: url,
                     data: {
                        id,
                        strStatus
                     }, 
                    success: function(response) {
                        if (response.success) {
                            swalWithBootstrapButtons.fire(
                                `Success!`,
                                `${item} is  ${status}.`,
                                'success'
                              ).then(()=>{
                                if(response.userBlocked){
                                  window.location.href = '/admin/listUsers';
                                }
                                if(response.categoryBlocked){
                                  window.location.href = '/admin/getCategoryPage'
                                }
                                if(response.productBlocked){
                               
                                  window.location.href = '/admin/listProducts'
                                }
                              })
                             
                            console.log('success:', response.message);
                        } else {
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


        const handleBlockCoupon=(id,strStatus)=>{
     
           
          let status=strStatus=="Active"?"block":"unblock"
          let url="/admin/blockCoupon"
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: 'btn btn-success',
                  cancelButton: 'btn btn-danger'
                },
                buttonsStyling: false
              })
              
              swalWithBootstrapButtons.fire({
                title: `Want to ${status}  this Coupon??`,
                // text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: `Yes, ${status} it!`,
                cancelButtonText: 'No, cancel!',
                reverseButtons: true
              }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        type: 'PATCH', 
                        url: url,
                         data: {
                            id,
                            strStatus
                         }, 
                        success: function(response) {
                            if (response.success) {
                                swalWithBootstrapButtons.fire(
                                    `Success!`,
                                    `Coupon is  ${status}.`,
                                    'success'
                                  ).then(()=>{
                                   
                                   
                                       window.location.href = '/admin/listCoupons'
                                    
                                  })
                                 
                                console.log('success:', response.message);
                            } else {
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

    
            function reportTypeChanged() {
              var selectElement = document.querySelector('.sales-report');
              var selectedOptionValue = selectElement.value;
              console.log(selectedOptionValue);
            
              // Perform action based on the selected option
              switch (selectedOptionValue) {
                  case "daily":
                      daily();
                      break;
                  case "weekly":
                      // weekly();
                      break;
                  case "yearly":
                      yearly();
                      break;
                  case "custom":
                      customDate();
                      break;
                      case "all":
                        all();
                        break;
                  
                    
                  default:
                      // Default action
                      window.location.href="/admin"
              }
          }
                     


          function daily() {
          
         window.location.href="/admin/?sort=daily"
        }
        
        function weekly() {
        
          window.location.href="/admin/?sort=weekly"
        }
        
        function yearly() {
         
          window.location.href="/admin/?sort=yearly"
         
        }
        
        function customDate() {
        
          let elements = document.querySelectorAll(".custom-date");

          // Loop through each element
          elements.forEach(function(element) {
              // Change the style to display inline-block
              element.style.display = "inline-block";
          });
          // document.querySelector(".custom_select").style.display="none"
          document.querySelector(".custom-search").style.display="inline-block"


        }
    



        function all(){
          updateSelection("all");
          window.location.href="/admin/"
        }

       
      
        function updateHref() {
          var startDate = document.getElementById("start-date").value;
          var endDateInput = document.getElementById("end-date");
          var endDate = endDateInput.value;
          
         
          endDateInput.min = startDate;
          
    
          if (endDate < startDate) {
              endDateInput.value = startDate;
          }
          
          let searchLink = document.getElementById("search-link");
          searchLink.href = "/admin?start=" + startDate + "&end=" + endDate;
        }

        
//pdf generater
        async function pdfReport(){
          const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
         let sort = urlParams.get('sort');
         let start = urlParams.get('start');
         let end = urlParams.get('end');
         let fetchUrl='/admin/api/reports/pdf'
         if(sort!=null && sort!=""){
          fetchUrl=`/admin/api/reports/pdf?sort=${sort}`
         }
        if(start!=null && start!="" && end!=null && end!=""){
          fetchUrl=`/admin/api/reports/pdf?start=${start}&end=${end}`
        }
        
          try {
            const response = await fetch(fetchUrl);
            if (response.ok) {
              // If successful response, download the generated PDF
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "sales-report.pdf";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            } else {
              console.error("Failed to generate PDF report:", response.statusText);
            }
          } catch (error) {
            console.error("Error generating PDF report:", error);
          }
        }
        

        async function excelReport() {
          const queryString = window.location.search;
          const urlParams = new URLSearchParams(queryString);
           let sort = urlParams.get('sort');
           let start = urlParams.get('start');
           let end = urlParams.get('end');
           let fetchUrl='/admin/api/reports/excel'
           if(sort!=null && sort!=""){
            fetchUrl=`/admin/api/reports/excel?sort=${sort}`
           }
          if(start!=null && start!="" && end!=null && end!=""){
            fetchUrl=`/admin/api/reports/excel?start=${start}&end=${end}`
          }
          
          try {
            const response = await fetch(fetchUrl);
            if (response.ok) {
              // If successful response, download the generated Excel file
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "sales-report.xlsx"; // Adjust the file name if needed
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            } else {
              console.error("Failed to generate Excel report:", response.statusText);
            }
          } catch (error) {
            console.error("Error generating Excel report:", error);
          }
        }