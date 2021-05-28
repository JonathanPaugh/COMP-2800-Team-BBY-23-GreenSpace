// Used by search-plant.html to display plant information in page //

/*
* Inits the search, attempts to search from query if present,
*   and sets up page resize hack
*/
$(document).ready(() => {
    searchInit();
    querySearch();
    $(window).resize(resize);
});

/*
* Inits the plant search with success and error handlers
*/
function searchInit() {
    searchPlantInit(searchSuccess, searchError);
}

/*
* In case of plant search success, sets the url query 
*   and sends data to display plant information
*/
function searchSuccess(plant, search) {
    $(".plant-info").empty();
    
    setUrlQuery("search", search);
    
    createInfo(
        plant.primaryCommonName, 
        plant.scientificName,
        plant.speciesGlobal?.informalTaxonomy,
        plant.information?.snippet,
        plant.information?.link,
        {
            phyllum: plant.speciesGlobal?.phylum,
            class: plant.speciesGlobal?.taxclass,
            order: plant.speciesGlobal?.taxorder,
            family: plant.speciesGlobal?.family,
            genus: plant.speciesGlobal?.genus,
            species: plant.scientificName?.replace(plant.speciesGlobal.genus, "").trim()
        },
        plant.images
    );
}

/*
* In case of error when plant search result cannot be found
*/
function searchError(error) {
    console.log(error);
    $(".plant-info").empty();
    createDiv()
        .appendTo(".plant-info")
        .addClass("search-error card p-2 text-danger text-center")
        .html(error.responseText);
}

/*
* Creates a information box in page
*/
function createInfo(name, scientific, description, snippet, link, taxonomy, images) {
    fetchTemplate("plant-info.html", data => {
        let info = $(".plant-info").html(data);

        info.find(".plant-name").html(name);
        info.find(".plant-scientific").html(scientific);
        info.find(".plant-description").html(description);
        info.find(".plant-snippet").html(snippet);
        info.find(".plant-link").attr("href", link);

        info.find(".plant-taxonomy-phyllum").html(taxonomy.phyllum);
        info.find(".plant-taxonomy-class").html(taxonomy.class);
        info.find(".plant-taxonomy-order").html(taxonomy.order);
        info.find(".plant-taxonomy-family").html(taxonomy.family);
        info.find(".plant-taxonomy-genus").html(taxonomy.genus);
        info.find(".plant-taxonomy-species").html(taxonomy.species);

        if (images) {
            info.find(".plant-image").attr("src", images[0]).attr("alt", name);

            let width;
            images.slice(1).forEach(image => {
                let container = createDiv()
                    .appendTo(info.find(".plant-gallery"))
                    .addClass("plant-gallery-container");

                createElement("img")
                    .appendTo(container)
                    .addClass("plant-gallery-image")
                    .attr("src", image)
                    .attr("alt", name);

                width = container.width();
            });

            resize();
        }
    });
}

/*
* Searches with the url query value
*/
function querySearch() {
    let query = getUrlQuery().get("search");
    if (!query) {
        return;
    }
    if (query.startsWith("ELEMENT_GLOBAL")) {
        searchPlantId(null, query, searchSuccess, searchError);
    } else {
        $(".search-value").val(query);
        searchPlant(null, searchSuccess, searchError);
    }
}

/*
* Image resize hack to always keep images the correct width in grid rows
*/
function resize() {
    $(".plant-gallery").css("grid-auto-rows", $(".plant-gallery-container").width() + "px");
}

/*
* Test for inserting a dummy information box into page
*/
function testCreateInfo() {
    createInfo("TestName", "TestScientificName", "TestDescription", "TestSnippet", "TestLink", {
        phyllum: "TestPhyllum",
        class: "TestClass",
        order: "TestOrder",
        family: "TestFamily",
        genus: "TestGenus",
        species: "TestSpecies",
    }, 
    ["https://dummyimage.com/512x512/000/fff"]);
}