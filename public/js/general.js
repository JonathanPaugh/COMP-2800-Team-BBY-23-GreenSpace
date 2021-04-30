// Library for site-wide general functions //

// Creates a JQuery element from the given tag name
function createElement(element) {
    return $(`<${element}/>`);
}

// Creates a div
function createDiv() {
    return createElement("div");
}

// Gets Url parmeters
function getUrlQuery() {
    return new URLSearchParams(window.location.search);
}

// Sets Url parmeter
function setUrlQuery(name, value) {
    let query = getUrlQuery();
    query.set(name, value);
    let path = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.pushState({path: path}, "", path);
}

// Clears Url parmeters
function clearUrlQuery() {
    let path = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({path: path}, "", path);
}

// Redirects the page
function redirect(path) {
    window.location.assign(`${path}${window.location.search}`);
}

// Fetches a file and returns file data
function fetchFile(path, callback) {
    fetch(`${window.location.origin}/public/${path}`)
        .then(response => response.text())
        .then(callback);
}

// Fetches a file using template path
function fetchTemplate(path, callback) {
    fetchFile(`template/${path}`, callback);
}