!function(e){"use strict";if(e(".menu-item.has-submenu .menu-link").on("click",function(s){s.preventDefault(),e(this).next(".submenu").is(":hidden")&&e(this).parent(".has-submenu").siblings().find(".submenu").slideUp(200),e(this).next(".submenu").slideToggle(200)}),e("[data-trigger]").on("click",function(s){s.preventDefault(),s.stopPropagation();var n=e(this).attr("data-trigger");e(n).toggleClass("show"),e("body").toggleClass("offcanvas-active"),e(".screen-overlay").toggleClass("show")}),e(".screen-overlay, .btn-close").click(function(s){e(".screen-overlay").removeClass("show"),e(".mobile-offcanvas, .show").removeClass("show"),e("body").removeClass("offcanvas-active")}),e(".btn-aside-minimize").on("click",function(){window.innerWidth<768?(e("body").removeClass("aside-mini"),e(".screen-overlay").removeClass("show"),e(".navbar-aside").removeClass("show"),e("body").removeClass("offcanvas-active")):e("body").toggleClass("aside-mini")}),e(".select-nice").length&&e(".select-nice").select2(),e("#offcanvas_aside").length){const e=document.querySelector("#offcanvas_aside");new PerfectScrollbar(e)}e(".darkmode").on("click",function(){e("body").toggleClass("dark")})}(jQuery);



$(document).ready(function () {


  $('.form-control').focus(function () {
      $(this).removeClass('error');
      $('#errorMessage').text('');
  });

  //add category //edit category
  $('#cate-submit').click(function (e) {
      e.preventDefault()
      let nameRegex = /^(?=(.*[a-zA-Z]){3})[a-zA-Z0-9\s\-\_.]+$/;
      let data = new FormData($('#cate-form')[0]);

      let category_id = data.get("category_id");
      let category=data.get("category")
      let description=data.get("description")
       console.log(category.length);
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
if (category_id) {
    url = '/admin/editCategory'; 
    ajaxType = 'PATCH';
    action="edited"
} else {
    url = '/admin/addCategory'; 
    ajaxType = 'POST';
    action="added"
}
  
  $.ajax({
      type: ajaxType, 
      url: url,
      data:  $('#cate-form').serialize(),
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

  // add product 
  $('#product-submit').click(function (e) {
      e.preventDefault()
      let nameRegex = /[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*/;
      let data = new FormData($('#product-form')[0]);

      
      let pkProductId=data.get("pkProductId")
          console.log(pkProductId);
      let strProductName=data.get("strProductName")
      let strDescription=data.get("strDescription")
      let intPrice=data.get("intPrice")
      let intStock=data.get("intStock")
      let mainProductImg=data.get("mainProductImg")
      let otherProductImg1=data.get("otherProductImg1")
      let otherProductImg2=data.get("otherProductImg2")
     
   
    
        if (strProductName === ''|| strDescription=='' || !mainProductImg || !intPrice || !intStock || !otherProductImg1 || !otherProductImg2) {
      
          $('#errorMessage').text('Please fill in all fields.');
          $('.form-control').addClass('error') 

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
  url: $('#product-form').attr('action'),
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

  $("#login-submit").click(async function(e){
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
      url: '/admin/login',
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

$('#product-submit').click(function (e) {
  e.preventDefault()
  let nameRegex = /[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*/;
  let data = new FormData($('#product-form')[0]);

  
  let pkProductId=data.get("pkProductId")
      console.log(pkProductId);
  let strProductName=data.get("strProductName")
  let strDescription=data.get("strDescription")
  let intPrice=data.get("intPrice")
  let intStock=data.get("intStock")
  let mainProductImg=data.get("mainProductImg")
  let otherProductImg1=data.get("otherProductImg1")
  let otherProductImg2=data.get("otherProductImg2")
 


    if (strProductName === ''|| strDescription=='' || !mainProductImg || !intPrice || !intStock || !otherProductImg1 || !otherProductImg2) {
  
      $('#errorMessage').text('Please fill in all fields.');
      $('.form-control').addClass('error') 

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
url: $('#edit-product-form').attr('action'),
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


