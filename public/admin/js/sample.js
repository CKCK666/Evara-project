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
                didClose: () => {
                    // Redirect to /admin route
                    window.location.href = '/admin';
                }
            });
            console.log('success:', response.message);
        } else {
            $('#errorMessage').text(response.message);
        }    
    },
    error: function(error) {            
        console.error('Error:', error);
    },
    beforeSend: function(xhr) {
        // Get the JWT token from local storage
        const token = localStorage.getItem('token');
        if (token) {
            // Set the Authorization header with the JWT token
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
    }
});
