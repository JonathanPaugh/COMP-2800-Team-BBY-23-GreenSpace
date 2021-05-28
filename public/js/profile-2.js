/******************************************/
/* This is javascript for profile-2.html */
/******************************************/
$(document).ready(() => {
    //read user profile information
    readProfileA();
    //click to submit profile information once user edited their profile information
    $('.user-form').submit(profile);
    $('#MyButton').click(profile);
})

//store user profile information to firebase
function profile(event) {
    event.preventDefault();
    withUser(user => {

        database.collection("users").doc(user.id).set({

            name: $(".name").val(),
            email: $(".email").val(),
            website: $(".web").val(),
            bio: $(".bio").val(),
            user: user.id
        }, { merge: true }).then(() => {
            redirect("/profile.html");
        });
    });
}

//display user information to user profile webpage
function readProfileA() {
    withUser(user => {
        $(".name").val(user.data().name),
            $(".email").val(user.data().email),
            $(".web").val(user.data().website),
            $(".bio").val(user.data().bio)
    })
}
