(function ($) {
    'use strict';
    /*Product Details*/
    var productDetails = function () {
        $('.product-image-slider').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: false,
            asNavFor: '.slider-nav-thumbnails',
        });

        $('.slider-nav-thumbnails').slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: '.product-image-slider',
            dots: false,
            focusOnSelect: true,
            prevArrow: '<button type="button" class="slick-prev"><i class="fi-rs-angle-left"></i></button>',
            nextArrow: '<button type="button" class="slick-next"><i class="fi-rs-angle-right"></i></button>'
        });

        // Remove active class from all thumbnail slides
        $('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');

        // Set active class to first thumbnail slides
        $('.slider-nav-thumbnails .slick-slide').eq(0).addClass('slick-active');

        // On before slide change match active thumbnail to current slide
        $('.product-image-slider').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            var mySlideNumber = nextSlide;
            $('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');
            $('.slider-nav-thumbnails .slick-slide').eq(mySlideNumber).addClass('slick-active');
        });

        $('.product-image-slider').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            var img = $(slick.$slides[nextSlide]).find("img");
            $('.zoomWindowContainer,.zoomContainer').remove();
            $(img).elevateZoom({
                zoomType: "inner",
                cursor: "crosshair",
                zoomWindowFadeIn: 500,
                zoomWindowFadeOut: 750
            });
        });
        //Elevate Zoom
        if ( $(".product-image-slider").length ) {
            $('.product-image-slider .slick-active img').elevateZoom({
                zoomType: "inner",
                cursor: "crosshair",
                zoomWindowFadeIn: 500,
                zoomWindowFadeOut: 750
            });
        }
        //Filter color/Size
        $('.list-filter').each(function () {
            $(this).find('a').on('click', function (event) {
                event.preventDefault();
                $(this).parent().siblings().removeClass('active');
                $(this).parent().toggleClass('active');
                $(this).parents('.attr-detail').find('.current-size').text($(this).text());
                $(this).parents('.attr-detail').find('.current-color').text($(this).attr('data-color'));
            });
        });
        //Qty Up-Down
        // $('.detail-qty').each(function () {
        //     var qtyval = parseInt($(this).find('.qty-val').text(), 10);
        //     $('.qty-up').on('click', function (event) {
        //         event.preventDefault();
        //         qtyval = qtyval + 1;
        //         $(this).prev().text(qtyval);
        //     });


        //     $('.qty-down').on('click', function (event) {
        //         event.preventDefault();
        //         qtyval = qtyval - 1;
        //         if (qtyval > 1) {
        //             $(this).next().text(qtyval);
        //         } else {
        //             qtyval = 1;
        //             $(this).next().text(qtyval);
        //         }
        //     });
        // });

        let cartSubTotalAmtText = $('#cart_subtotal').text();
        let cartSubTotalAmtValue = parseInt(cartSubTotalAmtText, 10);

        let cartTotalAmtText = $('#totalPrice').text();
        let cartTotalAmtValue = parseInt(cartTotalAmtText, 10);

        let cartCountText = $('#cartCount').text();
        let cartCountValue = parseInt(cartCountText, 10);
        
        

        $('.cart-product-details').each(function () {
            let qtyval = parseInt($(this).find('.qty-val').text(), 10);
            let productAmt=parseInt($(this).find('.price').text(),10)
            let productTotalAmt=parseInt($(this).find('.product-total-amount').text(),10)
            let pkProductId=$(this).find("#pkProductId").val()
           
            if (isNaN(productAmt) || isNaN(productTotalAmt)) {
                console.error("Product amount is not a valid number:", productAmt);
                return; // Exit the loop if productAmt is NaN
            }
            $('.qty-up', this).on('click', function (event) {
                event.preventDefault();
                if (qtyval < 10) {
                    qtyval = qtyval + 1;
                    $(this).prev().text(qtyval);
                    productTotalAmt=productAmt*qtyval
                    $(this).closest('.cart-product-details').find('.product-total-amount').text(productTotalAmt);
                    cartSubTotalAmtValue=cartSubTotalAmtValue+productAmt
                    cartTotalAmtValue=cartTotalAmtValue+productAmt
                    cartCountValue++

                    $('#cartCount').text(cartCountValue)
                    $('#cart_subtotal').text(cartSubTotalAmtValue)
                    $('#totalPrice').text(cartTotalAmtValue)

                    $.ajax({
                        type: 'POST',
                        url: '/changeQuantity',
                        data: {quantity:1,pkProductId },
                        success: function(response) {
                            if(response.success){
                             console.log("successfully update quantity");
                              
                            }
                        },
                        error: function(error) {
                            console.log(error.message);
                        }
                      });

                }
            });
        
            $('.qty-down', this).on('click', function (event) {
                event.preventDefault();
                if (qtyval > 1) {
                    qtyval = qtyval - 1;
                    $(this).next().text(qtyval);
                    productTotalAmt=productAmt*qtyval
                   
                    $(this).closest('.cart-product-details').find('.product-total-amount').text(productTotalAmt);
                    cartSubTotalAmtValue=cartSubTotalAmtValue-productAmt
                    cartTotalAmtValue=cartTotalAmtValue-productAmt
                    cartCountValue--

                    $('#cartCount').text(cartCountValue)

                    $('#cart_subtotal').text(cartSubTotalAmtValue)
                    $('#totalPrice').text(cartTotalAmtValue)
                    $.ajax({
                        type: 'POST',
                        url: '/changeQuantity',
                        data: {quantity:-1,pkProductId },
                        success: function(response) {
                            if(response.success){
                             console.log("successfully update quantity");
                              
                            }
                        },
                        error: function(error) {
                            console.log(error.message);
                        }
                      });




                }
            });
        });

        $('.dropdown-menu .cart_list').on('click', function (event) {
            event.stopPropagation();
        });
    };
    /* WOW active */
    new WOW().init();

    //Load functions
    $(document).ready(function () {
        productDetails();
    });

})(jQuery);