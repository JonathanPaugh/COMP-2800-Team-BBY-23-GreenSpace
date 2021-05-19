// Script for site-wide page preparation //

$(document).ready(() => {

    // Inject FontAwesome
    $("head").append(createElement("link")
        .attr("rel", "stylesheet")
        .attr("href", "https://use.fontawesome.com/releases/v5.15.3/css/all.css")
        .attr("integrity", "sha384-SZXxX4whJ79/gErwcOYf+zWLeJdY/qpuqC4cAa9rOGUstPomtqpuNWT9wdPEn2fk")
        .attr("crossorigin","anonymous"));

    // Inject Main Styling
    $("head").append(createElement("link")
        .attr("rel", "stylesheet")
        .attr("href", "./css/main.css"));

    // Inject top navbar if not hidden
    if (!$("body").hasClass("hide-navbar-top")) 
    {
        fetchTemplate("navbar-top.html", data => {
            $("head").append(createElement("link").attr("rel", "stylesheet").attr("href", "/css/navbar-top.css"));
            $("body").prepend(data);
        });
    }

    // Inject bottom navbar if not hidden
    if (!$("body").hasClass("hide-navbar-bottom")) 
    {
        fetchTemplate("navbar-bottom.html", data => {
            $("head").append(createElement("link").attr("rel", "stylesheet").attr("href", "/css/navbar-bottom.css"));
            $("script").first().before(data);
        });
    }

    if (localStorage.getItem("invert") == "true") {
        invert();
    }
});

/* Used a stackoverflow.com reference to build the invert function
* @author community wiki (leosok, ggorlen) @ stackoverflow.com
* @see https://stackoverflow.com/questions/4766201/javascript-invert-color-on-all-elements-of-a-page
*/

/*
* Reference Start
*/

function invert() { 
    head = document.getElementsByTagName("head")[0],
    style = document.createElement("style");

    let css = "html {"
        + "-webkit-filter: invert(100%);"
        + "-moz-filter: invert(100%);"
        + "-o-filter: invert(100%);"
        + "-ms-filter: invert(100%);"
        + "}"

    style.type = "text/css";
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
};

/*
* Reference End
*/