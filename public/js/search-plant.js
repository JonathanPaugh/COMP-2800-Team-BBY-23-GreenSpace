// Modular plant search script that can be used across site //

/*
* The most recent suggestion options from search
*/
var recentSuggestions;

/*
* Inits the plant search with success and fail callbacks
*/
function searchPlantInit(success, fail) {
    $(".search-button").click(event => searchPlant(event, success, fail));
    $(".search-form").submit(event => searchPlant(event, success, fail));
    $(".search-value").on("input", suggestPlant);
    $(".search-value").on("change", event => {
        recentSuggestions.forEach(suggestion => {
            if ($(".search-value").val() == suggestion.value) {
                searchPlantId(event, suggestion.id, success, fail);
                return;
            }
        });
    });
}

/*
* Attempts to search for a plant using input from search box
* Makes a request to server, will call the success callback if there is resulting data
*   else it will call the fail callback
*/
function searchPlant(event, success, fail) {
    event?.preventDefault();

    let query = $(".search-value").val();
    let pattern = /\((.*?)\)/;

    if (query.match(pattern)) {
        query = query.match(pattern)[1];
    }
    
    request("/search-plant", { query: query }, plant => {
        if (success) {
            success(plant, query);
        }
    }, error => {
        if (fail) {
            fail(error);
        } else {
            console.log(error);
        }
    });

    searchReset();
}

/*
* Attempts to search for a plant using a unique plant id
* Makes a request to server, will call the success callback if there is resulting data
*   else it will call the fail callback
*/
function searchPlantId(event, id, success, fail) {
    event?.preventDefault();

    request("/search-plant", { id: id }, plant => {
        if (success) {
            success(plant, id);
        }
    }, error => {
        if (fail) {
            fail(error);
        } else {
            console.log(error);
        }
    });

    searchReset();
}

/*
* Resets the search box and suggestions
*/
function searchReset() {
    $(".search-value").val("");
    $("#search-suggestions").empty();
}

/*
* Suggests plants based on the current search box value using
*   data from a server request
*/
function suggestPlant() {
    request("/suggest-plants", { query: $(".search-value").val() }, plants => {
        $("#search-suggestions").empty();
        if (!plants.length) { return; }
        recentSuggestions = plants;
        recentSuggestions.forEach(suggestion => {
            createElement("option")
                .appendTo("#search-suggestions")
                .attr("id", suggestion.id)
                .val(suggestion.value);
        });
    });
}