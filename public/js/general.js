// Library for site-wide general functions //

/*
* Creates a JQuery element from the given tag name
*/
function createElement(element) {
    return $(`<${element}/>`);
}

/*
* Creates a div
*/
function createDiv() {
    return createElement("div");
}

/*
* Gets Url parmeters
*/ 
function getUrlQuery() {
    return new URLSearchParams(window.location.search);
}

/* Used a stackoverflow.com reference to build the 2 functions setUrlQuery and clearUrlQuery
* @author Fabio Nolasco @ stackoverflow.com
* @see https://stackoverflow.com/questions/10970078/modifying-a-query-string-without-reloading-the-page
*/

/*
* Reference Start
*/

/*
* Sets Url parmeter
*/ 
function setUrlQuery(name, value) {
    let query = getUrlQuery();
    query.set(name, value);
    let path = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.pushState({path: path}, "", path);
}

/*
* Clears Url parmeters
*/ 
function clearUrlQuery() {
    let path = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({path: path}, "", path);
}

/*
* Reference End
*/

/*
* Redirects the page
*/ 
function redirect(path) {
    window.location.assign(`${path}${window.location.search}`);
}

/*
* Redirects to login page if not logged in
*/ 
function requireLogin() {
    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            redirect("login.html");
        }
    });
}

/*
* Gets user then invokes callback with user data when data is obtained
*/ 
function withUser(callback) {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            database.collection("users").doc(user.uid).get().then(callback);
        } else {
            console.log("Cannot get user");
        }
    });
}

/*
* Fetches a file and returns file data
*/ 
function fetchFile(path, callback) {
    fetch(`${window.location.origin}/${path}`)
        .then(response => response.text())
        .then(callback);
}

/*
* Fetches a file using template path
*/ 
function fetchTemplate(path, callback) {
    fetchFile(`template/${path}`, callback);
}

/*
* Makes a server request
*/ 
function request(path, sData, success, fail) {
    $.ajax({
        url: path,
        type: "POST",
        data: sData,
        success: rData => success && success(rData),
        error: function (xhr, status, error) {
            if (fail) {
                fail(xhr);
            } else {
                console.log("Error:", xhr, status, error);
            }
        }
    });
}