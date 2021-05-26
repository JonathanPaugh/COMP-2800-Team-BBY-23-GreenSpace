/*
* Displays a sign up message if user is not logged in
*   else displays a welcome message with quick links
*/
$(document).ready(() => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            fetchTemplate("main-welcome.html", data => {
                $("#main").html(data);
                $(".main-logout").click(logout);
            });
        } else {
            fetchTemplate("main-login.html", data => {
                $("#main").html(data);
            });
        }
    });
});

/*
* Logs user out of session and reloads page
*/
function logout() {
    firebase.auth().signOut().then(() => {
        redirect("index.html");
    });
}