function searchPlantInit(success, fail) {
    $(".search-button").click(event => searchPlant(event, success, fail));
    $(".search-form").submit(event => searchPlant(event, success, fail));
    $(".search-value").on("input", suggestPlant);
}

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

    $(".search-value").val("");
    $("#search-suggestions").empty();
}

function suggestPlant() {
    request("/suggest-plants", { query: $(".search-value").val() }, plants => {
        $("#search-suggestions").empty();
        if (!plants.length) { return; }
        new Set(plants).forEach(suggestion => {
            createElement("option").appendTo("#search-suggestions").val(suggestion);
        });
    });
}