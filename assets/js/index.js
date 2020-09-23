function signIn() {

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(result) {
            // result.user.tenantId should be ‘TENANT_PROJECT_ID’.
            console.log(result);
            window.location.href = "chat.html"
        }).catch(function(error) {
            // Handle error.
            console.log(error);
        });

}


function signUp() {

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(success) {
        Swal.fire({

                icon: 'success',
                title: 'Se ha registrado exitosamente',
                text: 'Seras redireccionado al chat, haz click aqui.',
                allowOutsideClick: false

            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    window.location.href = 'chat.html';
                }
            })
            // console.log(success);
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
            Swal.fire({

                icon: 'error',
                title: 'Error',
                text: errorMessage
            })
        } else {
            Swal.fire({

                icon: 'error',
                title: 'Error',
                text: errorMessage
            })
        }
        // console.log(error);
        return;
    });




}
